<script setup lang="ts">
import { defineEmits, defineProps, watch } from "vue";

interface Field {
  label: string;
  type: string; // Tipo de input: text, number, email, select, etc.
  model: string; // Nombre de la propiedad en el modelo
  options?: { value: string | number; label: string }[]; // Opciones para select
  placeholder?: string;
}

const props = defineProps<{
  title: string; // Título del formulario
  schema: Field[]; // Esquema del formulario
  modelValue: Record<string, any>; // Modelo reactivo
  formModal?: boolean; // Indica si el formulario será un modal
  isDialogVisible: boolean; // Controla la visibilidad del modal desde el padre
  formLive?: boolean; // Si es 1, emite los valores en tiempo real
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: Record<string, any>): void;
  (event: "submit", value: Record<string, any>): void;
  (event: "cancel"): void;
  (event: "update:isDialogVisible", value: boolean): void; // Evento para actualizar la visibilidad del modal
}>();

// Crea un modelo local reactivo
const formLocal: any = reactive(props.modelValue || {});
// Sincroniza los cambios entre `props.modelValue` y `formLocal`
watch(
  () => props.modelValue,
  (newValue) => {
    Object.keys(formLocal).forEach((key) => delete formLocal[key]);
    Object.assign(formLocal, { ...newValue });
  }
);

// Maneja los cambios en los inputs
function handleInputChange(field: string, value: any) {
  formLocal[field] = value;

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

function handleSubmit() {
  let tmp = { ...formLocal };
  // Filtra los valores de formLocal según las claves definidas en el esquema
  const filteredForm = Object.fromEntries(
    props.schema.map((field) => [field.model, tmp[field.model]])
  );
  if (props.modelValue) {
    console.log("entra al if de props");
    tmp = {
      ...props.modelValue,
    };
  }
  console.log("Valores originales:", tmp);
  tmp = {
    ...tmp,
    ...filteredForm,
  };
  console.log("Valores filtrados:", tmp);
  // Emite solo los valores filtrados
  emit("submit", tmp);
  emit("update:isDialogVisible", false); // Cerrar el modal
}

// Maneja la cancelación del formulario
function handleCancel() {
  emit("cancel");
  emit("update:isDialogVisible", false); // Cerrar el modal
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
      <VCard :title="'Formulario de ' + title.toLowerCase()">
        <VCardText>
          <!-- Renderiza el formulario -->
          <div>
            <div class="form-group mb-3">
              <!-- Render dynamic fields -->
              <template v-for="field in schema" :key="field.model">
                <!-- Campo de texto -->
                <VTextField
                  v-if="field.type === 'text'"
                  :label="field.label"
                  :placeholder="field.placeholder || ''"
                  variant="outlined"
                  :id="field.model"
                  v-model="formLocal[field.model]"
                  @input="handleInputChange(field.model, $event.target.value)"
                />

                <!-- Campo select -->
                <AppSelect
                  v-else-if="field.type === 'select'"
                  :items="field.options?.map((option) => option.label) || []"
                  :label="field.label"
                  :placeholder="field.placeholder || ''"
                  :value="formLocal[field.model]"
                  @change="handleInputChange(field.model, $event)"
                />
                <!-- Campo switch -->
                <div v-else-if="field.type === 'switch'" class="form-group">
                  <label :for="field.model">
                    {{ field.label }} {{ formLocal[field.model] }}
                  </label>
                  <VSwitch
                    v-model="formLocal[field.model]"
                    :id="field.model"
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
          </div>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Inline Form -->
    <div v-else>
      <h1>{{ "Formulario de " + title.toLowerCase() }}</h1>
      <!-- Renderiza el formulario -->
      <div class="form-group mb-3">
        <!-- Render dynamic fields -->
        <template v-for="field in schema" :key="field.model">
          <!-- Campo de texto -->
          <AppTextField
            v-if="field.type === 'text'"
            :label="field.label"
            :placeholder="field.placeholder || ''"
            :value="formLocal[field.model]"
            @input="handleInputChange(field.model, $event.target.value)"
          />
          <!-- Campo select -->
          <AppSelect
            v-else-if="field.type === 'select'"
            :items="field.options?.map((option) => option.label) || []"
            :label="field.label"
            :placeholder="field.placeholder || ''"
            :value="formLocal[field.model]"
            @change="handleInputChange(field.model, $event)"
          />
          <!-- Campo switch -->
          <div v-else-if="field.type === 'switch'" class="form-group">
            <label :for="field.model">{{ field.label }}</label>
            <VSwitch
              v-model="formLocal[field.model]"
              :id="field.model"
              :label="
                (field.options || [
                  { value: 1, label: 'Activo' },
                  { value: false, label: 'Inactivo' },
                ])[formLocal[field.model] ? 0 : 1].label
              "
            />
          </div>
        </template>
      </div>
      <div class="d-flex justify-end gap-3 mt-4">
        <VBtn @click.prevent="handleCancel" color="error">
          <VIcon start icon="tabler-x" />
          Cancelar
        </VBtn>
        <VBtn type="submit" color="success">
          <VIcon start icon="tabler-check" />
          Enviar
        </VBtn>
      </div>
    </div>
  </div>
</template>
