<template>
  <VCard class="w600 rounded-lg mx-auto p20">
    <div>
      <h4 class="mb-4">Registro de Pago</h4>
      <FormFactory
        :schema="schemaAsegurado"
        :formLive="true"
        :modelValue="formPago"
        :showButtonsAction="false"
        :showMessageRequired="false"
      />

      <p class="fontBold ptDiv">Documento de soporte</p>

      <!-- Área para agregar o arrastrar un documento -->
      <div
        v-if="!documento"
        class="dropzone w-full p-6 border-dashed border-2 border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
        @dragover.prevent
        @drop="handleFileDrop"
      >
        <p
          class="text-gray-500 font-medium p0 m0 p40"
          @click="fileInput?.click()"
        >
          Arrastra un archivo aquí o haz clic para seleccionarlo
        </p>
      </div>
      <input
        hidden
        type="file"
        class="hidden"
        ref="fileInput"
        @change="handleFileChange"
      />

      <!-- Mostrar archivo seleccionado -->
      <div
        v-if="documento"
        class="p-4 border border-gray-300 rounded-lg bg-gray-50"
      >
        <div class="flex items-center justify-between text-center">
          <div class="mb10">
            <div class="text-sm text-gray-700">
              <strong>Archivo seleccionado:</strong>
            </div>
            <div class="text-sm text-gray-700">
              {{ documento?.name ?? "" }}
            </div>
          </div>
          <VBtn
            size="small"
            variant="outlined"
            color="error"
            @click="removeFile"
          >
            <VIcon start icon="tabler-trash" /> Eliminar
          </VBtn>
        </div>
      </div>

      <VBtn
        class="mt-3"
        block
        size="small"
        variant="outlined"
        color="primary"
        @click="handleShowMessage"
      >
        <VIcon start icon="tabler-location-check" />
        Registrar pago
      </VBtn>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import {
  showConfirmationMessage,
  showErrorMessage,
  showSuccessMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
import { useRouter } from "vue-router";
const router = useRouter();

// Props y eventos
const props = withDefaults(
  defineProps<{
    recibo: any;
    btnCancelar?: boolean;
  }>(),
  {
    recibo: {},
    btnCancelar: false,
  }
);

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();

const formPago: any = reactive({});
const documento: any = ref(null);

const handleSubmit = async () => {
  try {
    // Crear un objeto FormData para enviar los datos y el archivo
    const formData = new FormData();
    formData.append("reciboId", formPago.id || ""); // ID del recibo
    formData.append("formaPago", formPago.formaPago.label || "");
    formData.append("fechaPago", formPago.fechaPago || "");
    formData.append("comentarios", formPago.comentarios || "");

    // Agregar el archivo si se seleccionó
    if (documento.value) {
      formData.append("soporte", documento.value);
    }

    // Realizar la solicitud usando customRequest
    const response: any = await customRequest({
      url: "/api/recibos/pagar", // Ruta relativa al backend
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data", // Necesario para enviar archivos
      },
    });

    if (response.data.result) {
      showSuccessMessage({
        title: "Guardado",
        message: "El pago ha sido registrado correctamente.",
      });

      router.push("/");
    } else {
      showErrorMessage({
        title: "Error",
        message: response.data.message,
      });
    }

    // Manejar la respuesta del servidor
    console.log("Pago registrado con éxito:", response.data);
    // Aquí puedes mostrar un mensaje de éxito al usuario
  } catch (error: any) {
    console.error(
      "Error al registrar el pago:",
      error.response?.data || error.message
    );
    // Aquí puedes mostrar un mensaje de error al usuario
  }
};

const handleShowMessage = () => {
  if (!documento.value || !formPago.formaPago || !formPago.fechaPago) {
    showErrorMessage({
      title: "Formulario incompleto",
      message:
        "Para poder registrar el pago, debes completar todos los campos obligatorios.",
    });
  } else if (!documento.value) {
    showConfirmationMessage({
      title: "¿Deseas continuar?",
      message: "No se ha seleccionado ningún archivo, deseas continuar?",
      confirmText: "Sí, continuar",
      cancelText: "Cancelar",
      onConfirm: () => {
        handleSubmit();
      },
      onCancel: () => {},
    });
  } else {
    handleSubmit();
  }
};

// En onMounted:
onMounted(() => {
  Object.assign(formPago, {
    ...props.recibo,
  });
});

const fileInput: any = ref(null);

const schemaAsegurado = [
  {
    label: "Monto ha pagar",
    type: "label",
    model: "montoFormateado",
    classElement: " col-lg-4 ",
  },
  {
    label: "Concepto de pago",
    type: "label",
    model: "concepto",
    classElement: " col-lg-8 ",
  },
  {
    label: "Fecha de pago",
    type: "date",
    model: "fechaPago",
    required: true,
    classElement: " col-12",
  },
  {
    label: "Forma de pago",
    type: "select",
    model: "formaPago",
    required: true,
    options: [
      { label: "Efectivo", value: "Efectivo" },
      { label: "Tarjeta de crédito", value: "Tarjeta de crédito" },
      { label: "Tarjeta de débito", value: "Tarjeta de débito" },
      { label: "Transferencia bancaria", value: "Transferencia bancaria" },
    ],
    classElement: " col-12",
  },
  {
    label: "Comentarios",
    type: "textarea",
    model: "comentarios",
    classElement: " col-12",
  },
];

// Función para manejar el archivo seleccionado
const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    documento.value = event.dataTransfer.files[0]; // Eliminar `.value`
  }
};
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    documento.value = target.files[0];
  }
};

// Función para eliminar el archivo seleccionado
const removeFile = () => {
  documento.value = null; // Eliminar `.value`
};
</script>

<style scoped>
.ptDiv {
  padding: 0;
  margin: 0;
  padding-top: 1rem;
}
.dropzone {
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone:hover {
  border-color: #3b82f6; /* Azul */
  background-color: #eff6ff; /* Azul claro */
}
</style>
