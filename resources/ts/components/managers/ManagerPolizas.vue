<script lang="ts" setup>
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import PolizaAsegurados from "@/components/forms/polizas/PolizaAsegurados.vue";
import PolizaHistorial from "@/components/forms/polizas/PolizaHistorial.vue";
import PolizaRecibos from "@/components/forms/polizas/PolizaRecibos.vue";
import { defineEmits, defineProps, ref } from "vue";

const currentTab = ref("item1");
const modalContrasenia = ref(false);
const formDisabled = ref(true);
const dataContrasenia = ref({});
const recibos: any = ref({});
const historial: any = ref([]);

// prettier-ignore
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),{});

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();
// prettier-ignore
const formSchema = [
  { label: "Nombre",              type: "text",   model: "nombre",    placeholder: "Ingresa el nombre" },
  { label: "Correo electronico",  type: "text",   model: "correo",    placeholder: "Ingresa el nombre" },
  { label: "Contraseña",          type: "text",   model: "password",  placeholder: "Ingresa el nombre" },
  { label: "Tipo de usuario",     type: "select", model: "tipo",      placeholder: "Selecciona el tipo de usuario", catalogo: "tipos-usuarios"},
  { label: "Estatus",             type: "switch", model: "estatus" },
];
// prettier-ignore
const formSchemaContrasenia = [
  { label: "Nombre",              type: "text", model: "nombre",   placeholder: "Ingresa el nombre", disabled:true},
  { label: "Tipo de usuario",     type: "text", model: "tipo",     placeholder: "Ingresa el nombre", disabled:true},
  { label: "Correo electronico",  type: "text", model: "correo",   placeholder: "Ingresa el nombre", disabled:true},
  { label: "Contraseña",          type: "text", model: "password", placeholder: "Ingresa el nombre" },
];

const handleShowModalContrasenia = () => {
  dataContrasenia.value = {
    ...props.data,
    tipo: props.data.tipo.label,
    password: "",
  };
  modalContrasenia.value = true;
};

async function getRecibos() {
  let url = "/api/polizas/recibos";
  let payload = { poliza_id: props.data.id };
  let response = await customRequest({
    url: url,
    method: "POST",
    data: payload,
  });
  if (response.data.result) {
    recibos.value = response.data.data;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}
async function getHistorial() {
  let url = "/api/polizas/historial";
  let payload = { poliza_id: props.data.id };
  let response = await customRequest({
    url: url,
    method: "POST",
    data: payload,
  });
  if (response.data.result) {
    historial.value = response.data.data;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

// prettier-ignore
const handleEditForm = () => { formDisabled.value = !formDisabled.value; };
// prettier-ignore
const handleBack = () => { emit("cancelar"); };

watch(
  () => currentTab.value,
  (newValue) => {
    console.log("currentTab", newValue);
    if (currentTab.value == "2") {
      // getRecibos();
      recibos.value = [
        {
          id: 25,
          poliza_id: 29,
          numeroRecibo: "REC-29-0001",
          vencimiento: "2025-01-23",
          importe: "6650.61",
          estatus: "Pendiente",
          fechaPago: null,
          fechaCancelado: null,
          evidencia: null,
          created_at: "2025-05-02T17:36:29.000000Z",
          updated_at: "2025-05-02T17:36:29.000000Z",
        },
        {
          id: 26,
          poliza_id: 29,
          numeroRecibo: "REC-29-0002",
          vencimiento: "2025-07-23",
          importe: "5954.63",
          estatus: "Pagado",
          fechaPago: null,
          fechaCancelado: null,
          evidencia: null,
          created_at: "2025-05-02T17:36:29.000000Z",
          updated_at: "2025-05-02T17:36:29.000000Z",
        },
      ];
    }
    if (currentTab.value == "3") {
      getHistorial();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="d-flex justify-start align-center mb-5">
    <VBtn
      icon="tabler-arrow-left"
      class="cursor-pointer"
      variant="text"
      color="secondary"
      @click="handleBack"
    />
    <!-- prettier-ignore -->
    <h1 class="ml-4">{{ props.data.numeroPoliza }} - {{  props.data.ramo.label }} - {{ props.data.compania.nombreCorto }}</h1>
  </div>
  <VCard>
    <VTabs v-model="currentTab">
      <VTab>Detalles</VTab>
      <VTab>Asegurados</VTab>
      <VTab>Pagos</VTab>
      <VTab>Historial</VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem :value="`item1`">
          <ModuladorFormFactory
            :title="null"
            :isDialogVisible="false"
            :schema="formSchema"
            :showTitle="false"
            :isDisabled="formDisabled"
            :showButtonsAction="!formDisabled"
            :modelValue="props.data"
            @cancel="formDisabled = true"
          />

          <div v-if="formDisabled" class="d-flex justify-end gap-3 mt-4">
            <!-- prettier-ignore -->
            <VBtn color="warning" @click="handleEditForm">
              <VIcon start icon="tabler-edit" />
              Editar
            </VBtn>
          </div>
          <!-- @submit="handleFormSubmit" -->
        </VWindowItem>
        <VWindowItem :value="`item2`">
          <PolizaAsegurados :data="props.data" />
        </VWindowItem>
        <VWindowItem :value="`item3`">
          <PolizaRecibos :recibos="recibos" />
        </VWindowItem>
        <VWindowItem :value="`item4`">
          <PolizaHistorial :data="historial" />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
