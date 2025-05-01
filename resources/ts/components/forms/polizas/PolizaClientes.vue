<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import { defineEmits, ref } from "vue";
const emit = defineEmits<{
  (event: "actionSeleccionar", item: any): void;
}>();
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
const showFormEdit = ref(false); // Referencia al componente FormFactory
const data = ref(null); // Referencia al componente FormFactory
const configTable = ref({ actions: ["Seleccionar"] });

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
  fetch: "/api/clientes/get", // Endpoint para obtener datos
  create: "/api/clientes/create", // Endpoint para crear un elemento
  update: "/api/clientes/update", // Endpoint para actualizar un elemento
  delete: "/api/clientes/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  data.value = { ...dataRow };
  showFormEdit.value = true;
};
const handleCancelar = () => {
  showFormEdit.value = false;
};
const handleCustomAction = (data: any) => {
  let { action, item } = data;
  switch (action) {
    case "Seleccionar":
      emit("actionSeleccionar", item);
      break;
    default:
      console.log("Acción no reconocida");
  }
};
</script>

<template>
  <div>
    <!-- prettier-ignore -->
    <CrudManager
      title="Clientes"
      :show-title="false"
      :customAction="true"
      :formSchema="formSchema"
      :tableHeaders="tableHeaders"
      :apiEndpoints="apiEndpoints"
      :configTable="configTable"
      @customAction="handleCustomAction"
      @customEdit="handleActionsEdit"
    />
  </div>
</template>
