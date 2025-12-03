<template>
  <div>
    <!-- Transición para mostrar/ocultar el VCard -->
    <transition name="fade">
      <VCard v-if="showFormFiltros" class="w600 rounded-lg mx-auto p20">
        <div>
          <h4 class="mb-4">Registro de Pago</h4>
          <FormFactory
            v-if="schemaFiltros != null"
            :schema="schemaFiltros"
            :formLive="true"
            :modelValue="formFiltros"
            :text-button-cancel="'Limpiar'"
            :showMessageRequired="false"
            @submit="handleFormFiltros"
            @cancel="handleClearFiltros"
          />
          <pre>{{ formFiltros }}</pre>
        </div>
      </VCard>
    </transition>

    <!-- Botón para mostrar el VCard -->
    <VCard class="w600 rounded-lg mx-auto p20">
      <VBtn icon size="small" variant="text" @click="handleShowFiltros">
        <VIcon icon="tabler-filter-cog" class="textBold" />
      </VBtn>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

let formFiltros: any = ref({}); // Usar ref para la reactividad
let showFormFiltros = ref(true); // Controlar la visibilidad del VCard

let schemaFiltros: any = ref([
  {
    label: "Compañia",
    model: "compania",
    type: "select",
    placeholder: "Selecciona una compañia",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
    catalogo: "companias",
    config: { label: "nombreCorto" },
  },
  {
    label: "Ramo",
    model: "ramo",
    type: "select",
    catalogo: "ramos",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    ref: "vigencia",
    type: "rangeDate",
    minModel: "inicioVigencia",
    minLabel: "Inicio de vigencia",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
    maxModel: "finVigencia",
    maxLabel: "Fin de vigencia",
  },
]);

// Función para mostrar/ocultar el formulario de filtros
const handleShowFiltros = () => {
  showFormFiltros.value = true; // Alternar visibilidad
};

// Función para manejar el envío del formulario
const handleFormFiltros = async () => {
  let tmp = toRaw(formFiltros.value);
  const payload = {
    compania_id: tmp?.compania?.id ?? null,
    ramo_id: tmp?.ramo?.id ?? null,
    inicioVigencia: tmp?.inicioVigencia ?? null,
    finVigencia: tmp?.finVigencia ?? null,
    agente_id: tmp?.agente?.id ?? null, // Cambié la clave a "agente_id" para mantener consistencia con las demás claves
  };
  console.log("tmp:", tmp);
  console.log("Payload de filtros:", payload);
  // const response = await customRequest({
  //   url: "/api/cotizaciones/emitir",
  //   method: "POST",
  //   data: payload,
  // });
  // const dataResponse = response.data;
  // if (dataResponse.result) {
  //   showSuccessMessage({
  //     title: "Guardado",
  //     message: dataResponse.message,
  //   });
  // } else {
  //   showErrorMessage({
  //     title: "Error",
  //     message: dataResponse.message,
  //   });
  // }
  // showFormFiltros.value = false;
};

// Función para limpiar los filtros
const handleClearFiltros = () => {
  formFiltros.value = {}; // Reiniciar el formulario
};

onMounted(() => {
  // Determinar si se debe agregar el campo "Subagente"
  const incluirSubagente = false; // Cambia esta condición según tu lógica

  // Crear una copia del esquema base

  // Agregar el campo "Subagente" si es necesario
  if (incluirSubagente) {
    schemaFiltros.value.push({
      label: "Subagente",
      type: "select",
      model: "subagente",
      catalogo: "subagentes",
      classElement: " col-sm-12 col-md-6  col-lg-6 ",
    });
  }
});
</script>

<style scoped>
/* Animación para mostrar y ocultar el VCard */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
