<script lang="ts" setup>
import {
  showConfirmationMessage,
  showErrorMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
import { customRequest } from "@/utils/axiosInstance";
// Props y eventos
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "goInicio"): void;
  (event: "cancelar"): void;
  (event: "changePanel", idx?: any): void;
}>();

const schemaResumenPoliza = [
  {
    label: "Número de póliza",
    type: "label",
    model: "numeroPoliza",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Compañía",
    type: "label",
    model: "compania.nombre",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Ramo",
    type: "label",
    model: "ramo.label",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Producto",
    type: "label",
    model: "producto.nombre",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Motivo de cancelación",
    type: "text",
    model: "motivoCancelacion",
    classElement: " col-12 ",
  },
];

const dataform: any = reactive({});

const handleCancelarPoliza = () => {
  showConfirmationMessage({
    title: "¿Deseas emitir esta cotización?",
    message: "Este proceso no se puede revertir.",
    confirmText: "Sí, continuar",
    cancelText: "Cancelar",
    onConfirm: async () => {
      cancelarPoliza();
    },
    onCancel: () => {},
  });
};

const cancelarPoliza = async () => {
  console.log("Cancelar póliza");
  let tmp = dataform;
  console.log("Data del formulario:", tmp);
  let payload = {
    poliza_id: tmp.id,
    motivo: tmp.motivoCancelacion,
  };

  console.log("Data del formulario:", tmp);
  console.log("Data del formulario:", payload);

  const response = await customRequest({
    url: "/api/polizas/cancelar",
    method: "POST",
    data: payload,
  });
  console.log("Respuesta de cancelar póliza:", response);
  if (response.data.result) {
    emit("goInicio");
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
};

onMounted(() => {
  let tmp = toRaw(props.data);

  Object.assign(dataform, {
    numeroPoliza: tmp.numeroPoliza,
    compania: tmp.compania,
    ramo: tmp.ramo,
    producto: tmp.producto,
    id: tmp.id,
  });
});
</script>

<template>
  <div class="d-flex mb-6">
    <VIcon :icon="'tabler-progress-x'" size="40" />
    <h1 class="pl-4 my-auto fontBold">Cancelar Póliza</h1>
  </div>
  <VCard class="rounded-lg w400 p20 mx-auto">
    <FormFactory
      :schema="schemaResumenPoliza"
      :formLive="true"
      :modelValue="dataform"
      :showButtonsAction="false"
    />
    <div class="col-11 mx-auto mt-2">
      <VBtn
        block
        size="small"
        variant="outlined"
        rounded="danger"
        @click="handleCancelarPoliza"
      >
        <VIcon start icon="tabler-eraser" />
        Cancelar poliza
      </VBtn>
    </div>
  </VCard>
</template>
