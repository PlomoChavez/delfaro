<script lang="ts" setup>
import FormFactory from "@/components/apps/FormFactory.vue";
const props = withDefaults(
  defineProps<{
    title: string; // Título del módulo
    formSchema: any; // Esquema del formulario
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "atras"): void;
}>();

const currentTab = ref("tab1");
const formDataLocal = ref({});

// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "nombre", placeholder: "Ingresa el nombre" },
  { label: "Correo electronico", type: "text", model: "correo", placeholder: "Ingresa el nombre" },
  { label: "Contraseña", type: "text", model: "password", placeholder: "Ingresa el nombre" },
  { label: "Tipo de usuario", type: "select", model: "tipo_id", placeholder: "Selecciona el tipo de usuario", catalogo: "tipos-usuarios" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const handleAtras = () => {
  emit("atras");
};

const handleFormSubmit = () => {
  emit("atras");
};
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
            :title="''"
            :schema="formSchema"
            :modelValue="formDataLocal"
            :isDialogVisible="false"
            @submit="handleFormSubmit"
          />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
