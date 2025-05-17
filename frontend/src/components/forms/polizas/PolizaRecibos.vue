<template>
  <!-- prettier-ignore -->
  <div class="divIndicadores">
    <h2><strong>Total de recibos:</strong> {{ props.recibos.length }}</h2>
    <h2><strong>Recibos pendientes:</strong> {{ recibosFiltrados("Pendiente") }}</h2>
    <h2><strong>Recibos pagados:</strong> {{ recibosFiltrados("Pagado") }}</h2>
  </div>
  <div class="divWrapper">
    <VCard
      v-for="(recibo, index) in props.recibos"
      :key="recibo.id"
      class="w-full"
      :color="getEstatusColor(recibo)"
      variant="tonal"
    >
      <VCardText>
        <div class="divContainerWrapper">
          <div>
            <div class="d-flex justify-between align-center gap-5">
              <h3>Recibo: {{ recibo.numeroRecibo }}</h3>
              <VChip :color="'secondary'">
                {{ recibo.estatus }}
              </VChip>
            </div>
            <div>
              <!-- prettier-ignore -->
              <div class="d-flex justify-between align-center gap-5 text-black mt-2">
                <span><strong>Vencimiento:</strong> {{ recibo.vencimiento }}</span>
                <span><strong>Importe:</strong> ${{parseFloat(recibo.importe).toFixed(2)}}</span>
              </div>
            </div>
          </div>
          <!-- prettier-ignore -->
          <div class="divWrapperActions">
            <VBtn :disabled="!(recibo.estatus == 'Pendiente')" size="small" color="success" icon="tabler-cash" rounded >
                <VIcon icon="tabler-cash" />
                <VTooltip activator="parent" location="top" >Registrar pago</VTooltip>
            </VBtn>
            <VBtn :disabled="!(recibo.estatus == 'Pagado')"  size="small" color="error" icon="tabler-cancel" rounded >
                <VIcon icon="tabler-cancel" />
                <VTooltip activator="parent" location="top" >Cancelar Pago</VTooltip>
            </VBtn>
            <VBtn :disabled="!(recibo.estatus == 'Pagado')"   size="small" color="primary" icon="tabler-eye" rounded >
                <VIcon icon="tabler-eye" />
                <VTooltip activator="parent" location="top" >Ver evidencia</VTooltip>
            </VBtn>
            <VBtn :disabled="(recibo.estatus == 'Pagado')" size="small" color="secondary" icon="tabler-mail" rounded >
                <VIcon icon="tabler-mail" />
                <VTooltip activator="parent" location="top" >Mandar correo</VTooltip>
            </VBtn>
            <VBtn :disabled="(recibo.estatus == 'Pagado')" size="small" color="secondary" icon="tabler-brand-whatsapp" rounded >
                <VIcon icon="tabler-brand-whatsapp" />
                <VTooltip activator="parent" location="top" >Mandar Whatsapp</VTooltip>
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";

const props = defineProps<{
  recibos: Array<{
    id: number;
    poliza_id: number;
    numeroRecibo: string;
    vencimiento: string;
    importe: string;
    estatus: string;
    fechaPago: string | null;
    fechaCancelado: string | null;
    evidencia: string | null;
  }>;
}>();

// Función para filtrar recibos
const recibosFiltrados = (
  estatus: string,
  validacion = "== ",
  contador: boolean = true
) => {
  if (validacion == "== ") {
    const filtrados = props.recibos.filter(
      (recibo) => recibo.estatus == estatus
    );
    return contador ? filtrados.length : filtrados;
  } else {
    const filtrados = props.recibos.filter(
      (recibo) => recibo.estatus != estatus
    );
    return contador ? filtrados.length : filtrados;
  }
};

// Función para asignar color al estatus
const getEstatusColor = (recibo: any) => {
  switch (recibo.estatus) {
    case "Pendiente":
      return "warning"; // Color pastel amarillo
    case "Pagado":
      return "success"; // Color pastel verde
    case "Cancelado":
      return "error"; // Color pastel rojo
    default:
      return "secondary"; // Color pastel azul
  }
};
</script>

<style lang="scss">
.w-full {
  width: 100%;
}
h3 {
  padding: 0;
  margin: 0;
}
p {
  padding: 0;
  margin: 0;
}
.divIndicadores {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}
.divWrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.divWrapperActions {
  display: flex;
  margin-top: auto;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.divContainerWrapper {
  display: flex;
  color: black;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}
</style>
