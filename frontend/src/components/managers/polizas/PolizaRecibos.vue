<template>
  <div class="d-flex mb-6">
    <VIcon :icon="'tabler-receipt-2'" size="40" />
    <h1 class="pl-4 my-auto fontBold">Recibos</h1>
  </div>
  <div v-if="reciboSelected == null" class="wFull">
    <!-- Recibos actuales -->
    <div>
      <div class="d-flex align-center justify-between mb-2 mt-4">
        <h2 class="fontBold">Últimos 3 recibos</h2>
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
        <h2 class="fontBold">Pagados <span class="text-muted-italic"> Número de recibos ( {{ groupedRecibos.pasado.length }} )</span></h2>
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
        <h2 class="fontBold">Futuros <span class="text-muted-italic"> Número de recibos ( {{ groupedRecibos.pendientes.length }} )</span></h2>
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
import { ref } from "vue";

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
const groupRecibosByNumRecibo = (recibos: any[], reciboActual: any) => {
  console.log("Recibos:", recibos, "Recibo actual:", reciboActual);

  // Extraer el número de recibo actual del objeto reciboActual
  const reciboActualNum = reciboActual.numeroRecibo;

  const pasado: any[] = [];
  const actual: any[] = [];
  const pendientes: any[] = [];

  recibos.forEach((recibo) => {
    const numeroRecibo = recibo.numeroRecibo; // Asegúrate de que este campo exista en cada recibo
    console.log(
      "Procesando recibo:",
      numeroRecibo,
      "Recibo actual:",
      reciboActualNum
    );

    if (numeroRecibo < incrementarRecibo(reciboActualNum, -1)) {
      // Recibos anteriores al anterior inmediato
      pasado.push(recibo);
    } else if (
      numeroRecibo >= incrementarRecibo(reciboActualNum, -1) && // Anterior inmediato
      numeroRecibo <= incrementarRecibo(reciboActualNum, 1) // Siguiente inmediato
    ) {
      // Recibos actuales (anterior inmediato, actual, siguiente inmediato)
      actual.push(recibo);
    } else {
      // Recibos posteriores al siguiente inmediato
      pendientes.push(recibo);
    }
  });

  return { pasado, actual, pendientes };
};

// Función auxiliar para incrementar o decrementar el número de recibo
const incrementarRecibo = (numeroRecibo: string, incremento: number) => {
  const numero = parseInt(numeroRecibo, 10); // Convertir a número
  const nuevoNumero = numero + incremento; // Incrementar o decrementar
  return nuevoNumero.toString().padStart(3, "0"); // Formatear con ceros a la izquierda
};

// Computed para agrupar los recibos
const groupedRecibos = computed(() =>
  groupRecibosByNumRecibo(toRaw(props.data.recibos), toRaw(props.data.recibo))
);

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
