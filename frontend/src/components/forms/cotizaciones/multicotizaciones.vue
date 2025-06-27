<script setup lang="ts">
import FormFactory from "@/components/apps/FormFactory.vue";
import {
  showDeleteItem,
  showErrorMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
import CotizacionPlanSeguro from "@/components/forms/cotizaciones/cotizacionPlanSeguro.vue";
import { customRequest } from "@/utils/axiosInstance";
import { toast } from "vue3-toastify";

const emit = defineEmits(["cotizar", "cancelar"]);

const props = withDefaults(
  defineProps<{
    registro: any;
  }>(),
  {
    registro: null,
  }
);

const localData: any = ref(props.registro ? { ...props.registro } : {});
const productoSeleccionado: any = ref(null);
const modoEditarEntrevistas = ref(false);
const configuracion: any = ref({}); // Referencia al componente FormFactory
const updateWatch = ref(false); // Referencia al componente FormFactory
const companias: any = ref([]); // Referencia al componente FormFactory
const productos: any = ref([]); // Referencia al componente FormFactory
const ramos: any = ref(null); // Referencia al componente FormFactory
const step: any = ref(0); // Referencia al componente FormFactory

const optionsSexo = [
  { value: true, label: "Masculino" },
  { value: false, label: "Femenino" },
];

const configuracionDefault: any = ref({
  ramo: null,
  companias: [],
  productos: [],
});

// prettier-ignore
const schemaInicial = [
  {
    label: "Nombre",
    type: "text",
    model: "nombre",
    classElement: " wFull"
  },
  {
    label: "Fecha de nacimiento",
    type: "date",
    model: "fechaNacimiento",
    classElement: " wFull"
  },
  {
    label: "Sexo",
    type: "select",
    model: "sexo",
    classElement: " wFull",
      options: [
      {label:"Hombre",id:"Hombre"},
      {label:"Mujer",id:"Mujer"}
    ]
  }
];

async function getRamos() {
  let url = "/api/catalogos/ramos";
  let response = await customRequest({
    url: url,
    method: "POST",
  });
  if (response.data.result) {
    ramos.value = response.data.data;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

async function getCompanias() {
  let url = "/api/wizard/cotizacion/companias";
  let response = await customRequest({
    url: url,
    method: "POST",
    data: {
      ramo: configuracion.value.ramo.id,
    },
  });
  if (response.data.result) {
    const dataResponse = toRaw(response.data.data).map((compania: any) => {
      // Si tiene productos, mapea cada producto
      if (Array.isArray(compania.companias_productos)) {
        compania.companias_productos = compania.companias_productos.map(
          (producto: any) => {
            producto.titular = configuracion.value.titular;
            producto.nombre_producto = producto.nombre;
            delete producto.nombre;
            return producto;
          }
        );
      }
      return compania;
    });
    companias.value = dataResponse;
    console.log("Companias response:", toRaw(dataResponse));
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

function selectRamo(ramo: any) {
  configuracion.value.ramo = ramo;
  step.value = 2;
  getCompanias();
}

function selectProducto(valor: any, producto: any) {
  if (valor) {
    // Si el checkbox está marcado, agrega el producto a la lista
    configuracion.value.productos.push({ ...producto, isTerminado: false });
  } else {
    // Si el checkbox está desmarcado, elimina el producto de la lista
    configuracion.value.productos = configuracion.value.productos.filter(
      (p: any) => p.id !== producto.id
    );
  }
}

function goToSeleccionarProducto() {
  step.value = 3;
  handleUpdateConfiguracion();
}

function isCompaniaSelected(compania: any) {
  return configuracion.value.companias.some((c: any) => c.id === compania.id);
}

function isProductoSeleccionado(producto: any) {
  return (
    productoSeleccionado.value && productoSeleccionado.value.id === producto.id
  );
}

function nextStep() {
  step.value = step.value + 1;
  productoSeleccionado.value = configuracion.value.productos[0];
}

function sendToCotizar() {
  emit("cotizar", configuracion.value);
}

function selectCompania(compania: any) {
  const index = isCompaniaSelected(compania);
  if (index) {
    // Si existe, elimínala
    configuracion.value.companias = configuracion.value.companias.filter(
      (c: any) => c.id !== compania.id
    );
  } else {
    // Si no existe, agrégala
    configuracion.value.companias.push(compania);
  }
}

const todosProductosTerminados = computed(() => {
  return (
    Array.isArray(configuracion.value.productos) &&
    configuracion.value.productos.length > 0 &&
    configuracion.value.productos.every((p: any) => p.isTerminado === true)
  );
});

async function handleUpdateConfiguracion() {
  let tmp = {
    ...localData.value,
    configuracion: {
      ...configuracion.value,
      step: step.value,
    },
  };
  await updateCotizacion(tmp);
}

function handleModoEditarEntrevistas() {
  modoEditarEntrevistas.value = !modoEditarEntrevistas.value;
}

async function handleTerminarEntrevista(data: any) {
  // Si data es un ref, obtén el valor real
  const realData = data.value ? data.value : data;
  // O mejor aún:
  const rawData = toRaw(realData);
  console.log("Datos de la entrevista:", { ...rawData });
  // Busca el índice del producto
  const idx = configuracion.value.productos.findIndex(
    (p: any) => p.id == rawData.id
  );
  if (idx !== -1) {
    // Reemplaza el objeto para asegurar reactividad
    configuracion.value.productos[idx] = {
      ...configuracion.value.productos[idx],
      ...rawData,
      isTerminado: true,
    };
  }

  handleUpdateConfiguracion();
}

function resetCotizacion() {
  configuracion.value = {
    titular: {
      nombre: props.registro.nombre,
      fechaNacimiento: props.registro.fechaNacimiento,
      sexo: props.registro.sexo,
    },
    ramo: null,
    companias: [],
    productos: [],
  };
  step.value = 1;
  handleUpdateConfiguracion();
}

const handleInicialSubmit = async (data: any) => {
  console.log("Datos iniciales:", { ...data });
  step.value = 1;
  let tmp = {
    ...props.registro,
    nombre: data.nombre,
    fechaNacimiento: data.fechaNacimiento,
    configuracion: {
      step: step.value,
      ...data,
    },
  };
  await updateCotizacion(tmp);
};

const updateCotizacion = async (data: any) => {
  const response = await customRequest({
    url: "/api/cotizaciones/update",
    method: "POST",
    data: data,
  });
  const dataResponse = response.data;

  if (dataResponse.result) {
    if (localData.value.id == undefined) {
      console.log("Creando nueva cotización");
      localData.value.id = dataResponse.data;
      configuracion.value.titular = {
        nombre: configuracion.value.nombre,
        fechaNacimiento: configuracion.value.fechaNacimiento,
        sexo: configuracion.value.sexo,
      };
    }
    toast.success("¡Cotización guardada!", {
      theme: "dark", // Activa el tema oscuro
    });
  } else {
    showErrorMessage({
      title: "Error",
      message: dataResponse.message,
    });
  }
};

const handleInicialCancel = () => {
  emit("cancelar");
};

const handleAtras = () => {
  emit("cancelar");
};

function confirmarEliminarProducto(item: any, index: number) {
  showDeleteItem({
    title: "¿Estás seguro de eliminar este registro?",
    message: "Esta acción no se puede deshacer.",
    confirmText: "Sí, eliminar",
    cancelText: "Cancelar",
    onConfirm: () => {
      if (configuracion.value.productos.length == 1) {
        resetCotizacion();
      } else {
        configuracion.value.productos.splice(index, 1);
        productoSeleccionado.value = null;

        if (configuracion.value.productos.length > 0) {
          productoSeleccionado.value = configuracion.value.productos[0];
        }

        handleUpdateConfiguracion();
        modoEditarEntrevistas.value = false; // Salir del modo edición

        if (configuracion.value.productos.length == 0) {
          resetCotizacion();
          modoEditarEntrevistas.value = false; // Salir del modo edición
        }
      }
    },
    onCancel: () => {},
  });
}

function handleSeleccionProducto(item: any) {
  if (modoEditarEntrevistas.value) {
    // Si estamos en modo edición, confirmamos la eliminación
    confirmarEliminarProducto(
      item,
      configuracion.value.productos.indexOf(item)
    );
  } else {
    // Si no estamos en modo edición, seleccionamos el producto
    productoSeleccionado.value = item;
  }
}

onMounted(() => {
  getRamos();
  if (props.registro) {
    configuracion.value = {
      ...configuracionDefault.value,
      ...props.registro.configuracion,
    };
    step.value = props.registro.configuracion?.step || 0;
  } else {
    configuracion.value = { ...configuracionDefault.value };
  }
  console.log("Configuración inicial:", { ...configuracion.value });
  if (step.value > 0 && configuracion.value.titular == undefined) {
    configuracion.value.titular = {
      nombre: configuracion.value.nombre,
      fechaNacimiento: configuracion.value.fechaNacimiento,
      sexo: configuracion.value.sexo,
    };
  }
  if (
    configuracion.value.productos != undefined &&
    configuracion.value.productos.length > 0
  ) {
    productoSeleccionado.value = configuracion.value.productos[0];
  }

  if (step.value == 2) {
    getCompanias();
  }
  setTimeout(() => {
    updateWatch.value = true;
  }, 100);
});

watch(
  () => step.value,
  async (newRamo) => {
    if (newRamo > 1 && updateWatch.value == true) {
      let tmp = {
        ...localData.value,
        configuracion: {
          ...configuracion.value,
          step: step.value,
        },
      };
      localData.value = tmp;
      console.log("Actualizando cotización:", step.value);
      setTimeout(() => {
        updateWatch.value = false;
      }, 1);
      await updateCotizacion(tmp);
    }
  }
);
</script>

<style scoped lang="scss">
.icon-bold svg {
  filter: drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff);
}
.badge {
  position: absolute;
  top: -0.5em;
  right: -0.5em;
  display: inline-block;
  background: #4e9f6e;
  color: #fff;
  border-radius: 1rem;
  padding: 0.2em 0.7em;
  font-size: 0.9em;
  font-weight: bolder;
  margin-top: 0;
}
.divItems {
  display: flex;
  gap: 2rem;
  width: fit-content;
  margin-left: auto !important;
  margin-right: auto !important;
}
.divRows {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}
.divCards {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}
.divColumns {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: fit-content;
  margin-left: auto !important;
  margin-right: auto !important;
}

.divButtons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-top: 15px !important ;
}

.divPlanItem {
  position: relative; // Añade esto
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  align-items: center;
  width: fit-content;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
}

.disabledItem {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(0.7);
  cursor: not-allowed;
}

.activeItem {
  // background-color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
  border-width: 2px;
  box-shadow: 0 0 5px rgb(var(--v-theme-primary));
}
.titleSeparator {
  border-bottom: 1px solid rgb(var(--v-theme-primary)) !important;
  font-size: 1.2rem !important;
  text-align: center !important;
  padding-bottom: 5px !important;
  margin-top: 16px !important;
  margin-bottom: 10px !important;
  font-weight: bolder !important;
  line-height: 1.375rem;
  letter-spacing: normal !important;
  text-transform: none !important;
}

.cardActive {
  border: 2px solid rgb(var(--v-theme-primary));
}

.cardProductos {
  width: 400px !important;
}

.cardForm {
  width: 600px !important;
}

.cardEntrevista {
  width: 100% !important;
}

.card {
  padding: 16px !important;
  border-radius: 10px !important;
  background-color: white !important;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1) !important;
}

.p0 {
  padding: 0 !important;
}

.m0 {
  margin: 0 !important;
}

.fontBold {
  font-weight: bolder !important;
}
</style>

<template>
  <pre>Step: {{ step }}</pre>
  <!-- <pre>{{ configuracion.productos }}</pre> -->
  <div class="d-flex justify-start align-center mb-5">
    <VBtn
      icon="tabler-arrow-left"
      class="cursor-pointer"
      variant="text"
      color="secondary"
      @click="handleAtras"
    />
  </div>
  <!-- Preguntas iniciales -->
  <div v-if="step == 0">
    <h2 class="w-full text-center mb-5">Quien realiza la cotización:</h2>
    <div class="card cardForm mx-auto">
      <FormFactory
        :schema="schemaInicial"
        :formLive="true"
        :modelValue="configuracion"
        @update:modelValue="(val) => (configuracion = val)"
        :textButtonSubmit="'Empezar cotización'"
        :showIconButtonSubmit="false"
        :showIconButtonCancel="false"
        @submit="handleInicialSubmit"
        @cancel="handleInicialCancel"
      />
    </div>
  </div>
  <!-- Selector de Ramo -->
  <div v-if="step == 1">
    <h2 class="w-full text-center mb-5">Selecciona un ramo:</h2>
    <div class="divItems">
      <div
        class="divPlanItem"
        v-for="(ramo, index) in ramos"
        @click="() => selectRamo(ramo)"
      >
        <h4 class="">{{ ramo.label }}</h4>
      </div>
    </div>
  </div>
  <!-- Selector de compañias -->
  <div v-if="step == 2">
    <h2 class="w-full text-center mb-5">Selecciona una o varias compañias:</h2>
    <div class="divItems" v-if="companias.length > 0">
      <div
        class="divPlanItem"
        :class="[
          item.companias_productos.length == 0 ? 'disabledItem' : '',
          isCompaniaSelected(item) ? 'activeItem' : '',
        ]"
        v-for="(item, index) in companias"
        @click="() => selectCompania(item)"
      >
        <h4 class="titleSeparator">{{ item.nombre }}</h4>

        <span v-if="item.companias_productos.length" class="badge">
          {{ item.companias_productos.length }}
        </span>
      </div>
    </div>
    <div v-else>
      <h4 class="text-center">No hay compañias disponibles</h4>
    </div>
    <!-- prettier-ignore -->
    <div class="divButtons">
      <VBtn variant="outlined" color="secondary" @click="resetCotizacion"> Cancelar </VBtn>
      <VBtn :disabled="!configuracion.companias.length" @click="goToSeleccionarProducto" >Continuar</VBtn>
    </div>
  </div>
  <!-- Selector de productos -->
  <div v-if="step == 3">
    <h2 class="w-full text-center mb-5">Selecciona uno o varios productos:</h2>
    <div class="divItems">
      <!-- prettier-ignore -->
      <div class="card cardProductos" v-for="(compania, index) in configuracion.companias">
        <p class="titleSeparator">{{ compania.nombreCorto }}</p>
        <template v-for="(item, i) in compania.companias_productos">
          <!-- v-model="" -->
          <VCheckbox
            :label="item.nombre_producto"
            true-icon="tabler-checkbox"
            false-icon="tabler-square"
            color="primary"
            v-model="item.selected"
            @update:model-value="(val) => selectProducto(val, item)"
          />
        </template>
      </div>
    </div>
    <!-- prettier-ignore -->
    <div class="divButtons">
      <VBtn variant="outlined" color="secondary" @click="resetCotizacion" >Cancelar</VBtn>
      <VBtn :disabled="!configuracion.productos.length" @click="nextStep" >Continuar</VBtn>
    </div>
  </div>
  <!-- Selector de entrevistas -->
  <div v-if="step == 4">
    <div>
      <!-- Icono de editar/eliminar -->
      <div class="w-full d-flex justify-between align-center">
        <div></div>
        <h2 class="w-full text-center">Entrevista de cotizacion:</h2>
        <div>
          <span
            v-if="!modoEditarEntrevistas"
            class="icon-action"
            @click="handleModoEditarEntrevistas"
          >
            <VIcon icon="tabler-edit" color="error" size="20" />
          </span>
          <span
            v-if="modoEditarEntrevistas"
            class="icon-action"
            @click="handleModoEditarEntrevistas"
            title="Cancelar edición"
          >
            <VIcon icon="tabler-x" color="primary" size="20" />
          </span>
        </div>
      </div>

      <h3
        v-if="modoEditarEntrevistas"
        class="w-full text-center my-2 textDanger"
      >
        Da clic en las entrevistas para eliminar:
      </h3>
    </div>
    <div class="divRows mt-3">
      <div
        v-for="(item, index) in configuracion.productos"
        :key="item.id"
        class="mb-5 card"
        @click="handleSeleccionProducto(item)"
        :class="[isProductoSeleccionado(item) ? 'cardActive' : '']"
        style="position: relative"
      >
        <p class="p0 m0 fontBold">
          {{ item.nombre_producto }}
        </p>
        <span v-if="item.isTerminado && !modoEditarEntrevistas" class="badge">
          <VIcon icon="tabler-check" size="18" />
        </span>
      </div>
    </div>
    <div class="divCards" v-if="!modoEditarEntrevistas">
      <div class="cardEntrevista card" v-if="productoSeleccionado">
        <h5 class="titleSeparator">
          {{ productoSeleccionado.nombre_producto }}
        </h5>
        <CotizacionPlanSeguro
          :registro="productoSeleccionado"
          class="wFull"
          @terminar="handleTerminarEntrevista"
        />
      </div>
    </div>
    <!-- prettier-ignore -->
    <div class="divButtons">
      <VBtn variant="outlined" color="secondary" @click="resetCotizacion"> Atrás</VBtn>
      <VBtn :disabled="!configuracion.productos.length" v-if="step != 4 || todosProductosTerminados" @click="sendToCotizar">Siguiente</VBtn>
    </div>
  </div>

  <!-- <pre>{{ localData }}</pre> -->
  <!-- <pre>{{ configuracion }}</pre> -->
  <!-- <pre>{{ configuracion }}</pre> -->
</template>
