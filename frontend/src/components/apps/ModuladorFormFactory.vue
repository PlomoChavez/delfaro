<script setup lang="ts">
import FormFactory from "@/components/apps/FormFactory.vue";
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
    divCard?: boolean;
    schema: any[];
    modelValue: Record<string, any>;
    formModal?: boolean;
    isDialogVisible?: boolean;
    isDisabled?: boolean;
    formLive?: boolean;
    showButtonsAction?: boolean;
    textButtonCancel?: string | null;
    titleClass?: string;
    textButtonSubmit?: string | null;
    customTitle?: boolean;
    showIconButtonSubmit?: boolean;
    showIconButtonCancel?: boolean;
    showButtonSubmit?: boolean;
    showButtonCancel?: boolean;
  }>(),
  {
    title: null,
    formModal: false,
    divCard: false,
    formLive: false,
    isDisabled: false,
    showButtonsAction: true,
    showIconButtonSubmit: true,
    isDialogVisible: false,
    customTitle: false,
    showIconButtonCancel: true,
    showButtonSubmit: true,
    showButtonCancel: true,
    textButtonCancel: null,
    textButtonSubmit: null,
    titleClass: "",
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
  emit("submit", data);
  emit("update:isDialogVisible", false);
} // prettier-ignore
function handleUpdate(data: any) {
  emit("update:modelValue", data);
}

function handleCancel() {
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
      <VCard :title="title != null ? props.customTitle ? title : ('Formulario de ' + title.toLowerCase()) : ''" >
        <VCardText>
          <FormFactory
          :schema="props.schema"
          :modelValue="props.modelValue"
          :isDialogVisible="props.isDialogVisible"
          :isDisabled="props.isDisabled"
          :showButtonsAction="props.showButtonsAction"
          @submit="handleSubmit"
          @cancel="handleCancel"
           />
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Inline Form -->
    <div v-else>
      <component :is="props.divCard ? VCard : 'div'" class="pa-6 mx-auto mb-4">
        <!-- prettier-ignore -->
        <h1 :class="props.titleClass">
          {{ title != null ? props.customTitle ? title : ('Formulario de ' + title.toLowerCase()) : '' }}
        </h1>
        <FormFactory
          :schema="props.schema"
          :modelValue="props.modelValue"
          :isDialogVisible="props.isDialogVisible"
          :isDisabled="props.isDisabled"
          :formLive="props.formLive"
          @update:modelValue="handleUpdate"
          :showButtonsAction="props.showButtonsAction"
          :showIconButtonSubmit="props.showIconButtonSubmit"
          :showIconButtonCancel="props.showIconButtonCancel"
          :showButtonSubmit="props.showButtonSubmit"
          :showButtonCancel="props.showButtonCancel"
          :textButtonCancel="props.textButtonCancel"
          :textButtonSubmit="props.textButtonSubmit"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </component>
    </div>
  </div>
</template>
