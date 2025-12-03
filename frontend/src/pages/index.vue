<template>
  <div>
    <div class="mb30">
      <!-- Transición para mostrar/ocultar el VCard -->
      <transition name="fade">
        <VCard v-if="showFormFiltros" class="rounded-lg mx-auto p20">
          <div>
            <!-- Header -->
            <!-- prettier-ignore -->
            <div class="wFull d-flex align-center items-center justify-space-between mb10">
              <div><h2 class="">Filtros</h2></div>
              <div>
                <VBtn icon size="small" color="error" variant="text" @click="handleOcultar">
                  <VIcon icon="tabler-x" class="textBold" />
                </VBtn>
              </div>
            </div>
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
    </div>
    <transition name="fade">
      <!-- Botón para mostrar el VCard -->
      <VCard class="w700 rounded-lg mx-auto p20 pt30 mt30">
        <!-- Header -->
        <!-- prettier-ignore -->
        <div class="wFull d-flex align-center items-center justify-space-between">
          <div><h4 class="">Contadores</h4></div>
          <div>
            <VBtn icon size="small" variant="text" @click="handleShowFiltros">
              <VIcon icon="tabler-filter-cog" class="textBold" />
            </VBtn>
          </div>
        </div>
        <!-- Recibos -->
        <!-- prettier-ignore -->
        <div class="col-12">
        <div class="divCard d-flex flex-wrap justify-space-between">
          <p class="wFull textIndicador2 text-left">Recibos</p>
          <div class="col-4">
            <p class="textTitulo">Total</p>
            <p class="textValor">{{ formatCurrency(indicadores.recibosSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.recibosContador }} Recibos</p>
          </div>
          <div class="col-4">
            <p class="textTitulo">Pagados</p>
            <p class="textValor">{{ formatCurrency(indicadores.recibosPagadosSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.recibosPagadosContador }} Recibos</p>
          </div>
          <div class="col-4">
            <p class="textTitulo">Pendientes</p>
            <p class="textValor">{{ formatCurrency(indicadores.recibosPendientesSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.recibosPendientesContador }} Recibos</p>
          </div>
        </div>
      </div>
        <!-- Pólizas -->
        <!-- prettier-ignore -->
        <div class="wFull d-flex flex-wrap justify-space-between">
        <div class="col-6">
          <div class="divCard">
            <p class="textTitulo">Siniestros</p>
            <p class="textValor">{{ indicadores.totalSiniestros }}</p>
            <p class="textIndicador">&nbsp;</p>
          </div>
        </div>
        <div class="col-6">
          <div class="divCard">
            <p class="textTitulo">Polizas</p>
            <p class="textValor">{{ formatCurrency(indicadores.polizasSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.polizasContador }} Polizas</p>
          </div>
        </div>
      </div>
        <!-- Pólizas -->
        <!-- prettier-ignore -->
        <div class="col-12">
        <div class="divCard d-flex flex-wrap justify-space-between">
          <div class="col-6">
            <p class="textTitulo">Prima Neta</p>
            <p class="textValor">{{ formatCurrency(indicadores.primaNetaSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.primaNetaContador }} Polizas</p>
          </div>
          <div class="col-6">
            <p class="textTitulo">Prima Total</p>
            <p class="textValor">{{ formatCurrency(indicadores.primaTotalSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.primaTotalContador }} Polizas</p>
          </div>
        </div>
      </div>
        <!-- prettier-ignore -->
        <div class="col-12">
        <div class="divCard d-flex flex-wrap justify-space-between">
          <div class="col-4">
            <p class="textTitulo">Nuevos negocios</p>
            <p class="textValor">{{ formatCurrency(indicadores.nuevosNegociosSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.nuevosNegociosContador }} Polizas</p>
          </div>
          <div class="col-4">
            <p class="textTitulo">Renovaciones</p>
            <p class="textValor">{{ formatCurrency(indicadores.renovacionesSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.renovacionesContador }} Polizas</p>
          </div>
          <div class="col-4">
            <p class="textTitulo">Canceladas</p>
            <p class="textValor">{{ formatCurrency(indicadores.canceladasSumatoria) }}</p>
            <p class="textIndicador">{{ indicadores.canceladasContador }} Polizas</p>
          </div>
        </div>
      </div>
      </VCard>
    </transition>
  </div>
</template>

<style lang="scss">
.divCard {
  border-radius: 10px;
  border: 1px solid #919191;
  padding: 15px;
}
.textValor {
  padding: 0px !important;
  margin: 0px !important;
  font-size: 24px;
  text-align: center;
  font-weight: bold;
  color: black;
}
.textIndicador {
  padding: 0px !important;
  margin: 0px !important;
  font-size: 12px;
  font-style: italic;
  text-align: center;
  font-weight: bold;
  color: #6c757d; /* Color muted (gris tenue) */
}
.textTitulo {
  padding: 0px !important;
  margin: 0px !important;
  font-size: 15px;
  font-style: italic;
  text-align: center;
  font-weight: bold;
  color: #4a4a4a; /* Color muted (gris tenue) */
}
.textIndicador2 {
  padding: 0px !important;
  margin: 0px !important;
  text-align: right;
  font-size: 20px;
  font-style: italic;
  font-weight: bold;
  color: #4e4e4e; /* Color muted (gris tenue) */
}
</style>

<script setup lang="ts">
import moment from "moment";
import { ref } from "vue";

let formFiltros: any = ref({}); // Usar ref para la reactividad
let showFormFiltros = ref(true); // Controlar la visibilidad del VCard
let indicadores = ref({
  recibosContador: 11,
  recibosSumatoria: 11,
  recibosPagadosSumatoria: 11,
  recibosPagadosContador: 11,
  recibosPendientesSumatoria: 11,
  recibosPendientesContador: 11,
  totalSiniestros: 1,
  polizasContador: 1,
  polizasSumatoria: 1,
  primaNetaSumatoria: 62819.62,
  primaNetaContador: 55,
  primaTotalSumatoria: 62819.62,
  primaTotalContador: 55,
  nuevosNegociosSumatoria: 62819.62,
  nuevosNegociosContador: 55,
  renovacionesSumatoria: 62819.62,
  renovacionesContador: 55,
  canceladasSumatoria: 62819.62,
  canceladasContador: 55,
}); // Datos de los indicadores

let schemaFiltros: any = ref([
  {
    label: "Compañia",
    model: "compania",
    type: "select",
    placeholder: "Selecciona una compañia",
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
    catalogo: "companias",
    config: { label: "nombreCorto" },
  },
  {
    label: "Ramo",
    model: "ramo",
    type: "select",
    catalogo: "ramos",
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
  },
  {
    ref: "vigencia",
    type: "rangeDate",
    minModel: "inicioVigencia",
    minLabel: "Inicio de vigencia",
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
    maxModel: "finVigencia",
    maxLabel: "Fin de vigencia",
    minConfig: {
      dateFormat: "d/m/Y",
      enableTime: false,
    },
    maxConfig: {
      dateFormat: "d/m/Y",
      enableTime: false,
    },
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
  showFormFiltros.value = false; // Alternar visibilidad
};

const handleOcultar = () => {
  showFormFiltros.value = false; // Alternar visibilidad
};

onMounted(() => {
  // Determinar si se debe agregar el campo "Subagente"
  const incluirSubagente = false; // Cambia esta condición según tu lógica

  // Crear una copia del esquema base
  const now = moment();

  formFiltros.value.inicioVigencia = now.startOf("year").format("DD/MM/YYYY");

  // Agregar el campo "Subagente" si es necesario
  if (incluirSubagente) {
    schemaFiltros.value.push({
      label: "Subagente",
      type: "select",
      model: "subagente",
      catalogo: "subagentes",
      classElement: " col-sm-6 col-md-3  col-lg-3 ",
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
