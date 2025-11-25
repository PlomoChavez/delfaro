<template>
  <div class="d-flex mb-6">
    <VIcon :icon="'tabler-receipt-2'" size="40" />
    <h1 class="pl-4 my-auto fontBold">Recibos</h1>
  </div>
  <div v-if="reciboSelected == null" class="wFull">
    <!-- Recibos actuales -->
    <div>
      <div class="d-flex align-center justify-between mb-2 mt-4">
        <h2 class="fontBold">Recibos Actuales</h2>
      </div>
      <div class="recibos-grid">
        <template v-for="(recibo, index) in groupedRecibos.actual" :key="index">
          <CardRecibo :row="recibo" @click="reciboSelected = recibo" />
        </template>
      </div>
    </div>

    <!-- Recibos pasados -->
    <!-- prettier-ignore -->
    <div>
      <div class="d-flex align-center justify-between mb-2 mt-4  cursor-pointer" @click="showPasados = !showPasados">
        <VIcon :icon="showPasados ? 'tabler-eye' : 'tabler-eye-closed'" size="24" class="mr-2 cursor-pointer" />
        <h2 class="fontBold">Pasados <span class="text-muted-italic"> Número de recibos ( {{ groupedRecibos.pasado.length }} )</span></h2>
      </div>
      <div v-if="showPasados" class="recibos-grid">
        <template v-for="(recibo, index) in groupedRecibos.pasado" :key="index">
          <CardRecibo :row="recibo" />
        </template>
      </div>
    </div>

    <!-- Recibos pendientes -->
    <!-- prettier-ignore -->
    <div>
      <div class="d-flex align-center justify-between mb-2 mt-4  cursor-pointer" @click="showPendientes = !showPendientes">
        <VIcon :icon="showPendientes ? 'tabler-eye' : 'tabler-eye-closed'" size="24" class="mr-2" />
        <h2 class="fontBold">Pendientes <span class="text-muted-italic"> Número de recibos ( {{ groupedRecibos.pendientes.length }} )</span></h2>
      </div>
      <div v-if="showPendientes" class="recibos-grid">
        <template v-for="(recibo, index) in groupedRecibos.pendientes" :key="index">
          <CardRecibo :row="recibo" :isDisabled="true" />
        </template>
      </div>
    </div>
  </div>

  <ReciboDetalle
    v-else
    :data="props.data"
    :recibo="reciboSelected"
    :btnCancelar="true"
    @cancelar="reciboSelected = null"
  />
</template>

<script lang="ts" setup>
import moment from "moment";
import { ref } from "vue";
import CardRecibo from "./CardRecibo.vue";
import ReciboDetalle from "./ReciboDetalle.vue";

// Props y eventos
const props = withDefaults(
  defineProps<{
    registroId: any;
    data: any;
    recibos: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "cancelar"): void;
  (event: "changePanel", idx?: any): void;
}>();

const recibos: any = ref([]);
const reciboSelected: any = ref(null);

// Estados para controlar la visibilidad de las secciones
const showPasados = ref(false);
const showPendientes = ref(false);

// Función para agrupar recibos en "pasado", "actual" y "pendientes"
const groupRecibosByDate = (recibos: any[]) => {
  const pasado: any[] = [];
  const actual: any[] = [];
  const pendientes: any[] = [];

  const now = moment(); // Fecha actual
  const currentMonth = now.month(); // Mes actual (0 = enero, 11 = diciembre)
  const currentYear = now.year(); // Año actual

  // Mes y año del mes anterior
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Mes y año del mes siguiente
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  recibos.forEach((recibo) => {
    const vencimiento = moment(recibo.vencimiento, "DD/MM/YYYY"); // Especificar el formato de la fecha
    const vencimientoMonth = vencimiento.month(); // Obtener el mes del vencimiento
    const vencimientoYear = vencimiento.year(); // Obtener el año del vencimient

    if (
      vencimientoYear < currentYear || // Año anterior
      (vencimientoYear === currentYear && vencimientoMonth < previousMonth)
    ) {
      pasado.push(recibo);
    } else if (
      (vencimientoYear === previousYear &&
        vencimientoMonth === previousMonth) || // Mes anterior
      (vencimientoYear === currentYear && vencimientoMonth === currentMonth) || // Mes actual
      (vencimientoYear === nextYear && vencimientoMonth === nextMonth) // Mes siguiente
    ) {
      actual.push(recibo);
    } else {
      pendientes.push(recibo);
    }
  });

  return { pasado, actual, pendientes };
};

// Computed para agrupar los recibos
const groupedRecibos = computed(() => groupRecibosByDate(recibos.value));

onMounted(() => {
  if (props.recibos) {
    recibos.value = props.recibos;
  }
});
</script>

<style scoped>
.recibos-grid {
  display: flex;
  flex-wrap: wrap;
  padding-left: 20px;
  padding-right: 20px;
  justify-content: center;
  gap: 16px;
}

.cursor-pointer {
  cursor: pointer;
}

.text-muted-italic {
  font-size: 0.875rem; /* Letra pequeña */
  color: #6c757d; /* Color tenue (muted) */
  font-style: italic; /* Estilo itálico */
}
</style>
