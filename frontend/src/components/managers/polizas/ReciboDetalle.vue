<script setup lang="ts">
import RegistroPagoRecibo from "./RegistroPagoRecibo.vue";
// Props y eventos
const props = withDefaults(
  defineProps<{
    data: any;
    recibo: any;
    btnCancelar?: boolean;
  }>(),
  {
    recibo: {},
    btnCancelar: false,
  }
);

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();

const showFormPago = ref(false);

const handleProcesarPago = () => {
  showFormPago.value = true;
};

const handleCancelar = () => {
  emit("cancelar");
};

const getColorEstatus = (recibo: any) => {
  switch (recibo.estatus) {
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

const getColor = (recibo: any) => {
  switch (recibo.estatus) {
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

<style scoped></style>

<template>
  <div>
    <RegistroPagoRecibo v-if="showFormPago" :recibo="props.recibo" />
    <!-- prettier-ignore -->
    <VCard v-else class="w600 rounded-lg mx-auto">
      <div class="p-4 d-flex flex-justify ml-2 mt-1 mx-5">
        <div class="mx-auto p-4 d-flex flex-justify ml-5 mt-4">
          <VAvatar :size="42" rounded="xl" :color="getColor(props.recibo)" variant="tonal">
            <VIcon :icon="'tabler-receipt-2'" size="26" :color="getColor(props.recibo)" />
          </VAvatar>
          <div>
            <h3 class="pl-4 my-a uto fontBold":class="getColorEstatus(props.recibo)"> {{ props.recibo.estatus }}</h3>
            <h4 class="pl-4 my-auto fontBold"> {{ props.recibo.vencimiento }} </h4>
          </div>
        </div>
        <h2 class="my-auto ml-auto"># {{ props.recibo.numeroRecibo }}</h2>
      </div>
      <div class="w_100 mx-auto border-t border-gray mt-4 mb-4" />
      <div class="p30 pt-10 pb-12">
        <div class="wFull flex flex-wrap gap-4">
          <div class="w-full d-flex mb-3">
            <div class="mr-auto font-medium text-gray-700">No. poliza</div>
            <div class="ml-auto font-bold">{{ props.data.numeroPoliza }}</div>
          </div>
          <div class="w-full d-flex mb-3">
            <div class="mr-auto font-medium text-gray-700">Asegurado</div>
            <div class="ml-auto font-bold">{{ props.data.cliente.nombre }}</div>
          </div>
          <div class="w-full d-flex mb-3">
            <div class="mr-auto font-medium text-gray-700">Monto</div>
            <div class="ml-auto font-bold">{{ formatCurrency(props.recibo.importe)}}</div>
          </div>
          <div class="w-full d-flex mb-3">
            <div class="mr-auto font-medium text-gray-700">Concepto</div>
            <div class="ml-auto font-bold"> Pago del recibo {{ props.recibo.numeroRecibo }} de la poliza {{ props.data.numeroPoliza }}</div>
          </div>
          <div class="w-full d-flex mb-3">
            <div class="wFull mr-auto font-medium text-gray-700">Periodo de cubre</div>
            <div class="wFull ml-auto font-bold text-right">{{ props.recibo.fechaInicio }} - {{ props.recibo.fechaFin }}</div>
          </div>
          <div class="w-full d-flex mb-3">
            <div class="mr-auto font-medium text-gray-700">Fecha de vencimiento</div>
            <div class="ml-auto font-bold text-right">{{ props.recibo.vencimiento }}</div>
          </div>
          <div class="w-full d-flex mb-3">
            <div class="mr-auto font-medium text-gray-700">Dias atrasados</div>
            <div class="ml-auto font-bold">
              {{ props.recibo.diferenciaDias || 0 }} 
              {{ props.recibo.diferenciaDias === 1 ? 'día' : 'días' }}
            </div>
          </div>
        </div>
        <div class="col-11 mx-auto mt-2">
          <VBtn
            block
            size="small"
            variant="outlined"
            rounded="primary"
            @click="handleProcesarPago"
          >
            <VIcon start icon="tabler-receipt-2" />
            Registrar pago
          </VBtn>
        </div>
      </div>
    </VCard>
    <div v-if="props.btnCancelar" class="w200 mx-auto mt-1">
      <VBtn
        block
        size="small"
        variant="outlined"
        color="secondary"
        @click="handleCancelar"
      >
        <VIcon start icon="tabler-arrow-back-up" />
        Cancelar
      </VBtn>
    </div>
  </div>
</template>
