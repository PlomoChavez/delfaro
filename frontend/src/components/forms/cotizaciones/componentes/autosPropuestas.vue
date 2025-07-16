<template>
  <div>
    <div v-if="propuestas && propuestas.length">
      <h2 class="title wFull text-center">Propuestas de Seguro</h2>
      <div class="propuestas-list-horizontal">
        <div v-for="item in propuestas" :key="item.id">
          <!-- prettier-ignore -->
          <div
            class="propuesta-card-horizontal card"
            :class="{ ' activeItem ': isItemSelected(seleccionadas, item, 'id') }"
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
                  <span class="detalle-value">{{
                    item.detalles.primaNeta
                  }}</span>
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
            </div>
            <!-- Columna 3: Iconos -->
            <div class="col-iconos">
              <i
                class="fa fa-exclamation-circle font22 icono-accion text-info"
                :title="
                  abiertos.includes(item.id) ? 'Ocultar detalle' : 'Ver detalle'
                "
                @click="toggleAcordeon(item.id)"
                style="cursor: pointer"
              />
              <a
                :href="item.archivo"
                target="_blank"
                rel="noopener"
                class="btn-icon"
                :title="'Descargar PDF'"
              >
                <i
                  class="fa fa-download font22 text-secondary"
                  aria-hidden="true"
                ></i>
              </a>
              <i
                class="fa fa-pencil font22 icono-accion text-warning"
                aria-hidden="true"
                title="Editar"
                @click="editarPropuesta(item)"
              />
            </div>
          </div>
          <!-- Acordeón de detalle -->
          <transition name="acordeon">
            <div
              :key="'acordeon-' + item.id"
              v-if="abiertos.includes(item.id)"
              class="card acordeonDetalles"
            >
              <PropuestaDetalles :cotizacion="item" />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PropuestaDetalles from "@/components/forms/cotizaciones/componentes/autosPropuestaDetalles.vue";
import { toggleItemInArray } from "@/utils/helper";
import { defineEmits, defineProps, ref } from "vue";
const props = defineProps<{
  configuracion: any;
}>();
const emit = defineEmits(["seleccionar", "editar"]);

const seleccionadas = ref<number[]>([]);
const propuestas = ref<any>(props.configuracion.cotizaciones || []);
const abiertos = ref<number[]>([]);

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

function toggleAcordeon(id: number) {
  if (abiertos.value.includes(id)) {
    abiertos.value = abiertos.value.filter((x) => x !== id);
  } else {
    abiertos.value.push(id);
  }
}
</script>

<style scoped>
.acordeon-enter-active,
.acordeon-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}
.acordeon-enter-from,
.acordeon-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
}
.acordeon-enter-to,
.acordeon-leave-from {
  max-height: 500px; /* Ajusta según el contenido */
  opacity: 1;
  transform: translateY(0);
}
.acordeonDetalles {
  margin-top: -1rem;
  border: 1px solid #b4b4b4 !important;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  background-color: #ededed !important;
  z-index: -1;
}
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
  position: relative;
  z-index: 2;
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

.acordeon-detalle {
  background: #f5faff;
  border: 1px solid #b3e5fc;
  border-radius: 8px;
  margin: 10px auto 0 auto;
  padding: 15px;
  font-size: 0.95rem;
  max-width: 900px;
  min-width: 520px;
  white-space: pre-wrap;
}
</style>
