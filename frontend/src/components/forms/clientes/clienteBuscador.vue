<template>
  <VCard class="col-12 mx-auto">
    <VCardText>
      <!-- titulo -->
      <div class="stch-clientebuscador-hero-left">
        <h1 class="stch-clientebuscador-title">Buscar cliente</h1>
        <p class="stch-clientebuscador-lead">
          Encuentra clientes por nombre, RFC o CURP — escribe al menos
          {{ minChars }} caracteres.
        </p>
      </div>

      <!-- Input de busqueda (chip + campo + botón en la misma línea) -->
      <div class="stch-clientebuscador-search">
        <div class="stch-clientebuscador-search-left">
          <span aria-hidden="true">Clientes</span>

          <VTextField
            class="stch-clientebuscador-vtextfield"
            variant="outlined"
            id="stch-cb-input"
            ref="inputEl"
            v-model="query"
            :placeholder="'Buscar por nombre, CURP o RFC ...'"
            @keydown.enter.prevent="onEnter"
            aria-label="Buscar por nombre, CURP o RFC"
            autocomplete="off"
          />
        </div>
        <div class="stch-clientebuscador-search-right">
          <VBtn
            class="stch-clientebuscador-btn"
            variant="tonal"
            @click="doSearch"
            :disabled="loading"
          >
            <VIcon end class="font-bold" icon="tabler-search" size="20" />
            <span class="ml-2">Buscar</span>
          </VBtn>
        </div>
      </div>

      <!-- Mensaje de conteo -->
      <!-- prettier-ignore -->
      <p class="stch-clientebuscador-count">{{ displayCountText }}</p>

      <!-- registros encontrados -->
      <div
        class="stch-clientebuscador-listwrap"
        role="region"
        aria-label="Resultados de búsqueda"
      >
        <ul
          class="stch-clientebuscador-list"
          role="listbox"
          :aria-activedescendant="activeDescId"
          tabindex="-1"
        >
          <!-- prettier-ignore -->

          <li v-if="loading" class="stch-clientebuscador-status">Cargando...</li>

          <!-- prettier-ignore -->
          <li v-else-if="error" class="stch-clientebuscador-status stch-clientebuscador-error">
            <span>{{ error }}</span>
            <button
              class="stch-clientebuscador-retry"
              @click="doSearchImmediate"
              type="button"
            >
              Reintentar
            </button>
          </li>

          <li
            v-else-if="displayItems.length === 0"
            class="stch-clientebuscador-status"
          >
            No se encontraron clientes
          </li>

          <li
            v-for="(item, idx) in displayItems"
            :key="item.id ?? idx"
            :id="`stch-cb-item-${idx}`"
            :class="[
              'stch-clientebuscador-item',
              {
                'stch-focused': idx === focusedIndex,
                'stch-selected': selectedItem && selectedItem.id === item.id,
              },
            ]"
            role="option"
            :aria-selected="
              idx === focusedIndex ||
              (selectedItem && selectedItem.id === item.id)
            "
            tabindex="-1"
            @click="onSelect(item, idx)"
            @mousemove="focusedIndex = idx"
          >
            <div class="stch-clientebuscador-item-main">
              <div class="stch-clientebuscador-name">{{ item.nombre }}</div>
              <div class="stch-clientebuscador-meta">
                <span class="stch-clientebuscador-curp"
                  >CURP: {{ item.curp || "—" }}</span
                >
                <span class="stch-dot">•</span>
                <span class="stch-clientebuscador-curp"
                  >RFC: {{ item.rfc || "—" }}</span
                >
              </div>
            </div>
            <div class="stch-clientebuscador-arrow" aria-hidden="true">›</div>
          </li>
        </ul>
      </div>

      <!-- Acciones: continuar cuando un elemento esté seleccionado -->
      <div class="stch-clientebuscador-actions">
        <VBtn color="secondary" variant="outlined" @click="onCancelar">
          Cancelar
        </VBtn>
        <VBtn color="primary" :disabled="!selectedItem" @click="onContinue">
          Continuar
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { customRequest } from "@/utils/axiosInstance";
import { computed, onMounted, ref } from "vue";
import { VBtn, VCard, VCardText, VIcon, VTextField } from "vuetify/components";

const props = withDefaults(
  defineProps<{
    isCliente?: boolean;
  }>(),
  {
    isCliente: true, // default to true if not provided
  }
);

const ejemploRegistros = [
  {
    id: 1,
    nombre: "Sofía Ramírez",
    rfc: "RMSF900101XXX",
    curp: "RAMS900101HDFLRR04",
    correo: "sofia.ramirez@email.com",
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    rfc: "MNC970505YYY",
    curp: "MENC970505HDFRRL09",
    correo: "carlos.mendoza@email.com",
  },
  {
    id: 3,
    nombre: "Ana López",
    rfc: "LANA850312AAA",
    curp: "LOPA850312MDFRPN02",
    correo: "ana.lopez@email.com",
  },
  {
    id: 4,
    nombre: "Ricardo García",
    rfc: "GARC880720BBB",
    curp: "GARC880720HDFRRC07",
    correo: "ricardo.garcia@email.com",
  },
  {
    id: 5,
    nombre: "Isabel Torres",
    rfc: "TOSI940910CCC",
    curp: "TOSI940910MDFRRS01",
    correo: "isabel.torres@email.com",
  },
  {
    id: 6,
    nombre: "Javier Hernández",
    rfc: "HEJA820201DDD",
    curp: "HEJA820201HDFRNR05",
    correo: "javier.hernandez@email.com",
  },
  {
    id: 7,
    nombre: "María Fernández",
    rfc: "FEMA990415EEE",
    curp: "FERM990415MDFRNS03",
    correo: "maria.fernandez@email.com",
  },
];

const emit = defineEmits<{
  (e: "cancelar"): void;
  (e: "select", item: any): void;
}>();

const query = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const results = ref<any[]>([]);
const hasSearched = ref(false);
const showCount = ref(false);
const focusedIndex = ref(-1);
const inputEl = ref<any | null>(null);
const selectedItem = ref<any | null>(null);

const displayItems = computed(() => results.value);
const minChars = computed(() => 3);
const activeDescId = computed<string | undefined>(() =>
  focusedIndex.value >= 0 ? `stch-cb-item-${focusedIndex.value}` : undefined
);
const displayCountText = computed(
  () => `${displayItems.value.length} resultados encontrados`
);

async function doSearch() {
  const term = (query.value || "").trim();
  //   hasSearched.value = true;
  //   if (!term || term.length < minChars.value) {
  //     results.value = [];
  //     error.value = null;
  //     loading.value = false;
  //     focusedIndex.value = -1;
  //     return;
  //   }

  loading.value = true;
  error.value = null;
  focusedIndex.value = -1;

  // Prepare a request payload and avoid reusing the name 'payload' for the response.
  const requestData = {
    referencia: term,
    isCliente: props.isCliente,
  };

  try {
    const resp = await customRequest({
      url: "/api/clientes/search",
      method: "POST",
      data: requestData,
    });

    const respData = resp.data;
    showCount.value = true;
    if (respData && respData.result) {
      results.value = Array.isArray(respData.data) ? respData.data : [];
    } else {
      results.value = [];
      error.value = respData?.message || "Error en la búsqueda";
    }
  } catch (err: any) {
    results.value = [];
    error.value = err?.message || "Error de red";
  } finally {
    loading.value = false;
    if (results.value.length) focusedIndex.value = 0;
  }
}

// Quick mock search for demo: populate with ejemploRegistros
function doSearchImmediate() {
  results.value = ejemploRegistros.slice();
  hasSearched.value = true;
  error.value = null;
  loading.value = false;
  focusedIndex.value = results.value.length ? 0 : -1;
  // keep selection cleared when new search runs
  selectedItem.value = null;
}

function onSelect(item: any, idx?: number) {
  selectedItem.value = item;
  if (typeof idx === "number") focusedIndex.value = idx;
  emit("select", item);
}

function onContinue() {
  if (!selectedItem.value) return;
  emit("select", selectedItem.value);
}

function onCancelar() {
  emit("cancelar");
}
function onEnter() {
  if (focusedIndex.value >= 0 && displayItems.value[focusedIndex.value]) {
    onSelect(displayItems.value[focusedIndex.value], focusedIndex.value);
  } else {
    doSearchImmediate();
  }
}

onMounted(() => {
  // optional: focus input
  // inputEl.value?.focus();
});
</script>

<style scoped>
/* Estilos completos - pegar dentro del <style scoped> del componente */

/* Variables */
:root {
  --cb-item-height: 56px; /* altura usada para calcular 5 elementos visibles */
  --cb-primary: #0b63a8;
  --cb-bg: #ffffff;
  --cb-muted: #6b7c86;
  --cb-border: #e6edf0;
  --cb-radius: 10px;
  --cb-shadow: 0 6px 18px rgba(15, 23, 32, 0.06);
}

/* Contenedor principal */
.stch-clientebuscador-root {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 18px 12px;
  box-sizing: border-box;
  background: transparent;
}
.stch-clientebuscador-container {
  width: 100%;
  max-width: 920px;
  box-sizing: border-box;
}

/* Encabezado */
.stch-clientebuscador-title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.05;
  font-weight: 800;
  color: #0f1720;
}
.stch-clientebuscador-lead {
  margin: 6px 0 0;
  color: var(--cb-muted);
  font-size: 0.95rem;
}

/* Row de búsqueda */
.stch-clientebuscador-search {
  display: flex;
  margin-top: 10px;
  gap: 12px;
  align-items: center;
  margin-bottom: 5px;
  width: 100%;
}
.stch-clientebuscador-search-left {
  flex: 1 1 0%;
}
/* Alinea el botón al final (abajo) del área de búsqueda */
.stch-clientebuscador-search-right {
  margin-top: auto;
}
.stch-clientebuscador-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(11, 99, 168, 0.06);
  color: var(--cb-primary);
  font-weight: 700;
  font-size: 0.85rem;
  border: 1px solid rgba(11, 99, 168, 0.12);
  white-space: nowrap;
}

/* TextField (wrapper de Vuetify) */
.stch-clientebuscador-vtextfield {
  flex: 1 1 0%;
  min-width: 0;
  box-sizing: border-box;
}
.stch-clientebuscador-vtextfield .v-input,
.stch-clientebuscador-vtextfield .v-field,
.stch-clientebuscador-vtextfield .v-text-field,
.stch-clientebuscador-vtextfield .v-input__control {
  width: 100%;
  box-sizing: border-box;
}
.stch-clientebuscador-vtextfield input[type="text"],
.stch-clientebuscador-vtextfield .v-field__input,
.stch-clientebuscador-vtextfield .v-input__slot input,
.stch-clientebuscador-vtextfield .v-text-field__slot input {
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  width: 100%;
  border-radius: 8px;
}

/* Botón */
.stch-clientebuscador-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  height: 44px;
  border-radius: 10px;
  background: var(--cb-primary);
  color: #fff;
  border: none;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--cb-shadow);
}
.stch-clientebuscador-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

/* Mensaje de conteo */
.stch-clientebuscador-count {
  color: var(--cb-muted);
  font-size: 12px;
  margin: 5px 0 10px;
}

/* ----- Contenedor de lista: FORCE 5 visibles, resto por scroll ----- */
/* El elemento que hace scroll será el wrapper (listwrap) */
.stch-clientebuscador-listwrap {
  border: 1px solid var(--cb-border);
  border-radius: var(--cb-radius);
  background: var(--cb-bg);
  box-shadow: var(--cb-shadow);
  overflow: hidden; /* mantenemos overflow en wrapper, el scroll lo forzamos en el UL */
  /* no usar max-height aquí si Vuetify envuelve la UL; el UL recibe la altura. */
}

/* UL será el scrollable con altura de 5 items */
.stch-clientebuscador-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: block; /* forzar block para comportamiento consistente */
  max-height: calc(var(--cb-item-height) * 5) !important; /* 5 items visibles */
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
}

/* Cada LI debe tener altura fija y no crecer (importante) */
.stch-clientebuscador-list > li,
.stch-clientebuscador-list > * {
  box-sizing: border-box;
  flex: 0 0 auto !important;
  height: var(--cb-item-height) !important;
  min-height: var(--cb-item-height) !important;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--cb-border);
}

/* Último item sin borde inferior */
.stch-clientebuscador-list > li:last-child,
.stch-clientebuscador-list > *:last-child {
  border-bottom: 0;
}

/* Si Vuetify inyecta elementos internos con clases propias, evitar que rompan la altura */
.stch-clientebuscador-list .v-list-item,
.stch-clientebuscador-list .v-item,
.stch-clientebuscador-list .v-list-item__content {
  height: 100% !important;
  min-height: 0 !important;
  flex: 0 0 auto !important;
}

/* Contenido del item */
.stch-clientebuscador-item-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}
.stch-clientebuscador-name {
  font-weight: 600;
  color: #0f1720;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stch-clientebuscador-meta {
  font-size: 13px;
  color: var(--cb-muted);
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* Hover, foco y selección */
.stch-clientebuscador-item:hover {
  background: rgba(11, 99, 168, 0.03);
  transform: translateY(-1px);
}
.stch-focused {
  background: rgba(11, 99, 168, 0.05);
  outline: none;
  border-radius: 6px;
  box-shadow: inset 0 0 0 3px rgba(11, 99, 168, 0.06);
}
.stch-selected {
  background: rgba(11, 99, 168, 0.08);
  border-left: 3px solid var(--cb-primary);
  padding-left: 13px;
}

/* Estados / errores */
.stch-clientebuscador-status {
  padding: 14px;
  color: var(--cb-muted);
  display: flex;
  gap: 12px;
  align-items: center;
  height: auto;
  min-height: var(--cb-item-height);
}
.stch-clientebuscador-error {
  color: #b32626;
}

/* Scrollbar (opcional, webkit) */
.stch-clientebuscador-list::-webkit-scrollbar {
  width: 10px;
}
.stch-clientebuscador-list::-webkit-scrollbar-thumb {
  background: rgba(11, 99, 168, 0.12);
  border-radius: 6px;
}
.stch-clientebuscador-list::-webkit-scrollbar-track {
  background: transparent;
}

/* Acciones */
.stch-clientebuscador-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
.stch-clientebuscador-continue {
  min-width: 140px;
}

/* Responsive: en pantallas pequeñas apilar */
@media (max-width: 640px) {
  .stch-clientebuscador-search {
    flex-direction: column;
    align-items: stretch;
  }
  .stch-clientebuscador-btn {
    width: 100%;
  }
  /* permitir un poco más de altura visible en móvil (opcional) */
  .stch-clientebuscador-list {
    max-height: calc(var(--cb-item-height) * 5) !important;
  }
}
</style>
