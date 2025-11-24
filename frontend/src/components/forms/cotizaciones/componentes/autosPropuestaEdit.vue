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
          :registro="props.registro"
          :cotizacion="props.cotizacion"
          @cancelar="emit('cancelar')"
          @actualizar="handleActualizar"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import EditQualitas from "./autosPropuestaEditQualitas.vue";

const props = defineProps<{
  cotizacion: any;
  registro: any;
}>();

const emit = defineEmits(["cancelar", "actualizar"]);

async function handleActualizar(cotizacion: any) {
  emit("actualizar", cotizacion);
}
</script>

<style scoped></style>
