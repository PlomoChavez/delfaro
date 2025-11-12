<script lang="ts" setup>
// Props y eventos
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "cancelar"): void;
  (event: "changePanel", idx?: any): void;
}>();

const recibos = ref([
  {
    id: 54,
    numeroRecibo: "001",
    fechaInicio: "2025-11-09T04:00:02.211Z",
    fechaFin: "2026-02-09T04:00:02.211Z",
    vencimiento: "2025-11-23T04:00:02.211Z",
    fechaPago: null,
    fechaCancelado: null,
    estatus: "Pendiente",
    importe: "9744.89",
    evidencia: null,
    created_at: "2025-11-10T04:00:02.000Z",
    updated_at: "2025-11-12T04:26:32.000Z",
  },
  {
    id: 55,
    numeroRecibo: "002",
    fechaInicio: "2026-02-09T04:00:02.211Z",
    fechaFin: "2026-05-09T04:00:02.211Z",
    vencimiento: "2026-02-23T04:00:02.211Z",
    fechaPago: null,
    fechaCancelado: null,
    estatus: "Pagado",
    importe: "9002.53",
    evidencia: null,
    created_at: "2025-11-10T04:00:02.000Z",
    updated_at: "2025-11-12T04:26:32.000Z",
  },
  {
    id: 56,
    numeroRecibo: "003",
    fechaInicio: "2026-05-09T04:00:02.211Z",
    fechaFin: "2026-08-09T04:00:02.211Z",
    vencimiento: "2026-05-23T04:00:02.211Z",
    fechaPago: null,
    fechaCancelado: null,
    estatus: "Cancelado",
    importe: "9002.53",
    evidencia: null,
    created_at: "2025-11-10T04:00:02.000Z",
    updated_at: "2025-11-12T04:26:32.000Z",
  },
  {
    id: 57,
    numeroRecibo: "004",
    fechaInicio: "2026-08-09T04:00:02.211Z",
    fechaFin: "2026-11-09T04:00:02.211Z",
    vencimiento: "2026-08-23T04:00:02.211Z",
    fechaPago: null,
    fechaCancelado: null,
    estatus: "Atrasado",
    importe: "9002.53",
    evidencia: null,
    created_at: "2025-11-10T04:00:02.000Z",
    updated_at: "2025-11-10T04:00:02.000Z",
  },
]);
const getColorEstatus = (estatus: string) => {
  switch (estatus) {
    case "Pendiente":
      return "textTonalYellow";
    case "Pagado":
      return "textTonalGreen";
    case "Atrasado":
      return "textTonalRed ";
    case "Cancelado":
      return "textTonalGray ";
    default:
      return "textTonalGray";
  }
};

const getBGColorEstatus = (estatus: string) => {
  switch (estatus) {
    case "Pendiente":
      return "bgTonalYellow";
    case "Pagado":
      return "bgTonalGreen";
    case "Atrasado":
      return "bgTonalRed ";
    case "Cancelado":
      return "bgTonalGray ";
    default:
      return "bgTonalGray";
  }
};
const getColor = (estatus: string) => {
  switch (estatus) {
    case "Pendiente":
      return "#ecb100";
    case "Pagado":
      return "#0bac30";
    case "Atrasado":
      return "#e61e32 ";
    case "Cancelado":
      return "#7f7f7f";
    default:
      return "#333333";
  }
};
</script>

<template>
  <div class="w-full">
    <div class="d-flex mb-6">
      <VIcon :icon="'tabler-cash'" size="40" />
      <h1 class="pl-4 my-auto fontBold">Registrar un pago</h1>
    </div>
    <div class="wFull gap-4 d-flex">
      <template v-for="(row, index) in recibos" :key="index">
        <!-- prettier-ignore -->
        <VCard class="rounded-lg w500">
          <div class="w-full">
            <div class="p-4 d-flex flex-justify ml-2 mt-1 mx-5">
              <div class="mx-auto p-4 d-flex flex-justify ml-5 mt-4">
                <VAvatar :size="42" rounded="xl" :color="getColor(row.estatus)" variant="tonal">
                  <VIcon :icon="'tabler-receipt-2'" size="26" :color="getColor(row.estatus)" />
                </VAvatar>
                <div>
                  <h3 class="pl-4 my-auto fontBold" :class="getColorEstatus(row.estatus)" >{{ row.estatus }}</h3>
                  <h4 class="pl-4 my-auto fontBold">{{ formatDateMoment(row.fechaInicio, "DD/MM/YYYY") }}</h4>
                </div>
              </div>
              <h2 class="my-auto ml-auto"># {{ row.numeroRecibo }}</h2>
            </div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="p30 pt-10 pb-12">
            <p class="mb-0 text-muted ">Importe</p>
            <h2 class="fontBold ml-2">{{ formatCurrency(row.importe) }}</h2>
          </div>
          <div class="wFull p0 m0" :class="getBGColorEstatus(row.estatus)">
            <div class="d-flex pl-4 py-3">
              <VAvatar :size="25" rounded="xl" :color="getColor(row.estatus)" variant="tonal">
                <VIcon :icon="'tabler-calendar'" size="20" />
              </VAvatar>
              <div>
                <h4 class="ml-2 my-auto fontBold">Vencio {{ formatDateMoment(row.vencimiento, "DD/MM/YYYY") }}</h4>
              </div>
            </div>
          </div>
        </VCard>
      </template>
    </div>
  </div>
</template>
