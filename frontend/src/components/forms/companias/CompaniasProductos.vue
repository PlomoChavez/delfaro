<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
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

const handleActionCreate = (dataRow: any) => {
  console.log("handleActionCreate ", dataRow);
};

const handleActionDelete = (dataRow: any) => {
  console.log("handleActionDelete", dataRow);
};

const handleAtras = () => {
  showFormEdit.value = false;
};
</script>

<template>
  <CrudManager
    :title="title"
    :formModal="true"
    :formSchema="formSchema"
    :payloadDefault="payloadDefault"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
    @customCreate="handleActionCreate"
    @customEdit="handleActionsEdit"
    @customDelete="handleActionDelete"
  />
</template>
