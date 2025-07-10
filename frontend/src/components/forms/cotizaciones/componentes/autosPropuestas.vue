<template>
  <div v-if="propuestas && propuestas.length">
    <h2 class="title wFull text-center">Propuestas de Seguro</h2>
    <div class="propuestas-list-horizontal">
      <div
        v-for="item in propuestas"
        :key="item.id"
        class="propuesta-card-horizontal"
        :class="seleccionadas.includes(item) ? 'activeItem' : ''"
      >
        <div class="propuesta-header-horizontal">
          <span class="nombre-compania">{{ item.companiaCorto }}</span>
        </div>
        <div class="propuesta-detalles-horizontal">
          <div class="detalle-row">
            <span class="detalle-key">Núm de Cotizacion:</span>
            <span class="detalle-value">{{ item.numeroCotizacion }}</span>
          </div>
          <div class="detalle-row">
            <span class="detalle-key">Prima neta:</span>
            <span class="detalle-value">{{ item.detalles.primaNeta }}</span>
          </div>
          <div class="detalle-row">
            <span class="detalle-key">Derechos de póliza:</span>
            <span class="detalle-value">{{
              item.detalles.expedicionPoliza
            }}</span>
          </div>
          <div class="detalle-row">
            <span class="detalle-key">IVA:</span>
            <span class="detalle-value">{{ item.detalles.iVA }}</span>
          </div>
        </div>
        <div class="propuesta-actions-vertical">
          <a
            :href="item.archivo"
            target="_blank"
            rel="noopener"
            class="btn-icon"
            :title="'Descargar PDF'"
          >
            <i class="fa fa-download font22" aria-hidden="true" width="16"></i>
          </a>

          <!-- prettier-ignore -->
          <div @click="seleccionar(item)">
            <i v-if="seleccionadas.includes(item)" class="fa fa-close font22 textDanger" aria-hidden="true" />
            <i v-else class="fa fa-check font22 textSuccess" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
    <!-- <pre>{{ seleccionadas }}</pre> -->
  </div>
</template>

<script setup lang="ts">
import { toggleItemInArray } from "@/utils/helper";
import { defineEmits, defineProps, ref } from "vue";
const props = defineProps<{
  configuracion: any;
}>();
const emit = defineEmits(["seleccionar"]);

const seleccionadas = ref<number[]>([]);
const propuestas = ref<any>(props.configuracion.cotizaciones || []);

async function seleccionar(item: any) {
  await toggleItemInArray(seleccionadas.value, item, "id");
  emit("seleccionar", item);
}
</script>

<style scoped>
.propuestas-list-horizontal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  align-items: stretch;
  margin-top: 2rem;
}
.propuesta-card-horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px #0001;
  padding: 1.2rem 2rem;
  gap: 2rem;
  min-width: 350px;
  max-width: 900px;
  margin: 0 auto;
}
.propuesta-header-horizontal {
  min-width: 120px;
  font-size: 1.3rem;
  font-weight: bold;
  color: #1976d2;
  margin-right: 2rem;
  text-align: center;
}
.propuesta-detalles-horizontal {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  justify-content: flex-start;
  align-items: flex-start;
}
.detalle-row {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
.detalle-key {
  font-weight: 600;
  color: #444;
  min-width: 140px;
  text-align: right;
  display: inline-block;
}
.detalle-value {
  font-weight: 400;
  color: #222;
  min-width: 90px;
  text-align: left;
  display: inline-block;
}
/* Cambia a columna los botones */
.propuesta-actions-vertical {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
.btn-icon {
  min-width: 40px;
  min-height: 40px;
}
</style>
