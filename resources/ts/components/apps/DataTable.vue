<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { defineProps, defineEmits } from "vue";

const selected = ref([]);

interface Header {
  title: string;
  key: string;
}

const props = defineProps<{
  headers: Header[];
  data: any[];
  config: {
    actions: string[];
    numerador?: boolean;
    paginador?: boolean;
    busqueda?: boolean;
    exportar?: boolean;
    seleccionar?: boolean;
    columnsBySearch?: string[]; // Columnas específicas para la búsqueda
  };
}>();

const emit = defineEmits<{
  (event: "action", payload: { action: string; item: any }): void;
  (event: "selection-change", selectedItems: any[]): void;
}>();

// Valores predeterminados para las opciones
const defaultConfig = {
  numerador: false,
  paginador: false,
  busqueda: true,
  exportar: false,
  seleccionar: false,
};

const mergedConfig = { ...defaultConfig, ...props.config };

// Estado para la búsqueda
const searchQuery = ref("");

// Filtrar datos según la búsqueda
const filteredData = computed(() => {
  if (!mergedConfig.busqueda || !searchQuery.value) {
    return props.data;
  }

  const query = searchQuery.value.toLowerCase();
  const searchColumns =
    mergedConfig.columnsBySearch || props.headers.map((header) => header.key);

  return props.data.filter((item) =>
    searchColumns.some((column) =>
      String(item[column]).toLowerCase().includes(query)
    )
  );
});

function exportData() {
  console.log("Exportar datos:", props.data);
  // Aquí puedes implementar la lógica para exportar los datos (CSV, Excel, etc.)
}
watch(selected, () => {
  const selectedById = props.data.filter((item) =>
    selected.value.includes(item.id)
  );
  emit("selection-change", selectedById); // Emitir los IDs seleccionados
});
</script>

<template>
  <div>
    <!-- Búsqueda y botón de exportar en una sola fila -->
    <div
      v-if="mergedConfig.busqueda || mergedConfig.exportar"
      class="mb-3 d-flex align-center justify-space-between"
    >
      <div class="d-flex align-center gap-2 w-100">
        <!-- prettier-ignore -->
        <input v-if="mergedConfig.busqueda" type="text" v-model="searchQuery" placeholder="Buscar..."  class="search-input w-100" />
        <!-- prettier-ignore -->
        <VBtn v-if="mergedConfig.busqueda" @click="() => (searchQuery.value = '')" color="Primary" >
          Limpiar
        </VBtn>
      </div>
      <!-- prettier-ignore -->
      <button v-if="mergedConfig.exportar" @click="exportData" class="btn-export" >
        Exportar
      </button>
    </div>
    <!-- Tabla -->
    <VDataTable
      :headers="[
        ...(mergedConfig.numerador ? [{ title: '#', key: 'numerador' }] : []),
        ...props.headers,
        ...(props.config.actions.length
          ? [{ title: 'Acciones', key: 'actions' }]
          : []),
      ]"
      :items="filteredData"
      :items-per-page="mergedConfig.paginador ? 10 : filteredData.length"
      :show-select="mergedConfig.seleccionar"
      v-model="selected"
      select-strategy="all"
      height="300"
      fixed-header
      no-data-text="No hay datos disponibles"
      items-per-page-text="Elementos por página:"
    >
      <!-- Numerador -->
      <template #item.numerador="{ index }">
        {{ index + 1 }}
      </template>

      <!-- Datos dinámicos -->
      <!-- prettier-ignore -->
      <template v-for="header in props.headers" :key="header.key" #[`item.${header.key}`]="{ item }" >
        {{ item[header.key] }}
      </template>

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="actions">
          <!-- prettier-ignore -->
          <button v-for="(action, index) in props.config.actions" :key="index" @click="() => emit('action-click', { action, item })">
            {{ action }}
          </button>
        </div>
      </template>
    </VDataTable>
  </div>
</template>

<style scoped>
.d-flex {
  display: flex;
  gap: 8px;
}
.align-center {
  align-items: center;
}
.actions {
  display: flex;
  gap: 8px;
}
.search-input {
  width: 200px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-clear {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-export {
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
