<script setup lang="ts">
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";

import CotizacionPlanSeguro from "@/components/forms/cotizaciones/cotizacionPlanSeguro.vue";
import { customRequest } from "@/utils/axiosInstance";
const companias: any = ref([]); // Referencia al componente FormFactory
const productos: any = ref([]); // Referencia al componente FormFactory
const ramos: any = ref(null); // Referencia al componente FormFactory
const step: any = ref(4); // Referencia al componente FormFactory
const configuracion: any = ref({
  ramo: {
    id: "2",
    label: "GMM",
    estatus: true,
    created_at: "2025-04-20T00:39:13.000Z",
    updated_at: "2025-04-20T00:39:13.000Z",
    deleted_at: null,
  },
  compania: [
    {
      id: "2",
      rfc: "PSS970203FI6",
      nombre: "PLAN SEGURO S.A. DE C.V.",
      nombreCorto: "PLAN SEGURO",
      direccion: "",
      estado: null,
      codigoPostal: "",
      ciudad: "",
      limitePrimerPago: "0",
      limitePrimerSubsecuente: "0",
      estatus: false,
      colonia: null,
      created_at: "2025-04-24T00:22:11.000Z",
      updated_at: "2025-04-24T00:22:11.000Z",
      companias_productos: [
        {
          id: "2",
          compania_id: "2",
          ramo_id: "2",
          nombre: "Plan Seguro Óptimo Plus",
          created_at: "2025-04-29T04:07:12.000Z",
          updated_at: "2025-04-29T04:09:31.000Z",
          estatus: true,
        },
      ],
    },
    {
      id: "1",
      rfc: "SAF980202D99",
      nombre: "SEGUROS AFIRME S.A. DE C.V.",
      nombreCorto: "AFIRME",
      direccion: "dedede",
      estado: "ddddd",
      codigoPostal: "dede",
      ciudad: "dede",
      limitePrimerPago: "3",
      limitePrimerSubsecuente: "4",
      estatus: false,
      colonia: "dede",
      created_at: "2025-04-20T21:51:55.000Z",
      updated_at: "2025-04-21T17:48:27.000Z",
      companias_productos: [
        {
          id: "1",
          compania_id: "1",
          ramo_id: "2",
          nombre: "GMM Firme",
          created_at: "2025-04-29T04:07:12.000Z",
          updated_at: "2025-05-17T02:48:21.000Z",
          estatus: true,
        },
      ],
    },
  ],
  productos: [
    {
      id: "1",
      compania_id: "1",
      ramo_id: "2",
      nombre: "GMM Firme",
      created_at: "2025-04-29T04:07:12.000Z",
      updated_at: "2025-05-17T02:48:21.000Z",
      estatus: true,
      selected: true,
    },
    {
      id: "2",
      compania_id: "2",
      ramo_id: "2",
      nombre: "Plan Seguro Óptimo Plus",
      created_at: "2025-04-29T04:07:12.000Z",
      updated_at: "2025-04-29T04:09:31.000Z",
      estatus: true,
      selected: true,
    },
  ],
}); // Referencia al componente FormFactory
// const configuracion: any = ref({
//   ramo: null,
//   companias: [],
// productos: [],
// }); // Referencia al componente FormFactory

async function getRamos() {
  let url = "/api/catalogos/ramos";
  let response = await customRequest({
    url: url,
    method: "POST",
  });
  if (response.data.result) {
    ramos.value = response.data.data;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

async function getCompanias() {
  let url = "/api/wizard/cotizacion/companias";
  let response = await customRequest({
    url: url,
    method: "POST",
    data: {
      ramo: configuracion.value.ramo.id,
    },
  });
  if (response.data.result) {
    companias.value = response.data.data;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

function selectRamo(ramo: any) {
  configuracion.value.ramo = ramo;
  step.value = 2;
  getCompanias();
}

function selectProducto(valor: any, producto: any) {
  if (valor) {
    // Si el checkbox está marcado, agrega el producto a la lista
    configuracion.value.productos.push(producto);
  } else {
    // Si el checkbox está desmarcado, elimina el producto de la lista
    configuracion.value.productos = configuracion.value.productos.filter(
      (p: any) => p.id !== producto.id
    );
  }
}

function goToSeleccionarProducto() {
  step.value = 3;
}

function isCompaniaSelected(compania: any) {
  return configuracion.value.compania.some((c: any) => c.id === compania.id);
}

function selectCompania(compania: any) {
  const index = isCompaniaSelected(compania);
  console.log("index", index);
  if (index) {
    // Si existe, elimínala
    configuracion.value.companias = configuracion.value.companias.filter(
      (c: any) => c.id !== compania.id
    );
  } else {
    // Si no existe, agrégala
    configuracion.value.companias.push(compania);
  }
}

function resetCotizacion() {
  configuracion.value = {
    ramo: null,
    companias: [],
  };
  step.value = 1;
}
onMounted(() => {
  getRamos();
});
</script>

<style scoped lang="scss">
.bgRed {
  background-color: red;
}

.w-full {
  width: 100%;
}
.divItems {
  display: flex;
  gap: 2rem;
  width: fit-content;
  margin-left: auto !important;
  margin-right: auto !important;
}
.w-fit {
  width: fit-content;
}

.divButtons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.divPlanItem {
  position: relative; // Añade esto
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  align-items: center;
  width: fit-content;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
}

.badge {
  position: absolute; // Añade esto
  top: -0.5em; // Ajusta según tu preferencia
  right: -0.5em; // Ajusta según tu preferencia
  display: inline-block;
  background: #3996f3;
  color: #fff;
  border-radius: 1rem;
  padding: 0.2em 0.7em;
  font-size: 0.9em;
  font-weight: bolder;
  margin-top: 0; // Elimina el margin-top si lo tienes
}

.disabledItem {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(0.7);
  cursor: not-allowed;
}

.activeItem {
  // background-color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
  border-width: 2px;
  box-shadow: 0 0 5px rgb(var(--v-theme-primary));
}
.titleSeparator {
  border-bottom: 1px solid rgb(var(--v-theme-primary)) !important;
  font-size: 1.2rem !important;
  text-align: center !important;
  padding-bottom: 5px !important;
  margin-top: 16px !important;
  margin-bottom: 10px !important;
  font-weight: bolder !important;
  line-height: 1.375rem;
  letter-spacing: normal !important;
  text-transform: none !important;
}
.cardActive {
  border: 2px solid rgb(var(--v-theme-primary));
}
.card {
  padding: 16px !important;
  border-radius: 10px !important;
  background-color: white !important;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1) !important;
  width: 400px !important;
}
</style>

<template>
  <pre>{{ configuracion.productos }}</pre>
  <!-- Selector de Ramo -->
  <div v-if="step == 1">
    <h2 class="w-full text-center mb-5">Selecciona un ramo:</h2>
    <div class="divItems">
      <div
        class="divPlanItem"
        v-for="(ramo, index) in ramos"
        @click="selectRamo(ramo)"
      >
        <h4 class="">{{ ramo.label }}</h4>
      </div>
    </div>
  </div>
  <!-- Selector de compañias -->
  <div v-if="step == 2">
    <h2 class="w-full text-center mb-5">Selecciona una o varias compañias:</h2>
    <div class="divItems" v-if="companias.length > 0">
      <div
        class="divPlanItem"
        :class="[
          item.companias_productos.length == 0 ? 'disabledItem' : '',
          isCompaniaSelected(item) ? 'activeItem' : '',
        ]"
        v-for="(item, index) in companias"
        @click="() => selectCompania(item)"
      >
        <h4 class="">{{ item.nombre }}</h4>

        <span v-if="item.companias_productos.length" class="badge">
          {{ item.companias_productos.length }}
        </span>
      </div>
    </div>
    <div v-else>
      <h4 class="text-center">No hay compañias disponibles</h4>
    </div>
    <div class="divButtons">
      <VBtn variant="outlined" color="secondary" @click="resetCotizacion">
        Cancelar
      </VBtn>
      <VBtn
        :disabled="!configuracion.compania.length"
        @click="goToSeleccionarProducto"
        >Continuar</VBtn
      >
    </div>
  </div>
  <!-- Selector de productos -->
  <div v-if="step == 3">
    <h2 class="w-full text-center mb-5">Selecciona uno o varios productos:</h2>
    <div class="divItems">
      <div class="card" v-for="(compania, index) in configuracion.compania">
        <p class="titleSeparator">{{ compania.nombreCorto }}</p>
        <template v-for="(item, i) in compania.companias_productos">
          <!-- v-model="" -->
          <VCheckbox
            :label="item.nombre"
            true-icon="tabler-checkbox"
            false-icon="tabler-square"
            color="primary"
            v-model="item.selected"
            @update:model-value="(val) => selectProducto(val, item)"
          />
        </template>
      </div>
    </div>
    <div class="divButtons">
      <VBtn variant="outlined" color="secondary" @click="resetCotizacion">
        Cancelar
      </VBtn>
      <VBtn :disabled="!configuracion.productos.length">Continuar</VBtn>
    </div>
  </div>
  <!-- Selector de entrevistas -->
  <div v-if="step == 4">
    <h2 class="w-full text-center mb-5">Entrevista de cotizacion:</h2>
    <div class="divItems">
      <div v-for="(item, index) in configuracion.productos">
        <p class="titleSeparator">{{ item.nombre }}</p>
      </div>
      <div class="card" v-for="() in configuracion.compania">
        <CotizacionPlanSeguro />
      </div>
    </div>
    <div class="divButtons">
      <VBtn variant="outlined" color="secondary" @click="resetCotizacion">
        Cancelar
      </VBtn>
      <VBtn :disabled="!configuracion.productos.length">Continuar</VBtn>
    </div>
  </div>
</template>
