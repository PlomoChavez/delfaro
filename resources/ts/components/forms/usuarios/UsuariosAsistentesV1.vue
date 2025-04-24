<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
// prettier-ignore
import { defineProps, ref } from "vue";

const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const title = ref("Asistentes"); // Referencia al componente FormFactory
const payloadDefault = ref({
  principal_id: props.data.id,
  tipo: { id: 5 },
});

// prettier-ignore
const formSchema = [
  { label: "Nombre",              type: "text",   model: "nombre",    placeholder: "Ingresa el nombre" },
  { label: "Correo electronico",  type: "text",   model: "correo",    placeholder: "Ingresa el nombre" },
  { label: "Contraseña",          type: "text",   model: "password",  placeholder: "Ingresa el nombre" },
  { label: "Estatus",             type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "usuario.nombre" },
  { title: "Tipo", key: "tipo.label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

// prettier-ignore
const apiEndpoints = {
  fetch:  "/api/usuario/team/get", // Endpoint para obtener datos
  create: "/api/usuario/team", // Endpoint para crear un elemento
  update: "/api/usuario/team", // Endpoint para actualizar un elemento
  delete: "/api/usuario/team/delete", // Endpoint para eliminar un elemento
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
  />
</template>
