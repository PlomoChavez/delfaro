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
  fetch: "/api/catalogo/tipo-usuario/get", // Endpoint para obtener datos
  create: "/api/catalogo/tipo-usuario", // Endpoint para crear un elemento
  update: "/api/catalogo/tipo-usuario", // Endpoint para actualizar un elemento
  delete: "/api/catalogo/tipo-usuario/delete", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Tipos de usuario"
    :formModal="true"
    ;emitEdit="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
