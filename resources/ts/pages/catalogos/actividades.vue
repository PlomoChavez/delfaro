<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";

const formSchema = [
  {
    label: "Nombre",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Correo",
    type: "email",
    model: "email",
    placeholder: "Ingresa el correo",
  },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Label", key: "label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "email" },
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
