<script setup lang="ts">
import { customRequest } from "@/utils/axiosInstance";
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    cotizaciones: any;
  }>(),
  {}
);

const cotizacionesSeleccionadas: any = ref([]);

async function sendCotizacion() {
  try {
    const payload = {};

    const response = await customRequest({
      url: "/api/procesos/bot",
      method: "POST",
      data: payload,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

async function addIndexCotizacion(index: string) {
  const add = cotizacionesSeleccionadas.value.includes(index);
  if (add) {
    cotizacionesSeleccionadas.value = cotizacionesSeleccionadas.value.filter(
      (item: string) => item !== index
    );
  } else {
    cotizacionesSeleccionadas.value = [
      ...cotizacionesSeleccionadas.value,
      index,
    ];
  }
}
</script>

<template>
  <div>
    <div
      v-for="(cotizacion, index) in cotizaciones"
      :key="index"
      class="d-flex justify-center"
    >
      <div
        :class="cotizacionesSeleccionadas.includes(index) ? 'cardActive' : ''"
        class="card"
      >
        <div>
          <!-- prettier-ignore -->
          <h4 class="text-h4 text-center">{{ cotizacion.compania.compania }}</h4>
          <!-- prettier-ignore -->
          <h2 class="text-h2 text-center">{{ cotizacion.compania.producto }}</h2>

          <template v-if="cotizacion.detalle?.resumen">
            <!-- prettier-ignore -->
            <h6 class="titleSeparator mt-5">Detalles del seguro</h6>
            <!-- prettier-ignore -->
            <div v-for="(item, i) in cotizacion.detalle.resumen" :key="i"  class="rowItem">
                  <VAvatar size="16" :variant="!(cotizacionesSeleccionadas.includes(index)) ? 'tonal' : 'elevated'" color="primary" class="me-3">
                    <VIcon icon="tabler-check" size="12" :color="!(cotizacionesSeleccionadas.includes(index)) ? 'primary' : 'white'" />
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 class="textItem"> <span class="itemBold">{{ i }}</span></h6>
                    <h6 class="textItem">{{ item }} </h6>
                  </div>
              </div>
          </template>

          <!-- prettier-ignore -->
          <template v-if="cotizacion.detalle?.parametros_flexibles">
              <h6 class="titleSeparator">Parámetros flexibles</h6>
              <div v-for="(item, i) in cotizacion.detalle.parametros_flexibles" :key="i" class="rowItem">
                  <VAvatar size="16" :variant="!(cotizacionesSeleccionadas.includes(index)) ? 'tonal' : 'elevated'" color="primary" class="me-3">
                    <VIcon icon="tabler-check" size="12" :color="!(cotizacionesSeleccionadas.includes(index)) ? 'primary' : 'white'" />
                  </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 class="textItem"> <span class="itemBold">{{ i }}</span></h6>
                    <h6 class="textItem">{{ item }} </h6>
                  </div>
              </div>
            </template>

          <!-- prettier-ignore -->
          <template v-if="cotizacion.detalle?.proteccion_con_costo">
              <h6 class="titleSeparator">Protección con costo adicional</h6>
              <div v-for="(item, i) in cotizacion.detalle.proteccion_con_costo" :key="i" class="rowItem">
                  <VAvatar size="16" :variant="!(cotizacionesSeleccionadas.includes(index)) ? 'tonal' : 'elevated'" color="primary" class="me-3">
                    <VIcon icon="tabler-check" size="12" :color="!(cotizacionesSeleccionadas.includes(index)) ? 'primary' : 'white'" />
                  </VAvatar>
                  <div v-if="item[0].includes('Selección')" class="d-flex flex-column">
                    <h6 class="textItem"> <span class="itemBold">{{ i }}</span></h6>
                    <h6 class="textItem"> {{ item[1] }} </h6>
                  </div>
                  <div v-else class="d-flex flex-column">
                    <h6 class="textItem"> <span class="itemBold">{{ i }}</span></h6>
                    <h6 class="textItem"> {{ item[0] }} {{ item[1] }} </h6>
                  </div>
              </div>
            </template>

          <!-- prettier-ignore -->
          <template v-if="cotizacion.detalle?.antiguedad">
              <h6 class="titleSeparator">Reconocimiento de Antigüedad</h6>
              <div v-for="(item, i) in cotizacion.detalle.resumen" :key="i" class="rowItem">
                    <VAvatar size="16" :variant="!(cotizacionesSeleccionadas.includes(index)) ? 'tonal' : 'elevated'" color="primary" class="me-3">
                      <VIcon icon="tabler-check" size="12" :color="!(cotizacionesSeleccionadas.includes(index)) ? 'primary' : 'white'" />
                    </VAvatar>
                  <div class="d-flex flex-column">
                    <h6 class="textItem"> <span class="itemBold">{{ i }}</span></h6>
                    <h6 class="textItem">{{ item }} </h6>
                  </div>
                </div>
            </template>

          <!-- prettier-ignore -->
          <VBtn block :variant="!(cotizacionesSeleccionadas.includes(index)) ? 'elevated' : 'tonal'" class="mt-8" @click="addIndexCotizacion(index.toString())">
              Seleccionar cotización
            </VBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.itemBold {
  color: rgb(var(--v-theme-primary));
  font-weight: bolder !important;
  margin-right: 10px !important;
}
.rowItem {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.textItem {
  font-size: 0.9375rem !important;
  font-weight: normal !important;
}
.titleSeparator {
  border-bottom: 1px solid rgb(var(--v-theme-primary)) !important;
  font-size: 1.2rem !important;
  text-align: center !important;
  padding-bottom: 5px !important;
  margin-top: 16px !important;
  margin-bottom: 10px !important;
  font-weight: bolder !important;
  line-height: 1.375rem;
  letter-spacing: normal !important;
  text-transform: none !important;
}
.cardActive {
  border: 2px solid rgb(var(--v-theme-primary));
}
.card {
  padding: 16px !important;
  border-radius: 10px !important;
  background-color: white !important;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1) !important;
  width: 500px !important;
}
</style>
