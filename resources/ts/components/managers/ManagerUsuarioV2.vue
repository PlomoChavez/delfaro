<script lang="ts" setup>
import UsuarioClavesV1 from "@/components/forms/UsuarioClavesV1.vue";
import UsuarioSubagentesV1 from "@/components/forms/UsuarioSubagentesV1.vue";
import { defineProps, ref } from "vue";

const currentTab = ref("item1");
const modalContrasenia = ref(false);
const formDisabled = ref(true);
const dataContrasenia = ref({});

// prettier-ignore
const props = withDefaults(
  defineProps<{
    data: any;
    title?: string | null;
    isChild?: boolean;
  }>(),{
    isChild: false,
    title: null,
  });

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

// prettier-ignore
const handleEditForm = () => { formDisabled.value = !formDisabled.value; };
// prettier-ignore
const handleBack = () => { emit("cancelar"); };
</script>

<template>
  <div class="d-flex justify-start align-center mb-2">
    <VBtn
      icon="tabler-arrow-left"
      class="cursor-pointer"
      variant="text"
      color="secondary"
      @click="handleBack"
    />
    <h2 class="ml-4">{{ props.title }}</h2>
  </div>
  <VCard>
    <VTabs v-model="currentTab">
      <VTab>Detalles del usario</VTab>
      <VTab>Claves</VTab>
      <VTab>Permisos</VTab>
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
          <ModuladorFormFactory
            :title="'Cambiar contraseña'"
            :isDialogVisible="modalContrasenia"
            :schema="formSchemaContrasenia"
            :showTitle="false"
            :formModal="true"
            :modelValue="dataContrasenia"
            @update:isDialogVisible="modalContrasenia = false"
            @cancel="modalContrasenia = false"
          />

          <div v-if="formDisabled" class="d-flex justify-end gap-3 mt-4">
            <!-- prettier-ignore -->
            <VBtn color="secondary" @click="handleShowModalContrasenia">
              <VIcon start icon="tabler-key" />
              Cambiar contraseña
            </VBtn>

            <VBtn color="warning" @click="handleEditForm">
              <VIcon start icon="tabler-edit" />
              Editar
            </VBtn>
          </div>
          <!-- @submit="handleFormSubmit" -->
        </VWindowItem>
        <VWindowItem :value="`item2`">
          <UsuarioClavesV1 :data="props.data" />
        </VWindowItem>
        <VWindowItem :value="`item3`">
          <UsuarioSubagentesV1 :data="props.data" />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
