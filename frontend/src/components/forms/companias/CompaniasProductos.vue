<script setup lang="ts">
import {
  showErrorMessage,
  showSuccessMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
import CrudManager from "@/components/apps/VistaUno.vue";
import { customRequest } from "@/utils/axiosInstance";
// prettier-ignore
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const title = ref("Productos"); // Referencia al componente FormFactory
const showFormEdit = ref(false); // Referencia al componente FormFactory
const data = ref(null); // Referencia al componente FormFactory
const refreshTable = ref(false); // Referencia al componente FormFactory
const payloadDefault = ref({
  compania_id: props.data.id,
}); // Referencia al componente FormFactory

// prettier-ignore
const formSchema = [
  { label: "Ramo",      type: "select", model: "ramo",  catalogo: "ramosByCompania", payload:{ compania_id:props.data.id}  },
  { label: "Nombre",    type: "text",   model: "nombre", },
  { label: "Estatus",   type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "ramo", key: "ramo.label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/companias/productos/get", // Endpoint para obtener datos
  create: "/api/companias/productos", // Endpoint para crear un elemento
  update: "/api/companias/productos", // Endpoint para actualizar un elemento
  delete: "/api/companias/productos/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  data.value = { ...dataRow };
  showFormEdit.value = true;
};

const handleActionCreate = async (dataRow: any) => {
  let tmp = {
    ...payloadDefault.value,
    ...dataRow,
  };

  if (tmp.ramo) {
    tmp.ramo_id = tmp.ramo.id;
    delete tmp.ramo;
  }

  const response = await customRequest({
    url: "/api/companias/productos",
    method: "POST",
    data: tmp,
  });
  const dataResponse = response.data;

  if (dataResponse.result) {
    showSuccessMessage({
      title: "Guardado",
      message: dataResponse.message,
    });
    refreshTable.value = true; // Refresh the table after successful creation
    setTimeout(() => {
      showFormEdit.value = false; // Close the form after successful creation
    }, 10);
  } else {
    showErrorMessage({
      title: "Error",
      message: dataResponse.message,
    });
  }
};

const handleActionDelete = (dataRow: any) => {};
</script>

<template>
  <!-- :configTable="configTable" -->
  <CrudManager
    :title="title"
    :formModal="true"
    :emitCreate="true"
    :formSchema="formSchema"
    :refreshTable="refreshTable"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
    :payloadDefault="payloadDefault"
    @customCreate="handleActionCreate"
    @customEdit="handleActionsEdit"
    @customDelete="handleActionDelete"
  />
</template>
