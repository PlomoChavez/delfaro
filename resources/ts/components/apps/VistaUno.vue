<script setup lang="ts">
import DataTable from "@/components/apps/DataTable.vue";
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import {
  showDeleteItem,
  showErrorMessage,
  showSuccessMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
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

const emit = defineEmits<{
  (event: "exportSubmit", item: any): void;
  (event: "customAction", item: any): void;
  (event: "customEdit", item: any): void;
  (event: "customCreate", item: any): void;
  (event: "customDelete", item: any): void;
}>();

const props = withDefaults(
  defineProps<{
    title: string; // Título del módulo
    formSchema: FormSchemaField[]; // Esquema del formulario
    tableHeaders: TableHeader[]; // Esquema de la tabla
    showBtnNuevo?: boolean; // Indica si el formulario será un modal
    formModal?: boolean; // Indica si el formulario será un modal
    customAction?: boolean; // Indica si el formulario será un modal
    emitNew?: boolean; // Indica si el formulario será un modal
    emitCreate?: boolean; // Indica si el formulario será un modal
    emitEdit?: boolean; // Indica si el formulario será un modal
    exportSubmit?: boolean; // Indica si el formulario será un modal
    emitDelete?: boolean; // Indica si el formulario será un modal
    payloadDefault?: any; // Indica si se debe mostrar el título
    showTitle?: boolean; // Indica si se debe mostrar el título
    filtroAgrupador?: string | null; // Indica si se debe mostrar el título
    filtroAgrupadorInicial?: string | null; // Indica si se debe mostrar el título
    subtitulos?: any; // Configuración de la tabla
    configTable?: any; // Configuración de la tabla
    apiEndpoints?: {
      fetch?: string; // Endpoint para obtener datos
      create?: string; // Endpoint para crear un elemento
      update?: string; // Endpoint para actualizar un elemento
      delete?: string; // Endpoint para eliminar un elemento
    };
  }>(),
  {
    configTable: { actions: ["Editar", "Eliminar"] },
    filtroAgrupadorInicial: null,
    subtitulos: null,
    filtroAgrupador: null,
    payloadDefault: null, // Valor predeterminado
    showTitle: true, // Valor predeterminado
    customAction: false, // Valor predeterminado
    exportSubmit: false, // Valor predeterminado
    showBtnNuevo: true, // Valor predeterminado
    emitDelete: false, // Valor predeterminado
  }
);

const showForm = ref(false); // Referencia al componente FormFactory
const formData = ref<Record<string, any>>({});
const tableData = ref<any[]>([]);
const respaldoData = ref<any[]>([]);
const filtroAgrupador = ref<any[]>([]);
const filtroAgrupadorSelected = ref(null);
const isDialogVisible = ref(false);

async function fetchTableData() {
  try {
    let url = props?.apiEndpoints?.fetch ?? "";
    if (url != "") {
      let payload = {};
      if (props.payloadDefault) {
        payload = { ...props.payloadDefault, ...payload };
      }
      const response = await customRequest({
        url: url,
        method: "POST",
        data: payload,
      });
      if (response.data.result && response.data.data) {
        let tmp = response.data.data.map((item: any) => ({
          ...item,
          estatus: item.estatus ? "Activo" : "Inactivo",
          created_at: formatToAmPm(item.created_at),
        }));

        tableData.value = tmp;
        respaldoData.value = tmp;
        if (props.filtroAgrupador) {
          processFiltroagrupador(tmp);
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

async function handleFormSubmit(data: Record<string, any>) {
  try {
    if (props.emitCreate) {
      emit("customCreate", { ...data });
    } else {
      let url = props?.apiEndpoints?.create ?? "";
      let payload = { ...data };
      if (props.payloadDefault) {
        payload = { ...props.payloadDefault, ...payload };
      }
      let response = await customRequest({
        url: url,
        method: "POST",
        data: payload,
      });
      if (response.data.result) {
        if (props.exportSubmit) {
          emit("exportSubmit", { ...data });
        }
        // await handleCancelarForm();
        await fetchTableData();
        showSuccessMessage({
          title: "Guardado",
          message: "El elemento ha sido guardado correctamente.",
        });
      } else {
        showErrorMessage({
          title: "Error",
          message: response.data.message,
        });
      }
    }
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
  }
}

async function handleDeleteItem(item: any) {
  try {
    if (props.emitDelete) {
      // Emitir evento personalizado para manejar la eliminación
      emit("customDelete", item);
    } else {
      let url = props?.apiEndpoints?.delete ?? "";
      let payload = { id: item.id };
      if (props.payloadDefault) {
        payload = { ...props.payloadDefault, ...payload };
      }
      let response = await customRequest({
        url: url,
        method: "POST",
        data: payload,
      });
      if (response.data.result) {
        showSuccessMessage({
          title: "Eliminado",
          message: "El elemento ha sido eliminado correctamente.",
        });
      } else {
        showSuccessMessage({
          title: "Error",
          message: "No se pudo eliminar el elemento.",
        });
      }
      await fetchTableData();
    }
  } catch (error) {
    console.error("Error al eliminar el elemento:", error);
  }
}

function handleCancelarForm() {
  if (props.formModal) {
    isDialogVisible.value = false;
  } else {
    showForm.value = !showForm.value;
  }
}

function handleNewItem() {
  if (props.emitNew) {
    emit("customCreate", {});
  } else {
    handleShowForm({});
  }
}

function processFiltroagrupador(dataHaProcesar: any) {
  const filtroAgrupadorProps = props.filtroAgrupador ?? "";
  const uniqueOptions = Array.from(
    new Set(
      dataHaProcesar
        .map((item: any) =>
          filtroAgrupadorProps.split(".").reduce((acc, key) => acc?.[key], item)
        )
        .filter((value: any) => value) // Filtrar valores no nulos o no definidos
    )
  );
  filtroAgrupador.value = ["Todos", ...uniqueOptions];
  handleSelectFiltroAgrupador(
    props.filtroAgrupadorInicial ? props.filtroAgrupadorInicial : "Todos"
  );
}

function handleSelectFiltroAgrupador(item: any) {
  filtroAgrupadorSelected.value = item;

  const filtroAgrupadorProps = props.filtroAgrupador ?? "";

  // Si se selecciona "Todos", mostrar todos los registros
  if (item === "Todos") {
    tableData.value = [...respaldoData.value];
    return;
  }

  // Filtrar los registros según el valor seleccionado
  tableData.value = respaldoData.value.filter((data: any) => {
    const agrupadorValue = filtroAgrupadorProps
      .split(".")
      .reduce((acc, key) => acc?.[key], data); // Acceder dinámicamente al valor del agrupador
    return agrupadorValue === item; // Comparar con el valor seleccionado
  });
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
  if (props.customAction) {
    emit("customAction", { action, item }); // Emite el evento personalizado con la información del elemento
  } else {
    if (action === "Eliminar") {
      showDeleteItem({
        title: "¿Estás seguro de eliminar este registro?",
        message: "Esta acción no se puede deshacer.",
        confirmText: "Sí, eliminar",
        cancelText: "Cancelar",
        onConfirm: () => {
          handleDeleteItem(item);
        },
        onCancel: () => {},
      });
    } else if (action === "Editar") {
      if (props.emitEdit) {
        emit("customEdit", item); // Emite el evento personalizado con la información del elemento
      } else {
        // Comportamiento predeterminado
        let tmp = { ...item };
        tmp.estatus = tmp.estatus === "Activo" ? true : false;
        handleShowForm(tmp);
      }
    }
  }
}

const countRegistros = computed(() => {
  return (item: any) => {
    if (item === "Todos") {
      return respaldoData.value.length; // Retorna el total de registros
    }

    const filtroAgrupadorProps = props.filtroAgrupador ?? "";

    // Filtrar los registros según el valor del agrupador
    return respaldoData.value.filter((data: any) => {
      const agrupadorValue = filtroAgrupadorProps
        .split(".")
        .reduce((acc, key) => acc?.[key], data); // Acceder dinámicamente al valor del agrupador
      return agrupadorValue === item; // Comparar con el valor seleccionado
    }).length; // Retorna el número de registros filtrados
  };
});

onBeforeMount(() => {
  fetchTableData();
});
</script>

<template>
  <div class="">
    <h1 v-if="showTitle">{{ title }}</h1>
    <div class="card">
      <div v-if="showForm || props.formModal">
        <ModuladorFormFactory
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
        <div
          v-if="showBtnNuevo"
          class="divBtnWrapper"
          :class="props.filtroAgrupador ? '' : ' mb-5 '"
        >
          <div>
            <p>{{ props.subtitulos }}</p>
          </div>
          <VBtn @click="handleNewItem">
            <VIcon start icon="tabler-checkbox" />
            Nuevo
          </VBtn>
        </div>
        <div
          class="d-flex flex-column mb-3"
          v-if="props.filtroAgrupador != null"
        >
          <p class="my-1 textFiltroRapido">Filtro rapido:</p>
          <div class="d-flex flex-wrap gap-2">
            <VChip
              size="small"
              :color="filtroAgrupadorSelected == item ? 'primary' : 'secondary'"
              :variant="
                filtroAgrupadorSelected == item ? 'elevated' : 'outlined'
              "
              @click="handleSelectFiltroAgrupador(item)"
              v-for="(item, index) in filtroAgrupador"
            >
              {{ item }} ( {{ countRegistros(item) }} )
            </VChip>
          </div>
        </div>
        <DataTable
          :headers="tableHeaders"
          :data="tableData"
          :config="props.configTable"
          @action="handleActionClick"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.w-full {
  width: 100%;
}
.divBtnWrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.divBtnWrapper p {
  /* font-size: 0.8125rem; */
  line-height: 1.25rem;
  font-weight: bold;
  padding: 0;
  margin: 0;
}
.bgRed {
  background-color: #ff0000;
}
.textFiltroRapido {
  font-size: 0.8125rem;
  line-height: 1.25rem;
  font-weight: bold;
  padding: 0;
  margin: 0;
}
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
