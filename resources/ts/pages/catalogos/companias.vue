<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import FormEdit from "@/components/forms/companias/CompaniasFormEdit.vue";

const showFormEdit = ref(false); // Referencia al componente FormFactory
const data = ref(null); // Referencia al componente FormFactory

// prettier-ignore
const formSchema = [
  { label: "RFC", type: "text", model: "rfc", placeholder: "Ingresa el nombre" },
  { label: "Nombre corto", type: "text", model: "nombreCorto", placeholder: "Ingresa el nombre" },
  { label: "Nombre", type: "text", model: "nombre", placeholder: "Ingresa el nombre" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre corto", key: "nombreCorto" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/companias/get", // Endpoint para obtener datos
  create: "/api/companias/create", // Endpoint para crear un elemento
  update: "/api/companias/update", // Endpoint para actualizar un elemento
  delete: "/api/companias/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  data.value = { ...dataRow };
  showFormEdit.value = true;
};

const handleAtras = () => {
  showFormEdit.value = false;
};
</script>

<template>
  <FormEdit v-if="showFormEdit" :data="data" @atras="handleAtras" />
  <div v-else>
    <h1>Compañias</h1>
    <CrudManager
      title="
      Compañias"
      :emitEdit="true"
      :formModal="true"
      :show-title="false"
      :formSchema="formSchema"
      :tableHeaders="tableHeaders"
      :apiEndpoints="apiEndpoints"
      @customEdit="handleActionsEdit"
    />
  </div>
</template>
