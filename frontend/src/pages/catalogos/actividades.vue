<script setup lang="ts">
definePage({
  meta: {
    requiresAuth: true,
    action: "read",
    subject: "Dashboard",
  },
});
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
  fetch: "/api/catalogo/actividades/get", // Endpoint para obtener datos
  create: "/api/catalogo/actividades", // Endpoint para crear un elemento
  update: "/api/catalogo/actividades", // Endpoint para actualizar un elemento
  delete: "/api/catalogo/actividades/delete", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Actividades"
    :formModal="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
