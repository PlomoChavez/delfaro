<script lang="ts" setup>
import { defineProps, ref } from "vue";

const currentTab = ref("item1");

// prettier-ignore
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),{});

// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "nombre", placeholder: "Ingresa el nombre" },
  { label: "Correo electronico", type: "text", model: "correo", placeholder: "Ingresa el nombre" },
  { label: "Contraseña", type: "text", model: "password", placeholder: "Ingresa el nombre" },
  { label: "Tipo de usuario", type: "select", model: "tipo", placeholder: "Selecciona el tipo de usuario", catalogo: "tipos-usuarios" },
  { label: "Estatus", type: "switch", model: "estatus" },
];
</script>

<template>
  <div class="d-flex justify-start align-center mb-5">
    <VIcon start icon="tabler-arrow-left cursor-pointer" />
    <h1 class="ml-4">{{ props.data.nombre }}</h1>
  </div>
  <VCard>
    <VTabs v-model="currentTab">
      <VTab>Detalles del usario</VTab>
      <VTab>Claves</VTab>
      <VTab>SubAgentes</VTab>
      <VTab>Asistentes</VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem :value="`item1`">
          <ModuladorFormFactory
            :title="null"
            :isDialogVisible="false"
            :schema="formSchema"
            :showTitle="false"
            :modelValue="props.data"
          />
          <!-- @submit="handleFormSubmit" -->
        </VWindowItem>
        <VWindowItem :value="`item2`">
          <h1>Claves del usuario</h1>
        </VWindowItem>
        <VWindowItem :value="`item3`">
          <h1>SubAgentes del usuario</h1>
        </VWindowItem>
        <VWindowItem :value="`item4`">
          <h1>Asistentes del usuario</h1>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
