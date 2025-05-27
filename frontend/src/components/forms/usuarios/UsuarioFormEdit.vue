<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
// prettier-ignore
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const title = ref("Representantes"); // Referencia al componente FormFactory
const showFormEdit = ref(false); // Referencia al componente FormFactory
const data = ref(null); // Referencia al componente FormFactory
const payloadDefault = ref({
  compania_id: props.data.id,
}); // Referencia al componente FormFactory

// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "nombre", placeholder: "Ingresa el nombre" },
  { label: "Telefono", type: "text", model: "telefono", placeholder: "Ingresa el nombre" },
  { label: "Correo electronico", type: "text", model: "correo", placeholder: "Ingresa el nombre" },
  { label: "Cargo", type: "text", model: "cargo", placeholder: "Ingresa el nombre" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "Cargo", key: "cargo" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/companias/representantes/get", // Endpoint para obtener datos
  create: "/api/companias/representantes", // Endpoint para crear un elemento
  update: "/api/companias/representantes", // Endpoint para actualizar un elemento
  delete: "/api/companias/representantes/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  let tmp = { ...dataRow };
  tmp.tipo = {
    id: 1,
    label: "Director",
    estatus: 1,
    created_at: "2025-04-20 00:48:28",
    updated_at: "2025-04-20 00:48:28",
    deleted_at: null,
  };

  data.value = { ...tmp };

  console.log("handleActionsEdit", tmp);
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
