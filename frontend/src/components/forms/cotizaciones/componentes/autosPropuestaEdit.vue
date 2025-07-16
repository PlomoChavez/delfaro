<template>
  <div class="wFull">
    <div class="card" v-if="props.cotizacion != null">
      <!-- prettier-ignore -->
      <p class="p-0 m-0">Compañia: <span>{{ props.cotizacion.compania }}</span></p>
      <!-- prettier-ignore -->
      <p class="p-0 m-0">Ramo: <span>{{ props.cotizacion.ramo }}</span></p>

      <!-- prettier-ignore -->
      <div v-if="props.cotizacion.compania == 'QUALITAS' || props.cotizacion.ramo == 'AUTOS'" >
        <EditQualitas
          :cotizacion="props.cotizacion"
          @actualizar="handleCanActualizar"
        />
      </div>
    </div>
    <div class="d-flex justify-space-between w-100 mt-5">
      <div>
        <VBtn color="dark" outlined @click="handleCancelar"> Cancelar </VBtn>
      </div>
      <div>
        <VBtn color="warning" :disabled="!canActualizar"> Actualizar </VBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";
import EditQualitas from "./autosPropuestaEditQualitas.vue";

const props = defineProps<{
  cotizacion: any;
}>();

const emit = defineEmits(["cancelar", "actualizar"]);
const localData: any = ref(null);

const canActualizar = ref<boolean>(false);
function handleCancelar() {
  emit("cancelar");
}
function handleActualizar() {
  emit("actualizar");
}
function handleCanActualizar(value: boolean) {
  canActualizar.value = value;
}
</script>

<style scoped></style>
