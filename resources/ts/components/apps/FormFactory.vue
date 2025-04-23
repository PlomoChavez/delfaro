<script setup lang="ts">
import { useCatalogo } from "@/hooks/useCatalogo";
import { defineEmits, defineProps, watch } from "vue";

interface Field {
  label: string;
  type: string; // Tipo de input: text, number, email, select, etc.
  model: string; // Nombre de la propiedad en el modelo
  options?: { value: string | number; label: string }[]; // Opciones para select
  placeholder?: string;
}

const props = withDefaults(
  defineProps<{
    title?: any;
    schema: Field[];
    modelValue: Record<string, any>;
    formModal?: boolean;
    isDialogVisible: boolean;
    formLive?: boolean;
    isDisabled?: boolean;
    showButtonsAction?: boolean;
    textButtonCancel?: string | null;
    textButtonSubmit?: string | null;
  }>(),
  {
    title: null,
    formModal: false,
    formLive: false,
    isDisabled: false,
    showButtonsAction: true,
    textButtonCancel: null,
    textButtonSubmit: null,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: Record<string, any>): void;
  (event: "submit", value: Record<string, any>): void;
  (event: "cancel"): void;
  (event: "update:isDialogVisible", value: boolean): void; // Evento para actualizar la visibilidad del modal
}>();

// Crea un modelo local reactivo
const formLocal: any = reactive(props.modelValue || {});
const schemaLocal: any = ref({});
const showForm: any = ref(false);
// Sincroniza los cambios entre `props.modelValue` y `formLocal`
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

// Maneja los cambios en los inputs
function handleInputChange(field: string, value: any) {
  formLocal[field] = value;
  console.log("Valor del campo:", toRaw(formLocal));
  console.log("Nuevo valor:", value);

  // Si `formLive` es true, emite los cambios en tiempo real
  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }
}
function handleSwitchChange(field: string) {
  // Asegúrate de que el valor sea booleano
  formLocal[field] = !!formLocal[field];
  // Si `formLive` es true, emite los cambios en tiempo real
  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }
}
function handleSelectChange(field: any, selected: any) {
  let value = field.options.find((option: any) => option.label === selected);
  if (!(value === undefined)) {
    console.log("Nuevo valor:", value);
    // Asegúrate de que el valor sea booleano
    formLocal[field.model] = value;
    console.log("Valor del campo:", toRaw(formLocal));
    // Si `formLive` es true, emite los cambios en tiempo real
    if (props.formLive) {
      emit("update:modelValue", { ...formLocal });
    }
  }
}

function handleSubmit() {
  let tmp = { ...formLocal };
  console.log("Valores del formulario:", tmp);
  // Filtra los valores de formLocal según las claves definidas en el esquema
  const filteredForm = Object.fromEntries(
    props.schema.map((field) => [field.model, tmp[field.model]])
  );
  if (props.modelValue) {
    console.log("entra al if de props");
    tmp = {
      ...tmp,
      ...props.modelValue,
    };
  }
  console.log("Valores originales:", tmp);
  tmp = {
    ...tmp,
    ...filteredForm,
  };
  // Emite solo los valores filtrados
  emit("submit", tmp);
  emit("update:isDialogVisible", false); // Cerrar el modal
}

// Maneja la cancelación del formulario
function handleCancel() {
  emit("cancel");
  emit("update:isDialogVisible", false); // Cerrar el modal
}

// Lógica para cargar catálogos dinámicos
const { obtenerCatalogo } = useCatalogo();

onMounted(() => {
  let tmp: any = [...props.schema];
  tmp.forEach(async (field: any) => {
    if (field.type === "select" && field.catalogo) {
      const catalogoData = await obtenerCatalogo(field);
      field.options = catalogoData;
      setTimeout(() => {}, 100);
    } else if (field.type === "select" && field.options) {
      field.options = field.options;
    }

    if (field.type === "select") {
      // prettier-ignore
      formLocal[field.model] = {
        value: formLocal[field.model].id || formLocal[field.model].value || "",
        label:formLocal[field.model].label || formLocal[field.model].nombre || "",
        ...formLocal[field.model], // Mantener otras propiedades si existen
      };
    }

    if (field.type === "switch") {
      if (formLocal[field.model]) {
        if (field.options) {
          let option = field.options.find(
            (option: any) => option.label === formLocal[field.model]
          );
          if (option) {
            formLocal[field.model] = option.value;
          } else {
            formLocal[field.model] = false;
          }
        } else {
          formLocal[field.model] =
            formLocal[field.model] == "Activo" ? true : false;
        }
      }
    }
  });
  schemaLocal.value = tmp;
  setTimeout(() => {}, 500);
  showForm.value = true;
});
</script>

<template>
  <div>
    <div v-if="!showForm" class="d-flex justify-center align-center">
      <h1 class="text-center my-5">Cargando formulario ...</h1>
    </div>
    <!-- Inline Form -->
    <div v-if="showForm">
      <!-- Renderiza el formulario -->
      <div class="form-group mb-3">
        <!-- Render dynamic fields -->

        <template v-for="field in schemaLocal" :key="field.model">
          <!-- Campo de texto -->
          <template v-if="field.type === 'text'" class="mb-5">
            <label :for="field.model"> {{ field.label }} </label>
            <VTextField
              :placeholder="field.placeholder || ''"
              variant="outlined"
              :id="field.model"
              v-model="formLocal[field.model]"
              :disabled="props.isDisabled || field.disabled"
              @input="handleInputChange(field.model, $event.target.value)"
            />
          </template>

          <!-- Campo select -->
          <template v-else-if="field.type === 'select'">
            <label :for="field.model"> {{ field.label }} </label>
            <!-- prettier-ignore -->
            <VSelect
              :items="field.options || []"
              :value="formLocal[field.model]?.label ?? ''"
              item-title="label"
              :disabled="props.isDisabled || field.disabled"
              @update:modelValue=" (selected) => handleSelectChange(field, selected) "
            >
              <template v-for="(_, label) in $slots" v-slot:[label]="slotProps">
                <slot :name="label" v-bind="slotProps || {}" />
              </template>
            </VSelect>
          </template>

          <!-- Campo switch -->
          <div v-else-if="field.type === 'switch'" class="form-group">
            <label :for="field.model"> {{ field.label }} </label>
            <VSwitch
              v-model="formLocal[field.model]"
              :id="field.model"
              :disabled="props.isDisabled || field.disabled"
              :label="
                (field.options || [
                  { value: true, label: 'Activo' },
                  { value: false, label: 'Inactivo' },
                ])[formLocal[field.model] ? 0 : 1].label
              "
              @change="handleSwitchChange(field.model)"
            />
          </div>
        </template>
      </div>
      <div v-if="showButtonsAction" class="d-flex justify-end gap-3 mt-4">
        <!-- prettier-ignore -->
        <VBtn variant="outlined" color="secondary" @click.prevent="handleCancel"  > 
          <VIcon start icon="tabler-x" />
          {{ props.textButtonCancel || "Cancelar" }} 
        </VBtn>

        <VBtn @click="handleSubmit" type="submit" color="success">
          <VIcon start icon="tabler-check" />
          {{ props.textButtonSubmit || "Enviar" }}
        </VBtn>
      </div>
    </div>
  </div>
</template>
