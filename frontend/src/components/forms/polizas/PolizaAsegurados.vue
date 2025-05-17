<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import PolizaVincularAsegurados from "@/components/forms/polizas/PolizaVincularAsegurados.vue";
import { defineEmits, ref } from "vue";
const emit = defineEmits<{
  (event: "actionSeleccionar", item: any): void;
}>();

const props = withDefaults(
  defineProps<{
    data?: any;
  }>(),
  {
    data: {},
  }
);

// prettier-ignore
const formSchema = [
  { label: "Nombre",              type: "text",   model: "nombre",          },
  { label: "RFC",                 type: "text",   model: "rfc",             },
  { label: "Fecha de nacimiento", type: "date",   model: "fechaNacimiento", },
  { label: "Direccion",           type: "text", model: "direccion",         },
  { label: "Colonia",             type: "text", model: "colonia",           },
  { label: "Codigo Postal",       type: "text", model: "codigoPostal",      },
  { label: "Estado",              type: "select", model: "estado",          catalogo:"estados"},
  { label: "Ciudad",              type: "text", model: "ciudad",            },
  { label: "Correo electronico",  type: "text", model: "correo", },
  { label: "Telefono",            type: "text", model: "telefono",          },
  { label: "Celular",             type: "text", model: "celular",           },
  { label: "Oficina",             type: "text", model: "oficina",           },
  { label: "Casa",                type: "text", model: "casa",              },
];
const showForm = ref(false); // Referencia al componente FormFactory
const data = ref(null); // Referencia al componente FormFactory
const configTable = ref({ actions: ["Editar", "Eliminar"] });

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "RFC", key: "rfc" },
  { title: "Telefono", key: "telefono" },
  { title: "Correo", key: "correo" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/polizas/asegurados/get", // Endpoint para obtener datos
  create: "/api/polizas/asegurados", // Endpoint para crear un elemento
  update: "/api/polizas/asegurados", // Endpoint para actualizar un elemento
  delete: "/api/polizas/asegurados/delete", // Endpoint para eliminar un elemento
};
const handleCreate = (data: any) => {
  showForm.value = true;
  console.log("actionCreate", data);
};
const handleCreateOfCliente = (data: any) => {
  handleCreateOfCliente(data);
};
const handleCustomAction = (data: any) => {
  let { action, item } = data;
  switch (action) {
    case "Seleccionar":
      handleCreateOfCliente(item);
      break;
    default:
      console.log("Acción no reconocida");
  }
};
</script>

<template>
  <div>
    <PolizaVincularAsegurados
      v-if="showForm"
      :data="props.data"
      @cancelar="showForm = false"
    />
    <!-- prettier-ignore -->
    <CrudManager
      v-else
      title="Asegurados"
      :show-title="false"
      :emitNew="true"
      :formSchema="formSchema"
      :tableHeaders="tableHeaders"
      :apiEndpoints="apiEndpoints"
      :payloadDefault="{ poliza_id: props.data.id }"
      :configTable="configTable"
      @customCreate="handleCreate"
    />
  </div>
</template>
