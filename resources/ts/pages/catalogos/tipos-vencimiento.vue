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
  { title: "Label", key: "nombre" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "email" },
];

const apiEndpoints = {
  fetch: "/api/actividades", // Endpoint para obtener datos
  create: "/api/actividades", // Endpoint para crear un elemento
  update: "/api/actividades", // Endpoint para actualizar un elemento
  delete: "/api/actividades", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Tipos de vencimiento"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
