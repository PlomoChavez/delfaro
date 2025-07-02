<script setup lang="ts">
// Make sure the file exists at the specified path and extension
import BtnAtras from "@/components/apps/BtnAtras.vue";
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import CotizadorAutos from "@/components/forms/cotizaciones/CotizadorAutos.vue";
const emit = defineEmits(["cancelar"]);

const props = withDefaults(
  defineProps<{
    registro: any;
  }>(),
  {
    registro: null,
  }
);

const localData: any = ref(props.registro ? { ...props.registro } : {});
const ramos: any = ref(); // Referencia al componente FormFactory

const handleSeleccionarRamo = (item: any) => {
  if (!localData.value.configuracion) {
    localData.value.configuracion = {};
  }
  localData.value.ramo = item.label;
  localData.value.ramo_id = item.id;
};

const handleCancelarCotizacion = () => {
  emit("cancelar");
};

async function getRamos() {
  let url = "/api/catalogos/ramos";
  let response = await customRequest({
    url: url,
    method: "POST",
  });
  if (response.data.result) {
    ramos.value = response.data.data;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

onMounted(() => {
  getRamos();
});
</script>

<template>
  <div>
    <!-- Selecctor de tipo de seguro -->
    <div v-if="!localData?.ramo">
      <!-- prettier-ignore -->
      <BtnAtras titulo="Volver a cotizaciones" @atras="handleCancelarCotizacion" />
      <h1 class="module-title">Multicotizador de seguro</h1>
      <h2 class="title wFull text-center">Selecciona el tipo de seguro</h2>
      <div class="divRows mt-3">
        <!-- prettier-ignore -->
        <div
          v-for="item in ramos"
          :key="item"
          class="mb-5 card"
          @click="handleSeleccionarRamo(item)"
        >
          <!-- prettier-ignore -->
          <p class="p-0 m-0 fontBold"> {{ item.label }} </p>
        </div>
      </div>
    </div>
    <div v-else>
      <CotizadorAutos
        v-if="localData.ramo.toLowerCase() == 'autos'"
        :registro="localData"
        @cancelar="handleCancelarCotizacion"
      />
    </div>
    <pre>{{ localData }}</pre>
  </div>
</template>

<style scoped lang="scss">
.divItems {
  display: flex;
  gap: 2rem;
  width: fit-content;
  margin-left: auto !important;
  margin-right: auto !important;
}
.divRows {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}
.divCards {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}
.divColumns {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: fit-content;
  margin-left: auto !important;
  margin-right: auto !important;
}

.divButtons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-top: 15px !important ;
}

.divPlanItem {
  position: relative; // Añade esto
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  align-items: center;
  width: fit-content;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
}

.cardProductos {
  width: 400px !important;
}

.cardForm {
  width: 600px !important;
}

.cardEntrevista {
  width: 100% !important;
}
</style>
