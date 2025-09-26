<template>
  <div>
    <div v-if="propuestas && propuestas.length">
      <div v-if="addingCotizacion" class="w-100">
        <h2 class="title wFull text-center">Selecciona las compañias</h2>
        <div class="divRows mt-3">
          <!-- prettier-ignore -->
          <div
            v-for="item in props.companias"
            :key="item"
            class="mb-5 card cardCompania"
            @click="handleSelectCompania(item)"
            :class="{ ' activeItem ': isItemSelected(companiasSeleccionadas, item, 'compania_id') }"
          >
            <!-- prettier-ignore -->
            <p class="p-0 m-0 fontBold"> {{ item.companiaCorto }} </p>
          </div>
        <!-- prettier-ignore -->
        </div>
        <div class="d-flex justify-space-between w-100 mt-5">
          <div>
            <VBtn color="dark" variant="outlined" @click="handleCancelarAgregarCotizaciones">
            Cancelar
          </VBtn>
          </div>
          <div>
            <!-- prettier-ignore -->
            <VBtn
              :disabled=" !(companiasSeleccionadas || []).length "
              @click="handleAgregarCotizacion"
            >
              Agregar cotizaciones
            </VBtn>
          </div>
        </div>
      </div>
      <div v-else class="w-75 mx-auto">
        <div class="d-flex align-center justify-space-between mb-2">
          <h2 class="title wFull text-rigth">Propuestas de Seguro</h2>
          <div class="d-flex align-center" style="gap: 0.7rem;">
            <VIcon start icon="tabler-plus"  color="primary" @click="handleAddCotizacion" />
            <VIcon v-if="propuestas.length > 1" start icon="tabler-eraser"  color="danger" @click="() => moodDelete = true" />
          </div>
        </div>
        <div class="propuestas-list-horizontal">
          <div v-for="item in propuestas" :key="item.id">
            <!-- prettier-ignore -->
            <div
              class="propuesta-card  card"
              :class="{ ' activeItem ': isItemSelected(seleccionadas, item, 'id') }"
            >
              <div v-if="item.msgError" class="detalle-row error-row">
                <span class="detalle-key text-danger">Error:</span>
                <span class="detalle-value text-danger">{{ item.msgError }}</span>
              </div>
              <div class="propuesta-card-horizontal">
                <!-- Columna 1: Checkbox -->
                <div class="col-check" >
                  <input
  
                    v-if="typeof item.inicial !== 'undefined' && item.inicial == false"
                    type="checkbox"
                    :checked="seleccionadas.includes(item.id)"
                    @change="seleccionar(item)"
                    class="custom-checkbox"
                  />
                </div>
                <!-- Columna 2: Datos (diseño original) -->
                <div class="col-datos flex-grow-1">
                  <div class="propuesta-header-horizontal">
                    <span class="nombre-compania">{{ item.companiaCorto }}</span>
                  </div>
                  <div v-if="item.vehiculo" class="propuesta-header-horizontal">
                    Vehiculo: <span class="nombre-compania">{{ item.vehiculo.marca }} {{ item.vehiculo.modelo }} ({{ item.vehiculo.anio }})</span>
                  </div>
                  <div v-if="item.vehiculo?.version ?? false" class="propuesta-header-horizontal">
                    Version: <span class="nombre-compania">{{ item.vehiculo.version }}</span>
                  </div>
                  <div v-if="typeof item.inicial !== 'undefined' && item.inicial == false && item.detalles" class="propuesta-detalles-horizontal">
                    <div class="detalle-row">
                      <span class="detalle-key">Núm de Cotizacion:</span>
                      <span class="detalle-value">{{
                        item.detalles.numeroCotizacion
                      }}</span>
                    </div>
                    <div class="detalle-row">
                      <span class="detalle-key">Prima neta:</span>
                      <span class="detalle-value">{{
                        item.detalles.primaNeta
                      }}</span>
                    </div>
                    <div class="detalle-row">
                      <span class="detalle-key">Derechos de póliza:</span>
                      <span class="detalle-value">{{
                        item.detalles.expedicionPoliza
                      }}</span>
                    </div>
                    <div class="detalle-row">
                      <span class="detalle-key">IVA:</span>
                      <span class="detalle-value">{{ item.detalles.iVA }}</span>
                    </div>
                  </div>
                </div>
                <!-- Columna 3: Iconos -->
                <div class="">
                   <div v-if="!moodDelete" class="col-iconos">
                     <i
                     v-if="typeof item.inicial !== 'undefined' && item.inicial == false"
                       class="fa fa-exclamation-circle font22 icono-accion text-info"
                       :title="
                         abiertos.includes(item.id)
                           ? 'Ocultar detalle'
                           : 'Ver detalle'
                       "
                       @click="toggleAcordeon(item.id)"
                       style="cursor: pointer"
                     />
                     <a
                       v-if="item?.detalles?.archivo"
                       :href="item.detalles.archivo"
                       target="_blank"
                       rel="noopener"
                       class="btn-icon"
                       :title="'Descargar PDF'"
                     >
                       <i
                         class="fa fa-download font22 text-secondary"
                         aria-hidden="true"
                       ></i>
                     </a>
                     <i
                       class="fa fa-pencil font22 icono-accion text-warning"
                       aria-hidden="true"
                       title="Editar"
                       @click="editarPropuesta(item)"
                     />

                   </div>
                   <div v-else class="col-iconos">
                    
                     <i
                       class="fa fa-eraser font22 icono-accion textDanger"
                       aria-hidden="true"
                       title="Editar"
                       @click="deleteItem(item)"
                     />

                   </div>
                </div>
              </div>
            </div>
            <template v-if="typeof item.inicial !== 'undefined' && item.inicial == false"">
              <!-- Acordeón de detalle -->
              <transition name="acordeon">
                <div
                  :key="'acordeon-' + item.id"
                  v-if="abiertos.includes(item.id)"
                  class="card acordeonDetalles"
                >
                  <PropuestaDetalles :cotizacion="item" />
                </div>
              </transition>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PropuestaDetalles from "@/components/forms/cotizaciones/componentes/autosPropuestaDetalles.vue";
import { deepToRaw, isItemSelected, toggleItemInArray } from "@/utils/helper";
import { defineEmits, defineProps, ref } from "vue";

const props = withDefaults(
  defineProps<{
  configuracion: any;
  companias: any;
  }>(),
  {
    companias: [],
  }
);

const emit = defineEmits([
  "seleccionar", 
  "editar",
  "getCompanias",
  "actualizar",
  "cancelar"
]);

const abiertos = ref<number[]>([]);
const companias = ref<any>([]);
const moodDelete = ref<boolean>(false);
const propuestas = ref<any>(props.configuracion.cotizaciones || []);
const seleccionadas = ref<number[]>([]);
const addingCotizacion = ref<boolean>(false);
const companiasSeleccionadas = ref<number[]>([]);

watch(
  () => props.configuracion.cotizaciones,
  (newVal) => {
console.log("props.configuracion.cotizaciones changed:", deepToRaw(newVal));
    propuestas.value = newVal || [];
  },
  { immediate: true }
);

function seleccionar(item: any) {
  item = deepToRaw(item);
  toggleItemInArray(seleccionadas.value, item, "id");
  emit("seleccionar", item);
}

function handleCancelarAgregarCotizaciones(item: any) {
  addingCotizacion.value = false;
  emit("cancelar");
}

function editarPropuesta(item: any) {
  emit("editar", item);
}

async function handleAddCotizacion() {
  emit("getCompanias");
  addingCotizacion.value = true;
  companiasSeleccionadas.value = [];
}

async function handleAgregarCotizacion() {
  addingCotizacion.value = false;
  let tmp : any = [];
  let index = props.configuracion.cotizaciones
    ? props.configuracion.cotizaciones.length + 1
    : 1;
    
  console.log("Companias seleccionadas:", toRaw(companiasSeleccionadas.value));
  companiasSeleccionadas.value.forEach((compania: any) => {
    tmp.push({
      id: index++,
      estimar: true,
      inicial: false,
      ramo: compania.ramo ?? "",
      ramo_id: compania.ramo_id ?? "",
      compania: compania.compania ?? "",
      compania_id: compania.compania_id ?? compania.id ?? "",
      companiaCorto: compania.companiaCorto ?? "",
      companiaProducto_id: compania.companiaProducto_id ?? "",
      companiaProducto: compania.companiaProducto ?? "",
      titular: {}
    });
  });

  tmp = [
    ...(props.configuracion.cotizaciones || []),
    ...tmp,
  ];
  emit("actualizar", tmp);
}

async function deleteItem(item: any) {
  let tmp = (props.configuracion.cotizaciones || []).filter(
    (x: any) => x.id !== item.id
  );
  console.log("Eliminar item:", item.id, deepToRaw(tmp));
  console.log("Propuestas actuales:", tmp.length);
  emit("actualizar", tmp);
  moodDelete.value = false;
}


const handleSelectCompania = (item: any) => {
  item = toRaw(item); // Asegúrate de que el item sea un objeto plano

  if (!Array.isArray(companiasSeleccionadas.value)) {
    companiasSeleccionadas.value = [];
  }
  companiasSeleccionadas.value = toggleItemInArray(
    companiasSeleccionadas.value,
    item,
    "compania_id"
  );
};

const hadDetalles = computed(() => {
  return (item: any): boolean => {
    return (
      item &&
      item.detalles &&
      typeof item.detalles === "object" &&
      Object.keys(item.detalles).length > 0
    );
  };
});

function toggleAcordeon(id: number) {
  if (abiertos.value.includes(id)) {
    abiertos.value = abiertos.value.filter((x) => x !== id);
  } else {
    abiertos.value.push(id);
  }
}
</script>

<style scoped>
.error-row {
  background: #ffeaea;
  border-left: 4px solid #e53935;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
}
.text-danger {
  color: #e53935;
  font-weight: bold;
}
.acordeon-enter-active,
.acordeon-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}
.acordeon-enter-from,
.acordeon-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
}
.acordeon-enter-to,
.acordeon-leave-from {
  max-height: 500px; /* Ajusta según el contenido */
  opacity: 1;
  transform: translateY(0);
}
.acordeonDetalles {
  margin-top: -1rem;
  border: 1px solid #b4b4b4 !important;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  background-color: #ededed !important;
  z-index: -1;
}
.nombre-compania {
  font-weight: bold;
  color: #1976d2;
  text-align: center;
  width: 100%;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.propuestas-list-horizontal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  align-items: stretch;
  margin-top: 2rem;
}
.propuesta-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px #0001;
  padding: 20px;
  gap: 1rem;
  min-width: 520px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}
.propuesta-card-horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.col-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
}
.custom-checkbox {
  width: 22px;
  height: 22px;
  accent-color: #1976d2;
  cursor: pointer;
}
.col-datos {
  flex: 1 1 auto;
  min-width: 0;
}
.col-iconos {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  min-width: 60px;
}
.icono-accion {
  color: #1976d2;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 1.5rem;
}
.icono-accion:hover {
  color: #0d47a1;
}
.btn-icon {
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.propuesta-header-horizontal {
  font-weight: bold;
  font-size: 1.1rem;
  width: 100%;
  text-align: center;
  margin-bottom: 0.5rem;
}
.propuesta-detalles-horizontal {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.activeItem {
  border: 2px solid #1976d2;
  background: #e3f0fc;
}

.acordeon-detalle {
  background: #f5faff;
  border: 1px solid #b3e5fc;
  border-radius: 8px;
  margin: 10px auto 0 auto;
  padding: 15px;
  font-size: 0.95rem;
  max-width: 900px;
  min-width: 520px;
  white-space: pre-wrap;
}
.divRows {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}
.cardCompania {
  text-align: center !important;
  min-width: 100px !important;
}
</style>
