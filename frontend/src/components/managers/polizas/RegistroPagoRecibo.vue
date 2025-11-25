<template>
  <VCard class="w600 rounded-lg mx-auto p20">
    <div>
      <h4 class="mb-4">Registro de Pago</h4>
      <FormFactory
        :schema="schemaAsegurado"
        :formLive="true"
        :modelValue="formPago"
        :showButtonsAction="false"
      />

      <!-- Área para agregar o arrastrar un documento -->
      <div
        v-if="!documento"
        class="dropzone w-full p-6 border-dashed border-2 border-gray-300 rounded-lg text-center mt-4 hover:border-blue-500 hover:bg-blue-50 transition-all"
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
        class="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50"
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
    </div>
  </VCard>
  <pre>{{ formPago }}</pre>
</template>

<script setup lang="ts">
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
    classElement: " col-12",
  },
  {
    label: "Forma de pago",
    type: "select",
    model: "formaPago",
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
.dropzone {
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone:hover {
  border-color: #3b82f6; /* Azul */
  background-color: #eff6ff; /* Azul claro */
}
</style>
