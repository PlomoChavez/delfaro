<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import FormEdit from "@/components/forms/CompaniasFormEdit.vue";
// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "nombre", placeholder: "Ingresa el nombre" },
  { label: "Correo electronico", type: "text", model: "correo", placeholder: "Ingresa el nombre" },
  { label: "Contraseña", type: "text", model: "password", placeholder: "Ingresa el nombre" },
  { label: "Tipo de usuario", type: "select", model: "tipo_id", placeholder: "Selecciona el tipo de usuario", catalogo: "tipos-usuarios" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const showFormEdit = ref(false); // Referencia al componente FormFactory
const data = ref(null); // Referencia al componente FormFactory

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Label", key: "label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/usuarios/get", // Endpoint para obtener datos
  create: "/api/usuarios/create", // Endpoint para crear un elemento
  update: "/api/usuarios/update", // Endpoint para actualizar un elemento
  delete: "/api/usuarios/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (data: any) => {
  showFormEdit.value = true;
  console.log("handleActionsEdit", data);
};
const handleCancelar = (data: any) => {
  showFormEdit.value = false;
};
</script>

<template>
  <h1>Usuarios</h1>
  <FormEdit v-if="showFormEdit" :data="data" @cancelar="handleCancelar" />
  <CrudManager
    v-else
    title="Usuarios"
    :emitEdit="true"
    :formModal="true"
    :show-title="false"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
    @customEdit="handleActionsEdit"
  />
</template>
