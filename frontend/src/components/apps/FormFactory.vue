<script setup lang="ts">
import { useCatalogo } from "@/hooks/useCatalogo";
import { computed, getCurrentInstance, ref, watch } from "vue";

// Registrar la directiva manualmente
const instance = getCurrentInstance();
// instance?.appContext.app.directive("money", VMoney);

interface Field {
  label: string;
  type: string; // Tipo de input: text, number, email, select, etc.
  model: string; // Nombre de la propiedad en el modelo
  options?: {
    id?: string | number | boolean;
    value?: string | number | boolean;
    label?: string;
  }[]; // Opciones para select
  placeholder?: string;
}

const props = withDefaults(
  defineProps<{
    title?: any;
    schema: Field[];
    modelValue: Record<string, any>;
    formModal?: boolean;
    isDialogVisible?: boolean;
    formLive?: boolean;
    isDisabled?: boolean;
    showButtonsAction?: boolean;
    textButtonCancel?: string | null;
    textButtonSubmit?: string | null;
    showIconButtonSubmit?: boolean;
    showIconButtonCancel?: boolean;
    showButtonSubmit?: boolean;
    showButtonCancel?: boolean;
    formRequired?: boolean;
    validarCambios?: boolean;
  }>(),
  {
    title: null,
    formModal: false,
    formLive: false,
    formRequired: false,
    isDisabled: false,
    isDialogVisible: false,
    showButtonsAction: true,
    validarCambios: true,
    showIconButtonSubmit: true,
    showIconButtonCancel: true,
    showButtonSubmit: true,
    showButtonCancel: true,
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
const mensajeRef = ref<HTMLElement | null>(null);
const camposFaltantes = ref<string[]>([]);
const mostrarTodosFaltantes = ref(false);
const spanRequired = ref('<span style="color:red">*</span>');

function toggleFaltantes() {
  mostrarTodosFaltantes.value = !mostrarTodosFaltantes.value;
}
// Sincroniza los cambios entre `props.modelValue` y `formLocal`
watch(
  () => props.modelValue,
  (newValue) => {
    Object.keys(formLocal).forEach((key) => delete formLocal[key]);
    Object.assign(formLocal, { ...newValue });
  }
);

const tieneRequeridos = computed(() =>
  props.schema?.some((field: any) => field.required)
);

// Maneja los cambios en los inputs
function handleInputChange(field: string, value: any) {
  formLocal[field] = value;
  // Si `formLive` es true, emite los cambios en tiempo real
  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }

  if (props.validarCambios) {
    validarCamposRequeridos();
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
  } else {
    formLocal[field.model] = null;
  }
  if (props.validarCambios) {
    validarCamposRequeridos();
  }
}

function validarCamposRequeridos() {
  const faltantes: string[] = [];
  props.schema.forEach((field: any) => {
    // Si formRequired es true, todos los campos son requeridos excepto los ignorados
    const ignorados = ["label", "separador", "switch"];
    const esRequerido = props.formRequired
      ? !ignorados.includes(field.type)
      : field.required;

    if (esRequerido) {
      const valor = formLocal[field.model];
      if (
        valor === undefined ||
        valor === null ||
        (typeof valor === "string" && valor.trim() === "") ||
        (Array.isArray(valor) && valor.length === 0)
      ) {
        faltantes.push(field.label.replace(/<[^>]*>?/gm, ""));
      }
    }
  });
  camposFaltantes.value = faltantes;
  return faltantes;
}

function handleSubmit() {
  const faltantes = validarCamposRequeridos();
  if (faltantes.length > 0) {
    // Muestra el mensaje y hace scroll al mensaje
    setTimeout(() => {
      mensajeRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return;
  }
  let tmp = { ...formLocal };
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
  emit("submit", tmp);
  emit("update:isDialogVisible", false);
}

// Maneja la cancelación del formulario
function handleCancel() {
  emit("cancel");
  emit("update:isDialogVisible", false); // Cerrar el modal
}

function obtenerPropiedad(obj: any, ruta: string): any {
  if (!ruta) {
    return ""; // Si la ruta está vacía, devuelve undefined
  }
  return ruta.split(".").reduce((acumulador, clave) => {
    return acumulador ? acumulador[clave] : undefined;
  }, obj);
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

function handleRangeDateChange(field: any, modelKey: "minModel" | "maxModel") {
  // showForm.value = false;
  if (modelKey === "minModel" && formLocal[field.minModel]) {
    field.maxConfig.minDate = formLocal[field.minModel];
  }
  if (modelKey === "maxModel" && formLocal[field.maxModel]) {
    field.minConfig.maxDate = formLocal[field.maxModel];
  }
  field.refreshKey = Date.now(); // Genera un valor único
  // showForm.value = false;

  // // prettier-ignore
  // setTimeout(() => { showForm.value = true; }, 0.5);
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

    if (field.type === "date") {
      // prettier-ignore
      formLocal[field.model] = null;
    }

    if (field.type === "select" && formLocal[field.model]) {
      if (field.options) {
        let valor = toRaw(formLocal[field.model].label);
        let options = field.options;
        let option = options.find((option: any) => {
          return (
            String(option.label).toLowerCase() == String(valor).toLowerCase()
          );
        });
        formLocal[field.model] = option ? toRaw(option) : null;
      } else {
        // prettier-ignore
        formLocal[field.model] = {
          label:formLocal[field.model].label || formLocal[field.model].nombre || "",
          ...formLocal[field.model], // Mantener otras propiedades si existen
        };
      }
    }

    if (field.type === "rangeDate") {
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
            (option: any) => option.value == formLocal[field.model]
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

.faltantes-alert {
  background: #fff7e6;
  border: 1.5px solid #ffd699;
  color: #b85c00;
  font-weight: 500;
  padding: 18px 18px 12px 18px;
  border-radius: 10px;
  box-shadow: 0 2px 8px #ffd69944;
  margin-bottom: 16px;
  font-size: 0.95rem; // <--- tamaño de letra reducido
}

.faltantes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.faltantes-icon {
  font-size: 1.3rem; // <--- icono un poco más pequeño
}

.faltantes-title {
  font-size: 0.9rem; // <--- título más pequeño
  font-weight: 700;
}

.faltantes-desc {
  font-size: 0.8rem; // <--- descripción más pequeña
  margin-bottom: 8px;
}

.faltantes-list,
.faltantes-list-2col {
  padding-left: 18px;
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.6; // iguala el interlineado
}

.faltantes-list-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0px 24px; // aumenta el gap vertical para mejor lectura
}

.faltantes-list-icon {
  color: #b85c00;
  font-weight: bold;
  margin-right: 6px;
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
        <!-- prettier-ignore -->
        <h6 v-if="tieneRequeridos" class="mb16" style="color: #535353; font-size: 0.80rem;">
          Este formulario cuenta con campos obligatorios, los puedes identificar porque tienen este símbolo <span style="color:red">*</span>
        </h6>

        <div
          v-if="camposFaltantes.length"
          ref="mensajeRef"
          class="mb14 faltantes-alert mx-auto"
        >
          <div class="faltantes-header">
            <span class="faltantes-icon">⚠️</span>
            <span class="faltantes-title">Campos obligatorios pendientes</span>
          </div>
          <div class="faltantes-desc">
            Por favor completa los siguientes campos requeridos antes de
            continuar:
          </div>
          <div class="">
            <ul
              class="faltantes-list"
              :class="{
                'faltantes-list-2col':
                  camposFaltantes.length > 10 && mostrarTodosFaltantes,
              }"
            >
              <li
                v-for="campo in mostrarTodosFaltantes
                  ? camposFaltantes
                  : camposFaltantes.slice(0, 5)"
                :key="campo"
              >
                {{ campo }}
              </li>
            </ul>
          </div>
          <div
            v-if="camposFaltantes.length > 5"
            style="margin-top: 6px"
            class="text-center"
          >
            <button
              @click="toggleFaltantes"
              style="
                background: none;
                border: none;
                color: #b85c00;
                cursor: pointer;
                font-size: 0.8rem;
                text-decoration: underline;
              "
            >
              {{
                mostrarTodosFaltantes
                  ? "Ocultar otros campos"
                  : `Ver otros campos (${camposFaltantes.length - 5})`
              }}
            </button>
          </div>
        </div>
        <v-row>
          <template v-for="field in schemaLocal" :key="field.model">
            <!-- Campo de texto -->
            <!-- prettier-ignore -->
            <div v-if="field.type === 'label'" :class="field.classElement">
               <label> {{ field.label }} </label>
               <!-- <p class="ml-3"> {{ formLocal[field.model] }} </p> -->
               <p class="ml-3"> {{ obtenerPropiedad(formLocal, field.model) || '' }} </p>
             </div>
            <!-- prettier-ignore -->
            <div v-if="field.type === 'separador'" :class="field.classElement">
               <h3 class="titleForm"> {{ field.label }} </h3>
               <!-- <p class="ml-3"> {{ formLocal[field.model] }} </p> -->
             </div>

            <div v-if="field.type === 'text'" :class="field.classElement">
              <!-- prettier-ignore -->
              <label :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>

              <VTextField
                variant="outlined"
                v-model="formLocal[field.model]"
                :disabled="props.isDisabled || field.disabled"
                :placeholder="
                  field.placeholder || `Introduce el dato requerido`
                "
                @input="handleInputChange(field.model, $event.target.value)"
              />
            </div>

            <!-- Campo number -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'number'" :class="field.classElement">
              <!-- prettier-ignore -->   
              <label :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>

               <VTextField
                 @input="handleNumberInput($event, field)"
                 :disabled="props.isDisabled || field.disabled"
                 :placeholder="field.placeholder || `Introduce el dato requerido`"
                 v-model="formLocal[field.model]"
                 class="form-control"
               />
             </div>

            <!-- Campo date -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'date'" :class="field.classElement">
              <!-- prettier-ignore -->   
              <label :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>
              <!-- prettier-ignore -->
              <AppDateTimePicker
                :key="`${field.model}`"
                v-model="formLocal[field.model] "
                :placeholder="field?.placeholder ?? 'Ingresa un fecha'"
                :config="{
                  ...(field?.config || { dateFormat: 'Y-m-d' }),
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
                   :key="field.refreshKey" 
                   v-model="formLocal[field.minModel]"
                   :placeholder="field?.minPlaceholder ?? 'Ingresa un fecha'"
                   @change="handleRangeDateChange(field, 'minModel')"
                   :config="field.minConfig"
                   :disabled="props.isDisabled || field.minDisable"
                   clearable
                 />
               </div>
               <div :class="field.classElement">
                 <label :for="field.maxModel"> {{ field.maxLabel }} </label>
                 <!-- prettier-ignore -->
                 <AppDateTimePicker
                 :key="field.refreshKey" 
                   v-model="formLocal[field.maxModel]"
                   :placeholder="field?.maxPlaceholder ?? 'Ingresa un fecha'"
                   @change="handleRangeDateChange(field, 'maxModel')"
                   :config="field.maxConfig"
                   :disabled="props.isDisabled || field.maxDisable"
                   clearable
                 />
               </div>
             </template>
            <!-- Campo select -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'select'" :class="field.classElement">
              <!-- prettier-ignore -->   
              <label :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>
              <!-- prettier-ignore -->
              <VSelect
                :items="field.options || []"
                :value="formLocal[field.model]?.label ?? ''"
                item-title="label"
                clearable
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
              <!-- prettier-ignore -->   
              <label :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>

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
        </v-row>
      </div>
      <div v-if="showButtonsAction" class="d-flex justify-end gap-3 mt-4">
        <!-- prettier-ignore -->
        <VBtn v-if="showButtonCancel" variant="outlined" color="secondary" @click.prevent="handleCancel"  > 
          <VIcon v-if="showIconButtonCancel"  start icon="tabler-x" />
          {{ props.textButtonCancel || "Cancelar" }} 
        </VBtn>

        <VBtn
          v-if="showButtonSubmit"
          @click="handleSubmit"
          type="submit"
          color="success"
        >
          <VIcon v-if="showIconButtonSubmit" start icon="tabler-check" />
          {{ props.textButtonSubmit || "Enviar" }}
        </VBtn>
      </div>
    </div>
  </div>
</template>
