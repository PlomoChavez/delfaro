<template>
  <div>
    <div v-if="propuestas && propuestas.length">
      <h2 class="title wFull text-center">Propuestas de Seguro</h2>
      <div class="propuestas-list-horizontal">
        <!-- prettier-ignore -->
        <div
          v-for="item in propuestas"
          :key="item.id"
          class="propuesta-card-horizontal card"
          :class="{ ' activeItem ': isItemSelected(seleccionadas, item, 'id'), }"
        >
          <!-- Columna 1: Checkbox -->
          <div class="col-check">
            <input
              type="checkbox"
              :checked="seleccionadas.includes(item.id)"
              @change="seleccionar(item)"
              class="custom-checkbox"
            />
          </div>
          <!-- Columna 2: Datos (diseño original) -->
          <div class="col-datos flex-grow-1">
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
                <span class="detalle-value">{{ item.detalles.expedicionPoliza }}</span>
              </div>
              <div class="detalle-row">
                <span class="detalle-key">IVA:</span>
                <span class="detalle-value">{{ item.detalles.iVA }}</span>
              </div>
            </div>
          </div>
          <!-- Columna 3: Iconos -->
          <div class="col-iconos">
            <a :href="item.archivo" target="_blank" rel="noopener" class="btn-icon" :title="'Descargar PDF'" >
              <i class="fa fa-download font22 text-secondary" aria-hidden="true"></i>
            </a>
            <i class="fa fa-pencil font22 icono-accion text-warning" aria-hidden="true" title="Editar" @click="editarPropuesta(item)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toggleItemInArray } from "@/utils/helper";
import { defineEmits, defineProps, ref } from "vue";
const props = defineProps<{
  configuracion: any;
}>();
const emit = defineEmits(["seleccionar", "editar"]);

const seleccionadas = ref<number[]>([]);
const propuestas = ref<any>(props.configuracion.cotizaciones || []);

function seleccionar(item: any) {
  item = deepToRaw(item);
  console.log("Seleccionando propuesta:", item);
  toggleItemInArray(seleccionadas.value, item, "id");
  console.log("Seleccionadas:", seleccionadas.value);
  emit("seleccionar", item);
}

function editarPropuesta(item: any) {
  emit("editar", item);
}
</script>

<style scoped>
.nombre-compania {
  font-weight: bold;
  color: #1976d2;
  text-align: center;
  width: 100%;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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
  padding: 20px;
  gap: 1rem;
  min-width: 520px;
  max-width: 900px;
  margin: 0 auto;
}
.col-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
}
.custom-checkbox {
  width: 22px;
  height: 22px;
  accent-color: #1976d2;
  cursor: pointer;
}
.col-datos {
  flex: 1 1 auto;
  min-width: 0;
}
.col-iconos {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  min-width: 60px;
}
.icono-accion {
  color: #1976d2;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 1.5rem;
}
.icono-accion:hover {
  color: #0d47a1;
}
.btn-icon {
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.propuesta-header-horizontal {
  font-weight: bold;
  font-size: 1.1rem;
  width: 100%;
  text-align: center;
  margin-bottom: 0.5rem;
}
.propuesta-detalles-horizontal {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.activeItem {
  border: 2px solid #1976d2;
  background: #e3f0fc;
}
</style>
