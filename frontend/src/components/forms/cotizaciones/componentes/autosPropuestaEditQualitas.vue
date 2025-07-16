<template>
  <div class="wFull">
    <div>
      <VBtn color="dark" variant="outlined" @click="() => {}">
        Print Cotizaciom
      </VBtn>
      <VBtn color="dark" variant="outlined" @click="() => {}">
        Print cambios
      </VBtn>
    </div>
    <div class="mt-4" v-if="cambios != null">
      <FormFactory
        :schema="schemaInicial"
        :formLive="true"
        :modelValue="cambios"
        @update:modelValue="(val) => (cambios = val)"
        :textButtonSubmit="'Empezar cotización'"
        :showButtonSubmit="false"
        :showButtonCancel="false"
      />
    </div>
    <v-expansion-panels v-model="panelActivo" multiple>
      <v-expansion-panel>
        <v-expansion-panel-title>Frecuencias de pago</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="frecuencias-row">
            <div
              v-for="(item, idx) in frecuenciasPago"
              :key="idx"
              class="frecuencia-card"
              :class="{ selected: selectedFrecuencia === item.tipo }"
              @click="
                () => {
                  handleSelectFrecuencia(item);
                }
              "
            >
              <div class="frecuencia-tipo">{{ item.tipo }}</div>
              <div class="frecuencia-monto">{{ item.monto }}</div>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title>Coberturas básicas</v-expansion-panel-title>
        <v-expansion-panel-text>
          <table class="table table-bordered w-100 mt-4 tabla-cuadriculada">
            <thead>
              <tr>
                <th>Cobertura</th>
                <th class="text-center">Suma asegurada</th>
                <th class="text-center">Deducible</th>
                <th class="text-center">Prima</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(row, idx) in coberturas" :key="idx">
                <template v-if="Array.isArray(row.sumaSegura)">
                  <tr v-for="(item, i) in row.sumaSegura" :key="i">
                    <td
                      v-if="i === 0"
                      :rowspan="row.sumaSegura.length"
                      class="cuadriculada-cellNotCenter"
                    >
                      {{ row.cobertura }}
                    </td>
                    <td
                      class="text-center cuadriculada-cell"
                      :class="
                        row.sumaSegura.length > 1 && i > 0
                          ? 'cuadriculada-cell-sinborde'
                          : ''
                      "
                    >
                      <div class="cuadriculada-content">
                        <template v-if="item.tag === 'p'">
                          <span>{{ item.texto }}</span>
                        </template>
                        <template
                          v-else-if="
                            item.tag === 'input' && item.tipo === 'checkbox'
                          "
                        >
                          <v-checkbox
                            v-model="item.checked"
                            :label="item.texto || ''"
                            :disabled="item.disabled"
                            :readonly="item.readonly"
                            :id="item.id"
                            :name="item.name"
                            hide-details
                            density="compact"
                          />
                        </template>
                        <template
                          v-else-if="
                            item.tag === 'input' && item.tipo === 'text'
                          "
                        >
                          <VTextField
                            variant="outlined"
                            v-model="item.valor"
                            :disabled="item.disabled"
                            :readonly="item.readonly"
                            :placeholder="
                              item.placeholder || 'Introduce el dato requerido'
                            "
                            class="cuadriculada-element formInput"
                          />
                        </template>
                        <template v-else-if="item.tag === 'select'">
                          <VSelect
                            :items="item.opciones || []"
                            v-model="item.valor"
                            item-title="texto"
                            :item-value="(item) => item"
                            :placeholder="'Selecciona una opción'"
                            :disabled="item.disabled"
                            :readonly="item.readonly"
                            class="cuadriculada-element formInput"
                          />
                        </template>
                      </div>
                    </td>
                    <td
                      class="text-center cuadriculada-cell"
                      v-if="i === 0"
                      :rowspan="row.sumaSegura.length"
                    >
                      <div class="cuadriculada-content">
                        <template
                          v-if="row.deducible && row.deducible.tag === 'select'"
                        >
                          <VSelect
                            :items="row.deducible.opciones || []"
                            v-model="row.deducible.valor"
                            item-title="texto"
                            :item-value="(item) => item"
                            :placeholder="'Selecciona una opción'"
                            :disabled="row.deducible.disabled"
                            :readonly="row.deducible.readonly"
                            class="cuadriculada-element formInput"
                          />
                        </template>
                      </div>
                    </td>
                    <td
                      class="text-center cuadriculada-cell"
                      v-if="i === 0"
                      :rowspan="row.sumaSegura.length"
                    >
                      <div class="cuadriculada-content">
                        <template v-if="row.prima?.tag === 'p'">
                          <span>{{ row.prima.texto }}</span>
                        </template>
                      </div>
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td class="cuadriculada-cellNotCenter">
                      {{ row.cobertura }}
                    </td>
                    <td class="text-center cuadriculada-cell">
                      <div class="cuadriculada-content">
                        <template v-if="row.sumaSegura?.tag === 'p'">
                          <span>{{ row.sumaSegura.texto }}</span>
                        </template>
                        <template
                          v-else-if="
                            row.sumaSegura?.tag === 'input' &&
                            row.sumaSegura.tipo === 'text'
                          "
                        >
                          <VTextField
                            variant="outlined"
                            v-model="row.sumaSegura.valor"
                            :disabled="row.sumaSegura.disabled"
                            :readonly="row.sumaSegura.readonly"
                            :placeholder="
                              row.sumaSegura.placeholder ||
                              'Introduce el dato requerido'
                            "
                            class="cuadriculada-element formInput"
                          />
                        </template>
                        <template v-else-if="row.sumaSegura?.tag === 'select'">
                          <VSelect
                            :items="row.sumaSegura.opciones || []"
                            v-model="row.sumaSegura.valor"
                            item-title="texto"
                            :item-value="(item) => item"
                            :placeholder="'Selecciona una opción'"
                            :disabled="row.sumaSegura.disabled"
                            :readonly="row.sumaSegura.readonly"
                            class="cuadriculada-element formInput"
                          />
                        </template>
                      </div>
                    </td>
                    <td class="text-center cuadriculada-cell">
                      <div class="cuadriculada-content">
                        <template
                          v-if="row.deducible && row.deducible.tag === 'select'"
                        >
                          <VSelect
                            :items="row.deducible.opciones || []"
                            v-model="row.deducible.valor"
                            item-title="texto"
                            :item-value="(item) => item"
                            :placeholder="'Selecciona una opción'"
                            :disabled="row.deducible.disabled"
                            :readonly="row.deducible.readonly"
                            class="cuadriculada-element formInput"
                          />
                        </template>
                      </div>
                    </td>
                    <td class="text-center cuadriculada-cell">
                      <div class="cuadriculada-content">
                        <template v-if="row.prima?.tag === 'p'">
                          <span>{{ row.prima.texto }}</span>
                        </template>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title>Accesorios</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="accesorios-tarjetas mt-4">
            <template
              v-for="(item, idx) in accesorios || []"
              :key="item.label_id || idx"
            >
              <div v-if="item.nombre != null">
                <div
                  :key="item.label_id || idx"
                  v-if="item.nombre != null"
                  class="accesorio-tarjeta"
                  :class="{ selected: selectedAccesorios.includes(idx) }"
                  @click="handleItem(idx, item)"
                >
                  <div class="accesorio-row">
                    <div class="accesorio-nombre">
                      {{ item.nombre }}
                    </div>
                    <div
                      class="accesorio-valor"
                      v-if="selectedAccesorios.includes(idx)"
                    >
                      {{ item.prima }}
                    </div>
                  </div>
                  <div
                    v-if="
                      selectedAccesorios.includes(idx) &&
                      item.hijos &&
                      item.hijos.length > 0
                    "
                    @click.stop
                    class="accesorio-hijos"
                  >
                    <template
                      v-for="(hijo, hidx) in item.hijos"
                      :key="hijo.id || hidx"
                    >
                      <div class="accesorio-hijo-col">
                        <span v-if="hijo.label" class="accesorio-hijo-label">{{
                          hijo.label
                        }}</span>
                        <VTextField
                          v-if="hijo.tag === 'input'"
                          v-model="hijo.valor"
                          :placeholder="hijo.label || 'Valor'"
                          class="accesorio-input formInput"
                          variant="outlined"
                          density="compact"
                          :readonly="!selectedAccesorios.includes(idx)"
                          @mousedown.stop
                        />
                        <VSelect
                          v-else-if="hijo.tag === 'select'"
                          v-model="hijo.valor"
                          :items="hijo.opciones || []"
                          item-title="texto"
                          :item-value="(item) => item"
                          :placeholder="hijo.label || 'Selecciona una opción'"
                          class="accesorio-select formInput"
                          density="compact"
                          :readonly="!selectedAccesorios.includes(idx)"
                          @mousedown.stop
                        />
                        <span
                          v-else-if="hijo.valor && hijo.label"
                          class="accesorio-hijo-valor"
                          >{{ hijo.valor }}</span
                        >
                        <span
                          v-else-if="hijo.valor"
                          class="accesorio-hijo-valor"
                          >{{ hijo.valor }}</span
                        >
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { deepToRaw, diffObjects, isEqual } from "@/utils/helper";
import { defineEmits, defineProps, onMounted, ref } from "vue";
// Devuelve las diferencias entre dos objetos o arrays
// diffObjects ahora devuelve solo los nuevos valores (valor1) de los elementos que cambiaron

const props = defineProps<{
  cotizacion: any;
}>();

const emit = defineEmits(["cancelar", "actualizar"]);
// Controla los paneles abiertos del acordeón (soporta múltiples)
let schemaInicial: any = null;
const panelActivo = ref([0]); // Por defecto solo el primero abierto
const accesorios: any = ref(null);
const cambios: any = ref(null);
const cambiosInicial: any = ref(null);
const coberturas: any = ref(null);
const coberturasInicial: any = ref(null);
// Frecuencias de pago
const frecuenciasPago = ref<any[]>([]);
const selectedFrecuencia = ref<string | null>(null);
const selectedAccesorios = ref<number[]>([]);
const hayCambiosCoberturas: any = ref(false);

function getPrimeraOpcionValida(arr: any[], prop: string): string | null {
  return Array.isArray(arr)
    ? arr.find((item) => item[prop] && item[prop] !== "")?.[prop] ?? null
    : null;
}

const handleSelectFrecuencia = (item: any) => {
  selectedFrecuencia.value = item.tipo;
  cambios.value.frecuenciaPago = item;
};

function filtrarOpcionesValidas(arr: any[], prop: string) {
  return Array.isArray(arr)
    ? arr
        .filter((item) => item[prop] && item[prop] !== "")
        .map((item) => ({ label: item[prop], value: item[prop] }))
    : [];
}

function toggleAccesorio(idx: number) {
  const i = selectedAccesorios.value.indexOf(idx);
  if (i === -1) {
    selectedAccesorios.value.push(idx);
  } else {
    selectedAccesorios.value.splice(i, 1);
  }
}

const handleItem = (idx: number, item: any) => {
  toggleAccesorio(idx);
};

onMounted(() => {
  if (props.cotizacion) {
    let tmp = deepToRaw(props.cotizacion);
    let direcciones = tmp.detalles.direcciones;
    let versiones = tmp.detalles.versiones;

    schemaInicial = [
      {
        label: "Dirección",
        type: "select",
        model: "direccion",
        classElement: " col-sm-12 col-md-6  col-lg-6 ",
        options: filtrarOpcionesValidas(direcciones, "value"),
      },
      {
        label: "Version",
        type: "select",
        model: "version",
        classElement: " col-sm-12 col-md-6  col-lg-6 ",
        options: filtrarOpcionesValidas(versiones, "label"),
      },
    ];
    // prettier-ignore
    const primeraVersion = getPrimeraOpcionValida(versiones, "label");
    const primeraDireccion = getPrimeraOpcionValida(direcciones, "value");

    // prettier-ignore
    let tmpCambios = {
      version: primeraVersion ? { label: primeraVersion, value: primeraVersion } : null,
      direccion: primeraDireccion ? { label: primeraDireccion, value: primeraDireccion } : null,
    };
    cambios.value = tmpCambios;
    cambiosInicial.value = tmpCambios;

    // Asigna frecuencias de pago si existen
    frecuenciasPago.value = tmp.detalles.frecuenciasPago || [];
    // Al inicializar coberturas, si deducible es select y valor es string, lo convertimos al objeto completo
    function mapDeducibleValorToObject(arr: any[]): any[] {
      return arr.map((row: any) => {
        // prettier-ignore
        // Deducible
        if ( row.deducible && row.deducible.tag === "select" && typeof row.deducible.valor === "string" ) {
          const found = (row.deducible.opciones || []).find( (opt: any) => opt.value === row.deducible.valor );
          if (found) row.deducible.valor = found;
        }

        // prettier-ignore
        // SumaSegura
        if ( row.sumaSegura && row.sumaSegura.tag === "select" && typeof row.sumaSegura.valor === "string" ) {
          const found = (row.sumaSegura.opciones || []).find( (opt: any) => opt.value === row.sumaSegura.valor );
          if (found) row.sumaSegura.valor = found;
        }
        return row;
      });
    }

    // prettier-ignore
    coberturas.value = mapDeducibleValorToObject( JSON.parse(JSON.stringify(tmp.detalles.coberturasBasicas || [])) );
    // prettier-ignore
    coberturasInicial.value = mapDeducibleValorToObject( JSON.parse(JSON.stringify(tmp.detalles.coberturasBasicas || [])));

    let tmpAccesorios = tmp.detalles.accesorios || [];
    accesorios.value = tmpAccesorios;
  }
});

const canActualizar = computed(() => {
  let response = false;
  if (!response) {
    response = !isEqual(cambios.value, cambiosInicial.value);
  }

  if (!response) {
    response = hayCambiosCoberturas.value;
  }

  if (!response) {
    response = selectedAccesorios.value.length > 0;
  }

  return response;
});

// prettier-ignore
watch( coberturas, () => {
    let tmpCambios = diffObjects(coberturas.value, coberturasInicial.value);
    hayCambiosCoberturas.value = Object.keys(tmpCambios).length > 0;
  },
  { deep: true }
); // prettier-ignore
watch(canActualizar, () => {
  emit("actualizar", canActualizar.value);
});
</script>

<style scoped>
.tabla-cuadriculada {
  border-collapse: separate;
  border-spacing: 0;
  background: #f8fafc;
}
.tabla-cuadriculada th,
.tabla-cuadriculada td {
  border: 1.5px solid #dedede !important;
  padding: 0.5rem !important;
  vertical-align: middle;
  background: #fff;
}

/* Solo para celdas internas de suma asegurada cuando hay varias filas */
.cuadriculada-cell-sinborde {
  border-top: none !important;
}

.cuadriculada-cell {
  background: #fff;
  text-align: center;
}
.cuadriculada-cellNotCenter {
  background: #fff;
}

/* Elementos internos sin borde ni sombra */
.cuadriculada-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}
.cuadriculada-element {
  width: 80% !important;
  margin: 0 auto;
  display: block;
  box-shadow: none !important;
}

/* Frecuencias de pago */
.frecuencias-row {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0 0 0;
}
.frecuencia-card {
  cursor: pointer;
  border: 2px solid #1976d2;
  border-radius: 10px;
  padding: 1rem 2rem;
  background: #ffffff;
  text-align: center;
  transition: box-shadow 0.2s, border-color 0.2s;
  min-width: 120px;
}
.frecuencia-card.selected {
  border-color: #0d47a1;
  box-shadow: 0 2px 8px #1976d2aa;
  background: #e3f0fc;
}
.frecuencia-tipo {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.frecuencia-monto {
  font-size: 1.2rem;
  color: #1976d2;
}

.accesorios-tarjetas {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.accesorio-tarjeta {
  flex: 1 1 400px; /* Crece, encoge, base 400px */
  max-width: 400px; /* Máximo 400px */
  min-width: 400px; /* Mínimo 300px */
  min-height: 170px; /* Altura mínima igual para todas */
  background: #f8fafc;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
}
.accesorio-tarjeta.selected {
  border-color: #1976d2;
  background: #ffffff;
  box-shadow: 0 2px 8px #1976d2aa;
}
.accesorio-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.accesorio-nombre {
  flex: 1;
  text-align: left;
}
.accesorio-valor {
  flex: 1;
  font-size: 1.3rem;
  text-align: right;
  color: #1976d2;
}
.accesorio-hijos {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  margin-top: 0.5rem;
}
.accesorio-hijo-col {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 50% !important;
}
.accesorio-hijo-label {
  font-weight: 500;
  margin-bottom: 0.25rem;
  text-align: left;
}
.accesorio-hijo-valor {
  font-weight: bold;
  color: #1976d2;
  margin-top: 0.25rem;
}

.accesorio-input,
.accesorio-select {
  width: 100%;
}
</style>
