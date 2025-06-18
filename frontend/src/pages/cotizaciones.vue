<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import Multicotizaciones from "@/components/forms/cotizaciones/multicotizaciones.vue";

const showWizard = ref(false); // Referencia al componente FormFactory
const showFormEdit = ref(false); // Referencia al componente FormFactory
const dataLocal: any = ref(null); // Referencia al componente FormFactory

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
  { title: "Últ. Modificación", key: "updated_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/cotizaciones", // Endpoint para obtener datos
  create: "/api/cotizaciones/create", // Endpoint para crear un elemento
  update: "/api/cotizaciones/update", // Endpoint para actualizar un elemento
  delete: "/api/cotizaciones/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  let tmp = JSON.parse(JSON.stringify(dataRow)); // Clonar el objeto para evitar mutaciones
  tmp.configuracion = JSON.parse(tmp.configuracion || "{}"); // Asegurarse de que configuracion sea un objeto
  dataLocal.value = tmp;
  showWizard.value = true;
};

const handleActionsCreate = () => {
  dataLocal.value = {}; // Reiniciar dataLocal para crear una nueva cotización
  showWizard.value = true;
};
const handleActionsCancel = () => {
  showWizard.value = false;
  showFormEdit.value = false;
};
</script>

<template>
  <div v-if="showWizard">
    <Multicotizaciones
      :registro="dataLocal"
      @cotizar="showWizard = false"
      @cancelar="handleActionsCancel"
    />
  </div>
  <div v-if="!showWizard && !showFormEdit">
    <CrudManager
      title="Cotizaciones"
      :formModal="true"
      :show-title="true"
      :emitEdit="true"
      :emitNew="true"
      :tableHeaders="tableHeaders"
      :filtroAgrupador="'compania.nombreCorto'"
      :filtroAgrupadorInicial="'Todos'"
      :apiEndpoints="apiEndpoints"
      @customEdit="handleActionsEdit"
      @customCreate="handleActionsCreate"
    />
  </div>
</template>
