<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

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
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: Record<string, any>): void;
  (event: "submit", value: Record<string, any>): void;
  (event: "cancel"): void;
  (event: "update:isDialogVisible", value: boolean): void; // Evento para actualizar la visibilidad del modal
}>();

function handleInputChange(field: string, value: any) {
  const updatedModel = { ...props.modelValue, [field]: value };
  emit("update:modelValue", updatedModel);
}

function handleSubmit() {
  emit("submit", props.modelValue);
  emit("update:isDialogVisible", false); // Cerrar el modal
}

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
      <!-- Dialog close button -->
      <DialogCloseBtn @click="handleCancel" />

      <!-- Dialog Content -->
      <VCard :title="'Formulario de ' + title.toLowerCase()">
        <VCardText>
          <form @submit.prevent="handleSubmit">
            <div class="form-group mb-3">
              <!-- Render dynamic fields -->
              <template v-for="field in schema" :key="field.model">
                <AppTextField
                  v-if="field.type === 'text'"
                  :label="field.label"
                  :placeholder="field.placeholder || ''"
                  :value="modelValue[field.model]"
                  @input="handleInputChange(field.model, $event)"
                />
                <AppSelect
                  v-else-if="field.type === 'select'"
                  :items="field.options?.map((option) => option.label) || []"
                  :label="field.label"
                  :placeholder="field.placeholder || ''"
                  :value="modelValue[field.model]"
                  @change="handleInputChange(field.model, $event)"
                />
                <div v-else-if="field.type === 'switch'" class="form-group">
                  <label :for="field.model">{{ field.label }}</label>
                  <VSwitch
                    v-model="modelValue[field.model]"
                    :id="field.model"
                    :label="
                      (field.options || [
                        { value: true, label: 'Activo' },
                        { value: false, label: 'Inactivo' },
                      ])[modelValue[field.model] ? 0 : 1].label
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
          </form>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Inline Form -->
    <div v-else>
      <h1>{{ "Formulario de " + title.toLowerCase() }}</h1>
      <form @submit.prevent="handleSubmit">
        <div class="form-group mb-3">
          <!-- Render dynamic fields -->
          <template v-for="field in schema" :key="field.model">
            <AppTextField
              v-if="field.type === 'text'"
              :label="field.label"
              :placeholder="field.placeholder || ''"
              :value="modelValue[field.model]"
              @input="handleInputChange(field.model, $event)"
            />
            <AppSelect
              v-else-if="field.type === 'select'"
              :items="field.options?.map((option) => option.label) || []"
              :label="field.label"
              :placeholder="field.placeholder || ''"
              :value="modelValue[field.model]"
              @change="handleInputChange(field.model, $event)"
            />
            <div v-else-if="field.type === 'switch'" class="form-group">
              <label :for="field.model">{{ field.label }}</label>
              <VSwitch
                v-model="modelValue[field.model]"
                :id="field.model"
                :label="
                  (field.options || [
                    { value: true, label: 'Activo' },
                    { value: false, label: 'Inactivo' },
                  ])[modelValue[field.model] ? 0 : 1].label
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
      </form>
    </div>
  </div>
</template>
