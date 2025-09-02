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
    <template v-if="itsOkay">
      <div class="mt-4">
        <FormFactory
          :schema="schemaInicial"
          :formLive="true"
          :modelValue="cambios || {}"
          @update:modelValue="(val) => (cambios = val)"
          :textButtonSubmit="'Empezar cotización'"
          :showButtonSubmit="false"
          :showButtonCancel="false"
        />
      </div>
      <template v-if="!cotizacion.inicial">
        <v-expansion-panels v-model="panelActivo" multiple>
          <v-expansion-panel>
            <v-expansion-panel-title
              >Frecuencias de pago</v-expansion-panel-title
            >
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
            <v-expansion-panel-title
              >Coberturas básicas</v-expansion-panel-title
            >
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
                                  item.placeholder ||
                                  'Introduce el dato requerido'
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
                              v-if="
                                row.deducible && row.deducible.tag === 'select'
                              "
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
                            <template
                              v-else-if="row.sumaSegura?.tag === 'select'"
                            >
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
                              v-if="
                                row.deducible && row.deducible.tag === 'select'
                              "
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
                      :class="{ selected: item.selected || false }"
                      @click="handleItem(idx, item)"
                    >
                      <div class="accesorio-row">
                        <div class="accesorio-nombre">
                          {{ item.nombre }}
                        </div>
                        <div
                          class="accesorio-valor"
                          v-if="item.selected || false"
                        >
                          {{ item.prima }}
                        </div>
                      </div>
                      <div
                        v-if="
                          (item.selected || false) &&
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
                            <span
                              v-if="hijo.label"
                              class="accesorio-hijo-label"
                              >{{ hijo.label }}</span
                            >
                            <VTextField
                              v-if="hijo.tag === 'input'"
                              v-model="hijo.valor"
                              :placeholder="hijo.label || 'Valor'"
                              class="accesorio-input formInput"
                              variant="outlined"
                              density="compact"
                              :readonly="!(item.selected || false)"
                              @mousedown.stop
                            />
                            <VSelect
                              v-else-if="hijo.tag === 'select'"
                              v-model="hijo.valor"
                              :items="hijo.opciones || []"
                              item-title="texto"
                              :item-value="(item) => item"
                              :placeholder="
                                hijo.label || 'Selecciona una opción'
                              "
                              class="accesorio-select formInput"
                              density="compact"
                              :readonly="!(item.selected || false)"
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
      </template>
    </template>

    <div class="d-flex justify-space-between w-100 mt-5">
      <div>
        <VBtn color="dark" outlined @click="handleCancelar"> Cancelar </VBtn>
      </div>
      <div>
        <!-- prettier-ignore -->
        <VBtn color="warning" :disabled="!canActualizar" @click="handleActualizar"> Actualizar </VBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { deepClone, deepToRaw, diffObjects } from "@/utils/helper";
import { defineEmits, defineProps, onMounted, ref } from "vue";
// Devuelve las diferencias entre dos objetos o arrays
// diffObjects ahora devuelve solo los nuevos valores (valor1) de los elementos que cambiaron

const props = defineProps<{
  cotizacion: any;
  registro: any;
}>();

const emit = defineEmits(["cancelar", "actualizar"]);
// Controla los paneles abiertos del acordeón (soporta múltiples)
// prettier-ignore
let schemaInicial : any = [
  {
    label: "Nombre",
    type: "text",
    model: "nombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Segundo nombre",
    type: "text",
    model: "segundoNombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido paterno",
    type: "text",
    model: "apellidoPaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido materno",
    type: "text",
    model: "apellidoMaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Fecha de nacimiento",
    type: "date",
    model: "fechaNacimiento",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
  },
  {
    label: "Sexo",
    type: "select",
    model: "sexo",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
      options: [
      {label:"Hombre",id:"Hombre"},
      {label:"Mujer",id:"Mujer"}
    ]
  },
  {
    label: "Telefono",
    type: "text",
    model: "telefono",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Correo electronico",
    type: "text",
    model: "correo",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Datos del auto",
    type: "separador",
    classElement: " col-12 ",
  },
  {
    label: "Marca",
    type: "text",
    model: "marca",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Modelo",
    type: "text",
    model: "modelo",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Año",
    type: "text",
    model: "anio",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Codigo Postal",
    type: "text",
    model: "codigoPostal",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
];
const itsOkay = ref(false); // Por defecto solo el primero abierto
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
const hayCambios: any = ref(false);

const canActualizar = computed(() => {
  return (
    hayCambios.value ||
    hayCambiosCoberturas.value ||
    selectedAccesorios.value.length > 0
  );
});

function handleCancelar() {
  emit("cancelar");
}

function handleActualizar() {
  let tmpCotizacion = { ...deepClone(props.cotizacion) };
  // Clona los accesorios y seleccionados para evitar referencias
  const coberturasTmp = deepClone(coberturas.value || []);

  // prettier-ignore
  const cambiosCoberturas = diffObjects(coberturasTmp, coberturasInicial.value || {});
  const accesoriosClon = deepClone(accesorios.value || []);
  tmpCotizacion.detalles.accesorios = [...accesoriosClon];

  // Prepara los cambios finales
  let cambiosFinales = {
    ...deepClone(cambios.value),
    coberturas: cambiosCoberturas,
  };

  if (cambiosCoberturas.length > 0) {
    cambiosFinales.coberturas = cambiosCoberturas;
  }

  // Clona el titular original
  let tmpTitular = deepClone(props.cotizacion.titular || {});

  // Buscar y mover propiedades del titular desde cambiosFinales
  if (props.cotizacion.titular) {
    const titularKeys = Object.keys(props.cotizacion.titular);

    titularKeys.forEach((key) => {
      if (cambiosFinales.hasOwnProperty(key)) {
        // Guardar/reemplazar en tmpTitular
        tmpTitular[key] = cambiosFinales[key];
        // Eliminar de cambiosFinales
        delete cambiosFinales[key];
      }
    });
  }

  if (isObject(tmpTitular.direccion)) {
    tmpTitular.direccion = tmpTitular.direccion.label;
  }

  if ("codigoPostal" in cambiosFinales) {
    tmpTitular.codigoPostal = cambiosFinales.codigoPostal;
    delete cambiosFinales.codigoPostal;
  }

  if ("marca" in cambiosFinales) {
    tmpCotizacion.vehiculo.marca = cambiosFinales.marca;
    delete cambiosFinales.marca;
  } else if ("marca" in tmpTitular) {
    tmpCotizacion.vehiculo.marca = tmpTitular.marca;
    delete tmpTitular.marca;
  }

  if ("modelo" in cambiosFinales) {
    tmpCotizacion.vehiculo.modelo = cambiosFinales.modelo;
    delete cambiosFinales.modelo;
  } else if ("modelo" in tmpTitular) {
    tmpCotizacion.vehiculo.modelo = tmpTitular.modelo;
    delete tmpTitular.modelo;
  }

  if ("anio" in cambiosFinales) {
    tmpCotizacion.vehiculo.anio = cambiosFinales.anio;
    delete cambiosFinales.anio;
  } else if ("anio" in tmpTitular) {
    tmpCotizacion.vehiculo.anio = tmpTitular.anio;
    delete tmpTitular.anio;
  }

  if ("version" in cambiosFinales) {
    tmpCotizacion.vehiculo.version = cambiosFinales.version.label;
    delete cambiosFinales.version;
  } else if ("version" in tmpTitular) {
    tmpCotizacion.vehiculo.version = tmpTitular.version;
    delete tmpTitular.version;
  }

  if ("frecuenciaPago" in cambiosFinales) {
    tmpCotizacion.detalles.frecuenciaPago = cambiosFinales.frecuenciaPago.tipo;
    delete cambiosFinales.frecuenciaPago;
  }

  tmpCotizacion.estimar = true;
  tmpCotizacion.titular = tmpTitular; // Titular actualizado
  console.log(toRaw(tmpCotizacion));
  emit("actualizar", tmpCotizacion);
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

const handleItem = (idx: number, item: any) => {
  accesorios.value[idx].selected = !accesorios.value[idx].selected;
};

onMounted(() => {
  if (props.cotizacion) {
    let cotizacionTMP = deepToRaw(props.cotizacion);
    let tmpCambios: any = {};
    if (cotizacionTMP.inicial) {
      tmpCambios = {
        ...(cotizacionTMP.titular || {}),
        ...(cotizacionTMP.vehiculo || {}),
      };
    } else {
      tmpCambios = {
        ...(cotizacionTMP.titular || {}),
        ...(cotizacionTMP.vehiculo || {}),
      };
    }

    if (cotizacionTMP.titular.direcciones) {
      let direcciones = cotizacionTMP.titular.direcciones;
      schemaInicial.push({
        label: "Direccion",
        type: "select",
        model: "direccion",
        classElement: " col-sm-12 col-md-6  col-lg-6 ",
        options: filtrarOpcionesValidas(direcciones, "value"),
      });
    }

    if (cotizacionTMP.vehiculo.versiones) {
      let versiones = cotizacionTMP.vehiculo.versiones;
      schemaInicial.push({
        label: "Versión",
        type: "select",
        model: "version",
        classElement: " col-sm-12 col-md-6  col-lg-6 ",
        options: filtrarOpcionesValidas(versiones, "label"),
      });
      tmpCambios.version = {
        value: cotizacionTMP.vehiculo.version,
        label: cotizacionTMP.vehiculo.version,
      };
    }

    if (cotizacionTMP.detalles.frecuenciasPago) {
      frecuenciasPago.value = cotizacionTMP.detalles.frecuenciasPago;
    }

    if (typeof tmpCambios.direccion == "string") {
      tmpCambios.direccion = {
        value: tmpCambios.direccion,
        label: tmpCambios.direccion,
      };
    }

    cambios.value = deepClone(tmpCambios);
    accesorios.value = deepClone(cotizacionTMP.detalles.accesorios || []);
    cambiosInicial.value = deepClone(tmpCambios);
    // prettier-ignore
    coberturas.value = deepClone(cotizacionTMP.detalles.coberturasBasicas || []);
    // prettier-ignore
    coberturasInicial.value = deepClone( cotizacionTMP.detalles.coberturasBasicas || []);

    itsOkay.value = true;
  }
});
// prettier-ignore
watch( coberturas, () => {
    let tmpCambios = diffObjects(coberturas.value, coberturasInicial.value);
    hayCambiosCoberturas.value = Object.keys(tmpCambios).length > 0;
  },
  { deep: true }
);
// prettier-ignore
watch( cambios, () => {
    const cambiosDetectados = diffObjects(cambios.value, cambiosInicial.value);
    hayCambios.value = Object.keys(cambiosDetectados).length > 0;
  },
  { deep: true }
);
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
