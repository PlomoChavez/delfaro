<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";

const formSchema = [
  {
    label: "RFC",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Nombre o razon social",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Fecha de nacimiento ",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Direccion",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Codigo postal",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Estado",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Ciudad",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Email",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Tel Celular",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Tel Oficina",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
  {
    label: "Tel Casa",
    type: "text",
    model: "nombre",
    placeholder: "Ingresa el nombre",
  },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "RFC", key: "estatus" },
  { title: "NoAsegurado", key: "email" },
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
    title="Gestión de Actividades"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
