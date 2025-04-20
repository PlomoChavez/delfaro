<script setup lang="ts">
import DataTable from "@/components/apps/DataTable.vue";
import FormFactory from "@/components/apps/FormFactory.vue";
import {
  showDeleteItem,
  showSuccessMessage,
} from "@/components/apps/sweetAlerts/sweetDeleteItem";
import { customRequest } from "@/utils/axiosInstance";
import { onBeforeMount, ref } from "vue";

interface FormSchemaField {
  label: string;
  type: string;
  model: string;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
}

interface TableHeader {
  title: string;
  key: string;
}

const props = defineProps<{
  title: string; // Título del módulo
  formSchema: FormSchemaField[]; // Esquema del formulario
  tableHeaders: TableHeader[]; // Esquema de la tabla
  formModal?: boolean; // Indica si el formulario será un modal
  apiEndpoints: {
    fetch: string; // Endpoint para obtener datos
    create: string; // Endpoint para crear un elemento
    update: string; // Endpoint para actualizar un elemento
    delete: string; // Endpoint para eliminar un elemento
  };
}>();

const showForm = ref(false); // Referencia al componente FormFactory
const formFactoryRef = ref(null); // Referencia al componente FormFactory
const formData = ref<Record<string, any>>({});
const tableData = ref<any[]>([]);
const isDialogVisible = ref(false);

async function fetchTableData() {
  try {
    const response = await customRequest(props.apiEndpoints.fetch);
    if (response.data.result && response.data.data) {
      tableData.value = response.data.data.map((item: any) => ({
        ...item,
        estatus: item.estatus ? "Activo" : "Inactivo",
        created_at: formatToAmPm(item.created_at),
      }));
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

async function handleFormSubmit(data: Record<string, any>) {
  try {
    await customRequest({
      url: props.apiEndpoints.create,
      method: "POST",
      data,
    });
    await fetchTableData();
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
  }
}

async function handleDeleteItem(id: string | number) {
  try {
    await customRequest({
      url: `${props.apiEndpoints.delete}`,
      method: "POST",
      data: { id },
    });
    await fetchTableData();
  } catch (error) {
    console.error("Error al eliminar el elemento:", error);
  }
}

function openModal() {
  isDialogVisible.value = true;
}
function handleCancelarForm() {
  if (props.formModal) {
    isDialogVisible.value = !isDialogVisible.value;
  } else {
    showForm.value = !showForm.value;
  }
}

function handleNewItem() {
  handleShowForm(null);
}

function handleShowForm(item: Record<string, any> | null = null) {
  formData.value = item ? { ...item } : {};
  if (props.formModal) {
    isDialogVisible.value = !isDialogVisible.value;
  } else {
    showForm.value = true; // Muestra el formulario
  }
}

function formatToAmPm(dateString: string): string {
  const date = new Date(dateString);

  // Formatear la fecha (día/mes/año)
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Los meses comienzan en 0
  const year = date.getFullYear();

  // Formatear la hora (AM/PM)
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convierte 0 a 12 para la medianoche
  const formattedMinutes = minutes.toString().padStart(2, "0");

  // Combinar fecha y hora
  return `${day}/${month}/${year} ${formattedHours}:${formattedMinutes} ${amPm}`;
}

function handleActionClick({ action, item }: { action: string; item: any }) {
  if (action === "Eliminar") {
    showDeleteItem({
      title: "¿Estás seguro de eliminar este registro?",
      message: "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {
        handleDeleteItem(item.id);
        showSuccessMessage({});
      },
      onCancel: () => {},
    });
  } else if (action === "Editar") {
    let tmp = { ...item };
    tmp.estatus = tmp.estatus === "Activo" ? true : false;
    handleShowForm(tmp);
  }
}
onBeforeMount(() => {
  fetchTableData();
});
</script>

<template>
  <div class="">
    <h1>{{ title }}</h1>
    <div class="card">
      <div v-if="showForm || props.formModal">
        <FormFactory
          ref="formFactoryRef"
          :title="title"
          :schema="formSchema"
          :modelValue="formData"
          :formModal="props.formModal"
          :isDialogVisible="isDialogVisible"
          @update:isDialogVisible="handleCancelarForm"
          @submit="handleFormSubmit"
        />
      </div>
      <div v-if="showForm == false || props.formModal">
        <div class="d-flex justify-end align-center mb-5">
          <VBtn @click="handleNewItem">
            <VIcon start icon="tabler-checkbox" />
            Nuevo
          </VBtn>
        </div>
        <DataTable
          :headers="tableHeaders"
          :data="tableData"
          :config="{ actions: ['Editar', 'Eliminar'] }"
          @action="handleActionClick"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
.swal2-confirm {
  color: white !important; /* Cambia el color del texto del botón de confirmación */
  font-weight: bold !important;
  background-color: #a7c7e7 !important; /* Azul pastel */
  border: none !important;
}

.swal2-confirm button {
  color: white !important; /* Cambia el color del texto del botón de confirmación */
  font-weight: bold !important;
  background-color: #a7c7e7 !important; /* Azul pastel */
  border: none !important;
}

/* Estilo para el botón de cancelar */
.swal2-cancel {
  color: black !important; /* Cambia el color del texto del botón de cancelar */
  font-weight: bold !important;
  background-color: #b0b0b0 !important; /* Negro pastel */
  border: none !important;
}
</style>
