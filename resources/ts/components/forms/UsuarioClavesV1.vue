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

const title = ref("Claves de compañias"); // Referencia al componente FormFactory
const showFormEdit = ref(false); // Referencia al componente FormFactory
const data = ref(null); // Referencia al componente FormFactory
const payloadDefault = ref({
  usuario_id: props.data.id,
}); // Referencia al componente FormFactory

// prettier-ignore
const formSchema = [
  { label: "Clave",     model: "clave",   type: "text",    placeholder: "Ingresa la clave del agente" },
  { label: "Compañia",  model: "compania", type: "select",  placeholder: "Selecciona una compañia", catalogo: "companias", config: { label: "nombreCorto", } },
  { label: "Estatus",   model: "estatus" , type: "switch"},
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "Cargo", key: "cargo" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

// prettier-ignore
const apiEndpoints = {
  fetch:  "/api/usuario/claves/get", // Endpoint para obtener datos
  create: "/api/usuario/claves", // Endpoint para crear un elemento
  update: "/api/usuario/claves", // Endpoint para actualizar un elemento
  delete: "/api/usuario/claves/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  data.value = { ...dataRow };
  console.log("handleActionsEdit", data);
  showFormEdit.value = true;
};

const handleActionCreate = (dataRow: any) => {
  console.log("handleActionCreate ", dataRow);
};

const handleActionDelete = (dataRow: any) => {
  console.log("handleActionDelete", dataRow);
};

const handleAtras = () => {
  showFormEdit.value = false;
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
    @customCreate="handleActionCreate"
    @customEdit="handleActionsEdit"
    @customDelete="handleActionDelete"
  />
</template>
