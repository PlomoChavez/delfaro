<script lang="ts" setup>
import ReciboDetalle from "./ReciboDetalle.vue";
// Props y eventos
const props = withDefaults(
  defineProps<{
    data: any;
    recibo: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "cancelar"): void;
  (event: "changePanel", idx?: any): void;
}>();

const handleChangePanel = () => {
  console.log("Cancelar desde ReciboDetalle");
  emit("changePanel", 1);
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
    <div class="wFull">
      <!-- prettier-ignore -->
      <!-- <pre>{{ props.recibo }}</pre> -->
      <ReciboDetalle
        :data="props.data"
        :recibo="props.recibo"
        :btnCancelar="true"
        @cancelar="handleChangePanel"
      />
    </div>
  </div>
</template>
