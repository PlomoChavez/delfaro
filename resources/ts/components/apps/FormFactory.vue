<script setup lang="ts">
import { useCatalogo } from "@/hooks/useCatalogo";
import {
  defineEmits,
  defineProps,
  h,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  VBtn,
  VCard,
  VCardText,
  VDialog,
  VIcon,
  VSelect,
  VSwitch,
  VTextField,
} from "vuetify/components";

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
    title: any;
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

const formLocal: any = reactive({ ...props.modelValue });
const schemaLocal = ref<Field[]>([]);

watch(
  () => props.modelValue,
  (newValue) => {
    Object.keys(formLocal).forEach((key) => delete formLocal[key]);
    Object.assign(formLocal, { ...newValue });
  }
);

watch(
  () => formLocal,
  (newValue) => {
    console.log("formLocal", newValue);
  }
);

function handleInputChange(field: string, value: any) {
  formLocal[field] = value;
  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }
}

function handleSwitchChange(field: string) {
  formLocal[field] = !!formLocal[field];
  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }
}

function handleSelectChange(field: any, selected: any) {
  const value = field.options.find((option: any) => option.label === selected);
  if (value !== undefined) {
    formLocal[field.model] = value;
    if (props.formLive) {
      emit("update:modelValue", { ...formLocal });
    }
  }
}

function handleSubmit() {
  const tmp = { ...formLocal };
  const filteredForm = Object.fromEntries(
    props.schema.map((field) => [field.model, tmp[field.model]])
  );

  const result = {
    ...props.modelValue,
    ...filteredForm,
  };

  emit("submit", result);
  emit("update:isDialogVisible", false);
}

function handleCancel() {
  emit("cancel");
  emit("update:isDialogVisible", false);
}

const { obtenerCatalogo } = useCatalogo();

onMounted(() => {
  const tmp: any = [...props.schema];
  tmp.forEach(async (field: any) => {
    if (field.type === "select" && field.catalogo) {
      const catalogoData = await obtenerCatalogo(field);
      field.options = catalogoData;
    }
  });
  schemaLocal.value = tmp;
});

// Renderizado del formulario dinámico
function renderForm() {
  return h("div", {}, [
    h(
      "div",
      { class: "form-group mb-3" },
      schemaLocal.value.map((field: Field) => {
        if (field.type === "text") {
          return h("div", { class: "mb-5", key: field.model }, [
            h("label", { for: field.model }, field.label),
            h(VTextField, {
              placeholder: field.placeholder || "",
              variant: "outlined",
              id: field.model,
              modelValue: formLocal[field.model],
              "onUpdate:modelValue": (val: any) =>
                handleInputChange(field.model, val),
            }),
          ]);
        } else if (field.type === "select") {
          return h("div", { key: field.model }, [
            h("label", { for: field.model }, field.label),
            h(VSelect, {
              items: field.options || [],
              value: formLocal[field.model],
              itemTitle: "label",
              variant: "outlined",
              id: field.model,
              menuProps: {
                contentClass: [
                  "app-inner-list",
                  "app-select__content",
                  "v-select__content",
                  field.multiple ? "v-list-select-multiple" : "",
                ],
              },
              "onUpdate:modelValue": (selected: any) =>
                handleSelectChange(field, selected),
            }),
          ]);
        } else if (field.type === "switch") {
          return h("div", { class: "form-group", key: field.model }, [
            h("label", { for: field.model }, field.label),
            h(VSwitch, {
              id: field.model,
              modelValue: formLocal[field.model],
              label: (field.options || [
                { value: true, label: "Activo" },
                { value: false, label: "Inactivo" },
              ])[formLocal[field.model] ? 0 : 1].label,
              onChange: () => handleSwitchChange(field.model),
            }),
          ]);
        }
        return null;
      })
    ),
  ]);
}
</script>

<template>
  <div>
    <!-- Modal Form -->
    <VDialog
      v-if="formModal"
      :model-value="isDialogVisible"
      persistent
      class="v-dialog-sm"
    >
      <DialogCloseBtn @click="handleCancel" />
      <VCard
        :title="title != null ? 'Formulario de ' + title.toLowerCase() : ''"
      >
        <VCardText>
          <component :is="renderForm" />
          <div class="d-flex justify-end gap-3 mt-4">
            <VBtn @click="handleCancel" color="error">
              <VIcon start icon="tabler-x" />
              Cancelar
            </VBtn>
            <VBtn @click="handleSubmit" type="submit" color="success">
              <VIcon start icon="tabler-check" />
              Enviar
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Inline Form -->
    <div v-else>
      <h1>{{ title != null ? "Formulario de " + title.toLowerCase() : "" }}</h1>
      <component :is="renderForm" />
      <div class="d-flex justify-end gap-3 mt-4">
        <VBtn @click.prevent="handleCancel" color="error">
          <VIcon start icon="tabler-x" />
          Cancelar
        </VBtn>
        <VBtn @click="handleSubmit" type="submit" color="success">
          <VIcon start icon="tabler-check" />
          Enviar
        </VBtn>
      </div>
    </div>
  </div>
</template>
