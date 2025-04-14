<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import FormFactory from "@/components/apps/FormFactory.vue";
import DataTable from "@/components/apps/DataTable.vue";

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
    const response = await axios.get(props.apiEndpoints.fetch);
    if (Array.isArray(response.data)) {
      tableData.value = response.data;
    } else {
      tableData.value = [];
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

async function handleFormSubmit(data: Record<string, any>) {
  try {
    if (data.id) {
      await axios.put(`${props.apiEndpoints.update}/${data.id}`, data);
    } else {
      await axios.post(props.apiEndpoints.create, data);
    }
    await fetchTableData();
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
  }
}

async function handleDeleteItem(id: string | number) {
  try {
    await axios.delete(`${props.apiEndpoints.delete}/${id}`);
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

function handleShowForm(item: Record<string, any> | null = null) {
  formData.value = item ? { ...item } : {};
  if (props.formModal) {
    isDialogVisible.value = !isDialogVisible.value;
  } else {
    showForm.value = true; // Muestra el formulario
  }
}

function handleActionClick({ action, item }: { action: string; item: any }) {
  if (action === "Eliminar") {
    if (confirm("¿Estás seguro de que deseas eliminar este elemento?")) {
      handleDeleteItem(item.id);
    }
  } else if (action === "Editar") {
    handleShowForm(item);
  }
}

fetchTableData();
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
          <VBtn @click="handleShowForm">
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
</style>
