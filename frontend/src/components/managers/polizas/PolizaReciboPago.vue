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
const handleShowModalContrasenia = (estatus: string) => {
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
      <!-- prettier-ignore -->

      <!-- prettier-ignore -->
      <VCard class="w600 rounded-lg">
            <div class="p-4 d-flex flex-justify ml-2 mt-1 mx-5">
              <div class="mx-auto p-4 d-flex flex-justify ml-5 mt-4">
                <VAvatar :size="42" rounded="xl" :color="'success'" variant="tonal">
                  <VIcon :icon="'tabler-receipt-2'" size="26" :color="'success'" />
                </VAvatar>
                <div>
                  <h3 class="pl-4 my-auto fontBold textTonalGreen" >{{ "Pendiente" }}</h3>
                  <h4 class="pl-4 my-auto fontBold">{{ formatDateMoment(props.data.fechaInicio, "DD/MM/YYYY") }}</h4>
                </div>
              </div>
              <h2 class="my-auto ml-auto"># 001</h2>
            </div>
            <div class="w_100 mx-auto border-t border-gray mt-4 mb-4 " />
          <div class="p30 pt-10 pb-12">
            <div class="wFull flex flex-wrap gap-4">
                <div class="w-full d-flex mb-3">
                    <div class="mr-auto font-medium text-gray-700">No. poliza</div>
                    <div class="ml-auto font-bold">{{ (props.data.numeroPoliza) }}</div>
                </div>
                <div class="w-full d-flex mb-3">
                    <div class="mr-auto font-medium text-gray-700">Asegurado</div>
                    <div class="ml-auto font-bold">{{ (props.data.cliente.nombre) }}</div>
                </div>
                <div class="w-full d-flex mb-3">
                    <div class="mr-auto font-medium text-gray-700">Concepto</div>
                    <div class="ml-auto font-bold">Pago del recibo {{ props.data.recibos[0].numeroRecibo }}  de la poliza {{ props.data.numeroPoliza }}</div>
                </div>
                <div class="w-full d-flex mb-3">
                  <div class="wFull mr-auto font-medium text-gray-700">Periodo de cubre</div>
                  <div class="wFull ml-auto font-bold text-right">{{ formatDateMoment(props.data.fechaInicio, "DD/MM/YYYY") }} - {{ formatDateMoment(props.data.fechaFin, "DD/MM/YYYY") }}</div>
                </div>
                <div class="w-full d-flex mb-3">
                    <div class="mr-auto font-medium text-gray-700">Fecha de vencimiento</div>
                    <div class="ml-auto font-bold text-right">{{ formatDateMoment(props.data.vencimiento, "DD/MM/YYYY") }}</div>
                </div>
            </div>
            <div class="col-11 mx-auto mt-2">
              <VBtn
                block
                size="small"
                variant="outlined"
                rounded="primary"
                @click="handleShowModalContrasenia"
              >
                <VIcon start icon="tabler-receipt-2" />
                Registrar pago
              </VBtn>
            </div>
          </div>
        </VCard>
    </div>
  </div>
</template>
