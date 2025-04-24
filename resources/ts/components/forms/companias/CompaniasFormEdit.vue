<script lang="ts" setup>
import FormFactory from "@/components/apps/FormFactory.vue";
import CompaniasRepresentantes from "@/components/forms/companias/CompaniasRepresentantesV1.vue";

import { showSuccessMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { customRequest } from "@/utils/axiosInstance";
// prettier-ignore
import { defineEmits, defineProps, ref, watch } from "vue";
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "atras"): void;
}>();

const currentTab = ref("tab1");
const formDataLocal = ref(props.data);

// prettier-ignore
const formSchema = [
  { label: "Nombre corto", type: "text", model: "nombreCorto", placeholder: "Ingresa el nombre" },
  { label: "Nombre", type: "text", model: "nombre", placeholder: "Ingresa el nombre" },
  { label: "RFC", type: "text", model: "rfc", placeholder: "Ingresa el nombre" },
  { label: "Direcciòn", type: "text", model: "direccion", placeholder: "Ingresa el nombre" },
  { label: "Colonia", type: "text", model: "colonia", placeholder: "Ingresa el nombre" },
  { label: "Codigo Postal", type: "text", model: "codigoPostal", placeholder: "Ingresa el nombre" },
  { label: "Estado", type: "text", model: "estado", placeholder: "Ingresa el nombre" },
  { label: "Ciudad", type: "text", model: "ciudad", placeholder: "Ingresa el nombre" },
  { label: "Limite Primer pago", type: "text", model: "limitePrimerPago", placeholder: "Ingresa el nombre" },
  { label: "Limite Primer Subsecuente", type: "text", model: "limitePrimerSubsecuente", placeholder: "Ingresa el nombre" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const handleAtras = () => {
  emit("atras");
};

const handleFormSubmit = async (data: any) => {
  let response = await customRequest({
    url: "/api/companias/update",
    method: "POST",
    data: { ...data },
  });
  console.log("handleFormSubmit", response);
  showSuccessMessage({});
};

// prettier-ignore
watch(() => props.data , (newValue) => { formDataLocal.value = newValue } );
onMounted(() => {
  console.log("onMounted", props.data);
});
</script>

<template>
  <div class="d-flex justify-start align-center mb-5">
    <VBtn @click="handleAtras">
      <VIcon start icon="tabler-checkbox" />
      Atrás
    </VBtn>
  </div>
  <VCard>
    <VTabs v-model="currentTab">
      <VTab>Detalles</VTab>
      <VTab>Representantes</VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem :value="`tab1`">
          <FormFactory
            ref="formFactoryRef"
            :schema="formSchema"
            :modelValue="formDataLocal"
            :isDialogVisible="false"
            @submit="handleFormSubmit"
            @cancel="handleAtras"
          />
        </VWindowItem>
        <VWindowItem :value="`tab2`">
          <CompaniasRepresentantes :data="formDataLocal" />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
