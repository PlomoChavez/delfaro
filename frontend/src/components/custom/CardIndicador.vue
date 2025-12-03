<script setup lang="ts">
// Props y eventos
// Props y eventos
const props = withDefaults(
  defineProps<{
    row: any;
    isDisabled?: boolean; // Propiedad booleana opcional para deshabilitar
  }>(),
  {
    isDisabled: false, // Valor predeterminado: no deshabilitado
  }
);

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

const getBGColorEstatus = (recibo: any) => {
  switch (recibo.estatus) {
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

// Función para determinar si un recibo es el actual
const isReciboActual = (recibo: any) => {
  const now = new Date();
  const fechaInicio = new Date(recibo.fechaInicio);
  const fechaFin = new Date(recibo.fechaFin);
  return now >= fechaInicio && now <= fechaFin;
};

// Método para obtener la clase de deshabilitado
const getDisabledClass = (recibo: any) => {
  return isReciboActual(recibo) ? "" : "disabled";
};

// Método para obtener el estilo de deshabilitado
const getDisabledStyle = (recibo: any) => {
  return isReciboActual(recibo) ? {} : { opacity: 0.5, pointerEvents: "none" }; // Reduce la opacidad y desactiva los eventos
};
</script>

<style scoped>
.disabled {
  opacity: 0.5; /* Reduce la opacidad */
  pointer-events: none; /* Desactiva los eventos del mouse */
}

.text-muted-italic {
  font-size: 0.875rem; /* Letra pequeña */
  color: #6c757d; /* Color tenue (muted) */
  font-style: italic; /* Estilo itálico */
}
</style>

<template>
  <VCard
    v-if="true"
    class="rounded-lg w400"
    :class="{ disabled: props.isDisabled }"
  >
    <div class="w-full">
      <div class="p-4 d-flex flex-justify ml-2 mt-1 mx-5">
        <div class="mx-auto p-4 d-flex flex-justify ml-5 mt-4">
          <VAvatar
            :size="42"
            rounded="xl"
            :color="getColor(row)"
            variant="tonal"
          >
            <VIcon
              :icon="'tabler-receipt-2'"
              size="26"
              :color="getColor(row)"
            />
          </VAvatar>
          <div>
            <h3 class="pl-4 my-auto fontBold" :class="getColorEstatus(row)">
              {{ row.estatus }}
            </h3>
            <h4 class="pl-4 my-auto fontBold">
              {{ row.vencimiento }}
            </h4>
          </div>
        </div>
        <h2 class="my-auto ml-auto"># {{ row.numeroRecibo }}</h2>
      </div>
      <div class="w_100 mx-auto border-t border-gray mt-2" />
    </div>
    <div class="p30 pt-10 pb-12">
      <p class="mb-0 text-muted">Importe</p>
      <h2 class="fontBold ml-2">{{ formatCurrency(row.importe) }}</h2>
    </div>
    <!-- prettier-ignore -->
    <div class="wFull p0 m0" :class="getBGColorEstatus(row)">
      <div class="d-flex pl-4 py-3 align-center">
        <VAvatar :size="25" rounded="xl" :color="getColor(row)" variant="tonal">
          <VIcon :icon="'tabler-calendar'" size="20" />
        </VAvatar>
        <div>
          <h4 class="ml-2 my-auto fontBold">
            Venció {{ row.vencimiento }}
            <span v-if="row.isVencido" class="ml-2 text-muted-italic mb-0">Días atrasados: {{ row.diferenciaDias }}</span>
          </h4>
        </div>
      </div>
    </div>
  </VCard>
</template>
