<template>
  <div class="wFull">
    <pre>{{ localData }}</pre>
    <div class="card" v-if="localData != null">
      <!-- prettier-ignore -->
      <p class="p-0 m-0">Compañia: <span>{{ localData.compania }}</span></p>
      <!-- prettier-ignore -->
      <p class="p-0 m-0">Ramo: <span>{{ localData.ramo }}</span></p>

      <!-- prettier-ignore -->
      <div v-if="localData.compania == 'QUALITAS' || localData.ramo == 'AUTOS'" >
        <FormFactory
          :schema="schemaInicial"
          :formLive="true"
          :modelValue="localData.titular"
          @update:modelValue="(val) => (localData.titular = val)"
          :textButtonSubmit="'Empezar cotización'"
          :showButtonSubmit="false"
          :showButtonCancel="false"
        />
      </div>
    </div>
    <div class="d-flex justify-space-between w-100 mt-5">
      <div>
        <VBtn color="dark" outlined @click="handleCancelar"> Cancelar </VBtn>
      </div>
      <div>
        <VBtn color="warning" @click="handleActualizar"> Actualizar </VBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";

const props = defineProps<{
  cotizacion: any;
}>();

const emit = defineEmits(["cancelar", "actualizar"]);
const localData: any = ref(null);

// prettier-ignore
let schemaInicial : any = null;

const seleccionadas = ref<number[]>([]);
function handleCancelar() {
  emit("cancelar");
}
function handleActualizar() {
  emit("actualizar");
}

function getPrimeraOpcionValida(arr: any[], prop: string): string | null {
  return Array.isArray(arr)
    ? arr.find((item) => item[prop] && item[prop] !== "")?.[prop] ?? null
    : null;
}

function filtrarOpcionesValidas(arr: any[], prop: string) {
  return Array.isArray(arr)
    ? arr
        .filter((item) => item[prop] && item[prop] !== "")
        .map((item) => ({ label: item[prop], value: item[prop] }))
    : [];
}

onMounted(() => {
  if (props.cotizacion) {
    let tmp = deepToRaw(props.cotizacion);
    let direcciones = tmp.detalles.direcciones;
    let versiones = tmp.detalles.versiones;

    // prettier-ignore
    const primeraVersion = getPrimeraOpcionValida(versiones, "label");
    const primeraDireccion = getPrimeraOpcionValida(direcciones, "value");

    // prettier-ignore
    localData.value = {
      ...tmp,
      titular: {
        ...tmp.titular,
        version: primeraVersion ? { label: primeraVersion, value: primeraVersion } : null,
        direccion: primeraDireccion ? { label: primeraDireccion, value: primeraDireccion } : null,
      },
    };

    // prettier-ignore
    schemaInicial = [
      {
        label: "Dirección",
        type: "select",
        model: "direccion",
        classElement: " col-sm-12 col-md-6  col-lg-6 ",
        options: filtrarOpcionesValidas(direcciones, "value"),
      },
      {
        label: "Version",
        type: "select",
        model: "version",
        classElement: " col-sm-12 col-md-6  col-lg-6 ",
        options: filtrarOpcionesValidas(versiones, "label"),
      },
    ];
  }
});
</script>

<style scoped></style>
