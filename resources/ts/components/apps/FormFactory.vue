<script setup lang="ts">
import { useCatalogo } from "@/hooks/useCatalogo";
import { VMoney } from "v-money3";
import { defineEmits, defineProps, getCurrentInstance, watch } from "vue";

// Registrar la directiva manualmente
const instance = getCurrentInstance();
instance?.appContext.app.directive("money", VMoney);

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
  () => formLocal, // Observa directamente el objeto reactivo
  (newValue) => {
    schemaLocal.value.forEach((field: any) => {
      if (field?.type === "rangeDate") {
        if (newValue[field.minModel]) {
          showForm.value = false;
          field.maxConfig.minDate = newValue[field.minModel];
        }
        if (newValue[field.maxModel]) {
          showForm.value = false;
          field.minConfig.maxDate = newValue[field.maxModel];
        }
      }
    });
    // prettier-ignore
    setTimeout(() => { showForm.value = true; }, 0.5);
  },
  { deep: true } // Habilita la observación profunda
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
function handleSelectChange(field: any, selected: any) {
  let value = field.options.find((option: any) => option.label === selected);
  if (!(value === undefined)) {
    // Asegúrate de que el valor sea booleano
    formLocal[field.model] = value;
    // Si `formLive` es true, emite los cambios en tiempo real
    if (props.formLive) {
      emit("update:modelValue", { ...formLocal });
    }
  }
}

function handleSubmit() {
  let tmp = { ...formLocal };
  // Filtra los valores de formLocal según las claves definidas en el esquema
  const filteredForm = Object.fromEntries(
    props.schema.map((field) => [field.model, tmp[field.model]])
  );
  if (props.modelValue) {
    tmp = {
      ...tmp,
      ...props.modelValue,
    };
  }
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

function handleNumberInput(event: Event, field: any) {
  const input = event.target as HTMLInputElement;
  const model = field.model;

  // Configuración del formato
  let config = {
    decimal: ".",
    thousands: ",",
    prefix: "",
    sufijo: "",
    precision: 2,
  };

  config = {
    ...config,
    ...(field?.config || {}),
  };

  // Eliminar caracteres no válidos (solo números)
  let rawValue = input.value.replace(/[^0-9]/g, "");

  // Convertir a número entero
  let numericValue = parseInt(rawValue, 10);

  // Validar si es un número
  if (isNaN(numericValue)) {
    numericValue = 0; // Si no es un número, establecer en 0
  }

  // Dividir por 10^precision para manejar los decimales
  numericValue = numericValue / Math.pow(10, config.precision);

  // Aplicar precisión
  numericValue = parseFloat(numericValue.toFixed(config.precision));

  // Formatear con separadores de miles y decimales
  const formattedValue = `${config.prefix}${numericValue
    .toFixed(config.precision)
    .replace(".", config.decimal)
    .replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands)}${config.sufijo}`;

  // Actualizar el modelo con el valor formateado
  formLocal[model] = formattedValue;

  // Actualizar el valor del input para reflejar el formato en tiempo real
  input.value = formattedValue;

  // Restaurar la posición del cursor
  const cursorPosition = input.selectionStart || 0;
  const newCursorPosition =
    formattedValue.length - (rawValue.length - cursorPosition);
  input.setSelectionRange(newCursorPosition, newCursorPosition);
}

// Lógica para cargar catálogos dinámicos
const { obtenerCatalogo } = useCatalogo();

onMounted(async () => {
  let tmp: any = [...props.schema];
  // Filtra los campos que necesitan cargar catálogos
  const catalogPromises = tmp.map(async (field: any) => {
    if (field.type === "select" && field.catalogo) {
      const catalogoData = await obtenerCatalogo(field);
      field.options = catalogoData;
    }
  });

  // Espera a que todas las promesas de carga de catálogos se resuelvan
  await Promise.all(catalogPromises);
  tmp.forEach(async (field: any) => {
    if (field.type === "select" && field.options) {
      field.options = field.options;
    }

    if (field.type === "select" && formLocal[field.model]) {
      // prettier-ignore
      formLocal[field.model] = {
        label:formLocal[field.model].label || formLocal[field.model].nombre || "",
        ...formLocal[field.model], // Mantener otras propiedades si existen
      };
    }

    if (field.type === "rangeDate") {
      // prettier-ignore
      // field.minDisable = true;
      // field.maxDisable = true;
      field.minConfig = {
        ...(field?.config || { dateFormat: "Y-m-d" }),
      };
      field.maxConfig = {
        ...(field?.config || { dateFormat: "Y-m-d" }),
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
          // prettier-ignore
          if(typeof formLocal[field.model] == "string"){
            formLocal[field.model] = formLocal[field.model].toLowerCase() === "activo" || formLocal[field.model] === "1";
          } else {
            formLocal[field.model] = formLocal[field.model] === true || formLocal[field.model] === 1;
          }
        }
      }
    }
    field.classElement = props.isDialogVisible
      ? "wModal"
      : field.classElement || "wDefault";
  });
  schemaLocal.value = tmp;
  setTimeout(() => {}, 500);
  showForm.value = true;
});
</script>

<style scoped lang="scss">
.bgRed {
  background-color: red !important;
}
.wDefault {
  width: 25% !important;
  padding: 10px;
}

.wModal {
  width: 100% !important;
  padding: 10px;
}
.formWrapper {
  width: 100% !important;
  display: flex;
  flex-wrap: wrap;
}

@media (min-width: 1201px) {
  /* prettier-ignore */
  .wDefault { width: 25% !important; }
}

@media (max-width: 1200px) and (min-width: 801px) {
  /* prettier-ignore */
  .wDefault { width: 33% !important; }
}

@media (max-width: 800px) {
  /* prettier-ignore */
  .wDefault { width: 100% !important; }
}
</style>

<template>
  <div>
    <div v-if="!showForm" class="d-flex justify-center align-center">
      <h1 class="text-center my-5">Cargando formulario ...</h1>
    </div>
    <!-- Inline Form -->
    <div v-if="showForm" class="w-full">
      <!-- Renderiza el formulario -->
      <div class="formWrapper">
        <!-- Render dynamic fields -->
        <template v-for="field in schemaLocal" :key="field.model">
          <!-- Campo de texto -->
          <!-- prettier-ignore -->
          <div v-if="field.type === 'text'" :class="field.classElement">
            <label :for="field.model"> {{ field.label }} </label>
            <VTextField
              variant="outlined"
              v-model="formLocal[field.model]"
              :disabled="props.isDisabled || field.disabled"
              :placeholder="field.placeholder || `Introduce el dato requerido`"
              @input="handleInputChange(field.model, $event.target.value)"
            />
          </div>

          <!-- Campo number -->
          <!-- prettier-ignore -->
          <div v-else-if="field.type === 'number'" :class="field.classElement">
            <label :for="field.model"> {{ field.label }} </label>
            <VTextField
              @input="handleNumberInput($event, field)"
              :placeholder="field.placeholder || `Introduce el dato requerido`"
              v-model="formLocal[field.model]"
              class="form-control"
            />
          </div>

          <!-- Campo date -->
          <!-- prettier-ignore -->
          <div v-else-if="field.type === 'date'" :class="field.classElement">
            <label :for="field.model"> {{ field.label }} </label>
            <!-- prettier-ignore -->
            <AppDateTimePicker
              :key="`${field.model}`"
              v-model="formLocal[field.model]"
              :placeholder="field?.placeholder ?? 'Ingresa un fecha'"
              :config="{
                ...(field?.config || { dateFormat: 'Y-m-d' }),
                locale: 'es',
                minDate: field.config?.minDate ? formLocal[field.config.minDate] : undefined,
                maxDate: field.config?.maxDate ? formLocal[field.config.maxDate] : undefined,
              }"
            />
          </div>

          <!-- Campo rangeDate -->
          <!-- prettier-ignore -->
          <template v-else-if="field.type === 'rangeDate'">
            <div :class="field.classElement">
              <label :for="field.minModel"> {{ field.minLabel }} </label>
              <!-- prettier-ignore -->
              <AppDateTimePicker
                :key="`${field.minModel}`"
                v-model="formLocal[field.minModel]"
                :placeholder="field?.minPlaceholder ?? 'Ingresa un fecha'"
                :config="field.minConfig"
                :disabled="field.minDisable"
                clearable
              />
            </div>
            <div :class="field.classElement">
              <label :for="field.minModel"> {{ field.maxLabel }} </label>
              <!-- prettier-ignore -->
              <AppDateTimePicker
                :key="`${field.maxModel}`"
                v-model="formLocal[field.maxModel]"
                :placeholder="field?.maxPlaceholder ?? 'Ingresa un fecha'"
                :config="field.maxConfig"
                :disabled="field.maxDisable"
                clearable
              />
            </div>
          </template>
          <!-- Campo select -->
          <!-- prettier-ignore -->
          <div v-else-if="field.type === 'select'" :class="field.classElement">
            <label :for="field.model"> {{ field.label }} </label>
            <!-- prettier-ignore -->
            <VSelect
              :items="field.options || []"
              :value="formLocal[field.model]?.label ?? ''"
              item-title="label"
              :placeholder="field.placeholder || 'Selecciona una opción'"
              :disabled="props.isDisabled || field.disabled"
              @update:modelValue=" (selected) => handleSelectChange(field, selected) "
            >
              <template v-for="(_, label) in $slots" v-slot:[label]="slotProps">
                <slot :name="label" v-bind="slotProps || {}" />
              </template>
            </VSelect>
          </div>
          <!-- Campo switch -->
          <!-- prettier-ignore -->
          <div v-else-if="field.type === 'switch'" :class="field.classElement">
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
