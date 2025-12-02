<script lang="ts" setup>
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
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
    label: "Correo electrónico",
    type: "text",
    model: "correoElectronico",
    classElement: " col-12 ",
  },
];

const dataform: any = reactive({});

const esCorreoValido = (correo: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar correos
  return regex.test(correo);
};

const handleEnviarCorreo = async () => {
  if (!dataform.correoElectronico) {
    showErrorMessage({
      title: "Error",
      message: "El campo de correo electrónico es obligatorio.",
    });
    return;
  } else if (!esCorreoValido(dataform.correoElectronico)) {
    showErrorMessage({
      title: "Error",
      message: "El correo electrónico no es válido.",
    });
    return;
  } else {
    const response = await customRequest({
      url: "/api/polizas/envio",
      method: "POST",
      data: {
        poliza_id: props.data.id,
      },
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
  }
};

onMounted(() => {
  let tmp = toRaw(props.data);

  console.log("Datos de la póliza para enviar por correo:", tmp);

  Object.assign(dataform, {
    numeroPoliza: tmp.numeroPoliza,
    compania: tmp.compania,
    ramo: tmp.ramo,
    producto: tmp.producto,
    correoElectronico: tmp.cliente.correo || "",
    id: tmp.id,
  });
});
</script>

<template>
  <div class="d-flex mb-6">
    <VIcon :icon="'tabler-mail-fast'" size="40" />
    <h1 class="pl-4 my-auto fontBold">Enviar archivos de Póliza</h1>
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
        color="primary"
        variant="outlined"
        rounded
        @click="handleEnviarCorreo"
      >
        <VIcon start icon="tabler-mail-fast" />
        Enviar archivos de póliza por correo
      </VBtn>
    </div>
  </VCard>
</template>
