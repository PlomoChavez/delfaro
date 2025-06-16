<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import PolizasWizard from "@/components/forms/polizas/PolizasWizard.vue";
import ManagerPolizas from "@/components/managers/ManagerPolizas.vue";

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
const showWizard = ref(false); // Referencia al componente FormFactory

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "No. Poliza", key: "numeroPoliza" },
  { title: "No. Cliente", key: "numeroCliente" },
  { title: "Cliente", key: "cliente.nombre" },
  { title: "Compañia", key: "compania.nombreCorto" },
  { title: "Ramo", key: "ramo.label" },
  { title: "Producto", key: "producto.nombre" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/polizas/get", // Endpoint para obtener datos
  create: "/api/polizas/create", // Endpoint para crear un elemento
  update: "/api/polizas/update", // Endpoint para actualizar un elemento
  delete: "/api/polizas/delete", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  data.value = {
    ...dataRow,
    metodoPago: dataRow["metodo_pago"],
    formaPago: dataRow["forma_pago"],
    tipoVencimiento: dataRow["tipo_vencimiento"],
    cliente: {
      ...dataRow["cliente"],
      label: dataRow["cliente"]["nombre"],
    },
    subAgente: dataRow["sub_agente"],
  };
  showFormEdit.value = true;
};
const handleCancelar = () => {
  showWizard.value = false;
  showFormEdit.value = false;
};
const handleActionsCreate = () => {
  showWizard.value = true;
};
</script>

<template>
  <!-- prettier-ignore -->
  <ManagerPolizas v-if="showFormEdit" :data="data" @cancelar="handleCancelar" />
  <PolizasWizard v-if="showWizard" @cancel="handleCancelar" />
  <div v-if="!showWizard && !showFormEdit">
    <h1>Polizas</h1>
    <CrudManager
      title="Polizas"
      :formModal="true"
      :show-title="false"
      :emitEdit="true"
      :emitNew="true"
      :formSchema="formSchema"
      :tableHeaders="tableHeaders"
      :filtroAgrupador="'compania.nombreCorto'"
      :filtroAgrupadorInicial="'Todos'"
      :apiEndpoints="apiEndpoints"
      @customEdit="handleActionsEdit"
      @customCreate="handleActionsCreate"
    />
  </div>
</template>
