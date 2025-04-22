<script setup lang="ts">
import FormFactory from "@/components/apps/FormFactory.vue";
// prettier-ignore
import { defineEmits, defineProps } from "vue";
// prettier-ignore
import { VCard, VCardText, VDialog } from "vuetify/components";

interface Field {
  label: string;
  type: string;
  model: string;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  catalogo?: string;
  multiple?: boolean;
}

const props = withDefaults(
  defineProps<{
    title?: any;
    showTitle?: boolean;
    schema: Field[];
    modelValue: Record<string, any>;
    formModal?: boolean;
    isDialogVisible: boolean;
    formLive?: boolean;
  }>(),
  {
    title: null,
    formModal: false,
    formLive: false,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: Record<string, any>): void;
  (event: "submit", value: Record<string, any>): void;
  (event: "cancel"): void;
  (event: "update:isDialogVisible", value: boolean): void;
}>();

// prettier-ignore
function handleSubmit(data: any) {
  console.log("Enviando datos:", data);
  emit("submit", data);
  emit("update:isDialogVisible", false);
}

function handleCancel() {
  console.log("Cancelando...");
  emit("cancel");
  emit("update:isDialogVisible", false);
}
</script>

<template>
  <div>
    <!-- Modal Form -->
    <!-- prettier-ignore -->
    <VDialog v-if="formModal" :model-value="isDialogVisible" persistent class="v-dialog-sm" >
      <DialogCloseBtn @click="handleCancel" />
      <!-- prettier-ignore -->
      <VCard :title="title != null ? 'Formulario de ' + title.toLowerCase() : ''" >
        <VCardText>
          <FormFactory
          :schema="props.schema"
          :modelValue="props.modelValue"
          :isDialogVisible="props.isDialogVisible"
          @update:isDialogVisible="handleCancel"
          @submit="handleSubmit"
           />
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Inline Form -->
    <div v-else>
      <h1>{{ title != null ? "Formulario de " + title.toLowerCase() : "" }}</h1>
      <FormFactory
        :schema="props.schema"
        :modelValue="props.modelValue"
        :isDialogVisible="props.isDialogVisible"
        @update:isDialogVisible="handleCancel"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>
