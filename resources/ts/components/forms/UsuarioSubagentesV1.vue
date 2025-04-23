<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import ManagerUsuario from "@/components/managers/ManagerUsuarioV2.vue";
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);
const payloadDefault = ref({
  principal_id: props.data.id,
  tipo: { id: 4 },
});
// prettier-ignore
const formSchema = [
  { label: "Nombre",              type: "text",   model: "nombre",    placeholder: "Ingresa el nombre" },
  { label: "Correo electronico",  type: "text",   model: "correo",    placeholder: "Ingresa el nombre" },
  { label: "Contraseña",          type: "text",   model: "password",  placeholder: "Ingresa el nombre" },
  { label: "Tipo de usuario",     type: "select", model: "tipo",      placeholder: "Selecciona el tipo de usuario", catalogo: "tipos-usuarios"},
  { label: "Estatus",             type: "switch", model: "estatus" },
];
const showFormEdit = ref(false); // Referencia al componente FormFactory
const data = ref(null); // Referencia al componente FormFactory

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "Tipo", key: "tipo.label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/usuario/team/get", // Endpoint para obtener datos
  create: "/api/usuario/team", // Endpoint para crear un elemento
  update: "/api/usuario/team", // Endpoint para actualizar un elemento
  delete: "/api/usuario/team/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  data.value = { ...dataRow, ...dataRow.usuario };
  showFormEdit.value = true;
};
const handleCancelar = () => {
  showFormEdit.value = false;
};
</script>

<template>
  <!-- prettier-ignore -->
  <ManagerUsuario v-if="showFormEdit" :data="data" @cancelar="handleCancelar" />
  <div v-else>
    <h1>Subagentes</h1>
    <CrudManager
      title="Subagentes"
      :emitEdit="true"
      :formModal="true"
      :show-title="false"
      :formSchema="formSchema"
      :tableHeaders="tableHeaders"
      :apiEndpoints="apiEndpoints"
      @customEdit="handleActionsEdit"
      :payloadDefault="payloadDefault"
    />
  </div>
</template>
