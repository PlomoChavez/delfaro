<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";

// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "label", placeholder: "Ingresa el nombre" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Label", key: "label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/catalogo/estatus-cliente/get", // Endpoint para obtener datos
  create: "/api/catalogo/estatus-cliente", // Endpoint para crear un elemento
  update: "/api/catalogo/estatus-cliente", // Endpoint para actualizar un elemento
  delete: "/api/catalogo/estatus-cliente/delete", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Estatus de Clientes"
    :formModal="true"
    :estatusDefault="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
