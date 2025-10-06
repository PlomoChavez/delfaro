<template>
  <div v-if="config && config.opciones && Array.isArray(config.opciones)">
    <h4 v-if="config.titulo" class="titulo-opciones">
      {{ config.titulo }}
    </h4>
    <h6 v-if="config.subtitulo" class="titulo-subtitulo">
      {{ config.subtitulo }}
    </h6>

    <div class="opciones-botones">
      <button
        class="btn"
        v-for="(opcion, idx) in config.opciones"
        :key="idx"
        :class="{ disabled: opcion.disabled }"
        @click="!opcion.disabled && seleccionarOpcion(opcion)"
        :disabled="opcion.disabled"
        :style="{ width: props.widthCard || '120px' }"
      >
        <span
          :class="opcion.icono || 'fa fa-question fa-2x'"
          :style="{ width: props.widthIcon || '100px' }"
        ></span>
        <span class="btnText">{{ opcion.label }}</span>
      </button>
    </div>
  </div>
  <div v-else class="error-config">
    <span>Error: configuración de opciones no válida.</span>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";

const pnl = ref("");

const props = defineProps<{
  config: any;
  widthCard?: string;
  widthIcon?: string;
}>();

const emit = defineEmits(["accionSeleccionada"]);

function seleccionarOpcion(opcion: any) {
  pnl.value = opcion.accion;
  emit("accionSeleccionada", opcion.accion);
}
</script>

<style scoped lang="scss">
.titulo-subtitulo {
  margin-bottom: 10px;
  font-size: 1rem;
  color: #535353;
  font-weight: 600;
  text-align: center;
}
.titulo-opciones {
  margin-bottom: 10px;
  font-size: 1.3rem;
  color: #535353;
  font-weight: 600;
  text-align: center;
}
.manager-clientes-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}

.titulo-opciones {
  margin-bottom: 32px;
  font-size: 1.3rem;
  color: #535353;
  font-weight: 600;
  text-align: center;
}

.opciones-botones {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
}

.btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 120px;
  background: #fff;
  color: #535353;
  border: 2px solid #535353;
  border-radius: 14px;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 2px 8px #535353;
  transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
}

.btn:hover {
  background: #f2f2f2;
  border-color: #535353;
  box-shadow: 0 4px 16px #535353;
  color: #535353;
}

.btn:disabled {
  background: #e7e7e7;
  color: #898989;
  border-color: #898989;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
  pointer-events: none;
}
.fa-2x {
  font-size: 36px;
}

.btnText {
  margin-top: 8px;
  font-weight: 500;
  font-size: 1.05rem;
  text-align: center;
}
</style>
