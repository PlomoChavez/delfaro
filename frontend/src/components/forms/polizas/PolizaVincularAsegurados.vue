<script setup lang="ts">
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { showSuccessMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import PolizaClientes from "@/components/forms/polizas/PolizaWizardClientes.vue";
import { customRequest } from "@/utils/axiosInstance";
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    data?: any;
  }>(),
  {
    data: {},
  }
);

const isCliente: any = ref(null);

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();

const formSchema = [
  { label: "Nombre", type: "text", model: "nombre" },
  { label: "RFC", type: "text", model: "rfc" },
  { label: "Fecha de nacimiento", type: "date", model: "fechaNacimiento" },
  { label: "Direccion", type: "text", model: "direccion" },
  { label: "Colonia", type: "text", model: "colonia" },
  { label: "Codigo Postal", type: "text", model: "codigoPostal" },
  { label: "Estado", type: "select", model: "estado", catalogo: "estados" },
  { label: "Ciudad", type: "text", model: "ciudad" },
  { label: "Correo electronico", type: "text", model: "correo" },
  { label: "Telefono", type: "text", model: "telefono" },
  { label: "Celular", type: "text", model: "celular" },
  { label: "Oficina", type: "text", model: "oficina" },
  { label: "Casa", type: "text", model: "casa" },
];

function handleCancel() {
  if (isCliente.value == null) {
    emit("cancelar");
  } else {
    isCliente.value = null;
  }
}

async function handleCreateOfCliente(data: any) {
  let url = "/api/polizas/asegurados";
  let payload = { poliza_id: props.data.id, ...data, cliente_id: data.id };
  delete payload.id;

  let response = await customRequest({
    url: url,
    method: "POST",
    data: payload,
  });
  if (response.data.result) {
    showSuccessMessage({
      title: "Eliminado",
      message: "El elemento ha sido eliminado correctamente.",
    });
    handleCancelFull();
  } else {
    showSuccessMessage({
      title: "Error",
      message: "No se pudo eliminar el elemento.",
    });
  }
}

function handleCancelFull() {
  isCliente.value = null;
  emit("cancelar");
}
</script>

<style scoped lang="scss">
.divWrapper {
  display: flex;
  justify-content: center;
  flex-direction: row;
  gap: 1rem;
}
.cardWrapper {
  display: flex;
  background-color: #f5f5f5;
  color: black;
  width: 300px;
  text-align: center;
  justify-content: space-between;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  border-color: #b7b7b7;
  border-width: 1px;
  border-style: solid;
}

.cardWrapper h1 {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>

<template>
  <div v-if="isCliente == null">
    <div class="divWrapper">
      <div class="cardWrapper" @click="isCliente = true">
        <h1 class="text-h4">Asegurar un cliente</h1>
        <p class="text-body-2">
          Se vinculara un cliente como asegurado, previamente registrado
        </p>
      </div>
      <div class="cardWrapper" @click="isCliente = false">
        <h1 class="text-h4">Registrar un nuevo asegurado</h1>
        <p class="text-body-2">Registrara un asegurado nuevo</p>
      </div>
    </div>
  </div>
  <div v-if="isCliente == false">
    <ModuladorFormFactory
      :title="'Asegurado'"
      :schema="formSchema"
      :modelValue="{}"
      :formModal="false"
      :isDialogVisible="false"
      @submit="handleCreateOfCliente"
    />
  </div>
  <div v-if="isCliente == true">
    <PolizaClientes
      titulo="Asegurados"
      :payloadDefault="{ poliza_id: props.data.id }"
      :exportSubmit="true"
      :subtitulos="'Selecciona o crea un nuevo cliente para vincularlo como asegurado a la poliza'"
      @cancelar="handleCancel"
      @actionSeleccionar="handleCreateOfCliente"
    />
  </div>
  <div class="d-flex justify-start align-center mb-5">
    <VBtn color="secondary" variant="outlined" @click="handleCancel">
      <VIcon start icon="tabler-alert-circle" />
      Cancelar
    </VBtn>
  </div>
</template>
