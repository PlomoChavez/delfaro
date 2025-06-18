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
  fetch: "/api/catalogo/ramos/get", // Endpoint para obtener datos
  create: "/api/catalogo/ramos", // Endpoint para crear un elemento
  update: "/api/catalogo/ramos", // Endpoint para actualizar un elemento
  delete: "/api/catalogo/ramos/delete", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Ramos"
    :formModal="true"
    :estatusDefault="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
