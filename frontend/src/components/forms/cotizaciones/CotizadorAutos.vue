<script setup lang="ts">
// Make sure the file exists at the specified path and extension
import BtnAtras from "@/components/apps/BtnAtras.vue";
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import Propuestas from "@/components/forms/cotizaciones/componentes/autosPropuestas.vue";
import { deepToRaw, isItemSelected, toggleItemInArray } from "@/utils/helper";
import { toast } from "vue3-toastify";

const emit = defineEmits(["cancelar"]);

const props = withDefaults(
  defineProps<{
    registro: any;
  }>(),
  {
    registro: null,
  }
);

const handleCancelarCotizacion = () => {
  emit("cancelar");
};

// prettier-ignore
const schemaInicial : any = [
  {
    label: "Nombre",
    type: "text",
    model: "nombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Segundo nombre",
    type: "text",
    model: "segundoNombre",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido paterno",
    type: "text",
    model: "apellidoPaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Apellido materno",
    type: "text",
    model: "apellidoMaterno",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Fecha de nacimiento",
    type: "date",
    model: "fechaNacimiento",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
  },
  {
    label: "Sexo",
    type: "select",
    model: "sexo",
    classElement: " col-sm-12 col-md-6  col-lg-4 ",
      options: [
      {label:"Hombre",id:"Hombre"},
      {label:"Mujer",id:"Mujer"}
    ]
  },
  {
    label: "Telefono",
    type: "text",
    model: "telefono",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Correo electronico",
    type: "text",
    model: "correo",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Datos del auto",
    type: "separador",
    classElement: " col-12 ",
  },
  {
    label: "Marca",
    type: "text",
    model: "marca",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Modelo",
    type: "text",
    model: "modelo",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Año",
    type: "text",
    model: "anio",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
  {
    label: "Version",
    type: "text",
    model: "version",
    classElement: " col-sm-12 col-md-6  col-lg-3 ",
  },
];

const step = ref(1);
const companias: any = ref([]);
const cotizaciones: any = ref([]);
const isEstimadas: any = ref([]);
const estimaciones: any = ref({});

// prettier-ignore
const localData: any = ref(props.registro ? { ...props.registro } : { companias: [], titular: {} });

const handleStepPrev = () => {
  if (step.value === 1) {
    handleCancelarCotizacion(); // Si estamos en el primer paso, cancelamos la cotización
  } else {
    step.value = step.value - 1; // Regresa al paso anterior
  }
};

const handleStepNext = () => {
  step.value = step.value + 1; // Avanza al siguiente paso
  handleUpdateCotizacion();
};

const handleAddCotizacionesEstimadas = async (data: any) => {
  console.log("handleAddCotizacionesEstimadas", data);
  data = data.filter((item: any) => {
    console.log("item", item);
    const idx = localData.value.configuracion.cotizaciones.findIndex(
      (c: any) => c.id === item.id
    );
    if (idx !== -1) {
      // Si existe, reemplaza la cotización
      localData.value.configuracion.cotizaciones[idx] = item;
      return false; // Elimínala del array data
    }
    localData.value.configuracion.cotizaciones.push(item);
  });

  localData.value.configuracion.cotizaciones.push(...data);
  console.log(
    "handleAddCotizacionesEstimadas",
    localData.value.configuracion.cotizaciones
  );
  // await handleUpdateCotizacion();
};

const handleSelectCompania = (item: any) => {
  item = toRaw(item); // Asegúrate de que el item sea un objeto plano
  console.log("handleSelectCompania", item);
  if (!Array.isArray(localData.value.configuracion.companias)) {
    localData.value.configuracion.companias = [];
  }
  localData.value.configuracion.companias = toggleItemInArray(
    localData.value.configuracion.companias,
    item,
    "compania_id"
  );
};

const handleSelectCotizacion = (item: any) => {
  item = toRaw(item); // Asegúrate de que el item sea un objeto plano
  console.log("handleSelectCotizacion", item);
  if (!Array.isArray(localData.value.configuracion.cotizacion)) {
    localData.value.configuracion.cotizacion = [];
  }
  localData.value.configuracion.cotizacion = toggleItemInArray(
    localData.value.configuracion.cotizacion,
    item,
    "id"
  );
};

const handleInicialSubmit = async () => {
  if (!localData.value.configuracion.titular) {
    showErrorMessage({
      title: "Error",
      message: "Por favor, completa la información del cliente.",
    });
    return;
  }
  step.value = 2; // Cambia al siguiente paso
  await handleUpdateCotizacion();
};

const getCompanias = async () => {
  let url = "/api/wizard/cotizacion/companias";
  let response = await customRequest({
    url: url,
    method: "POST",
    data: {
      ramo: 3,
    },
  });
  if (response.data.result) {
    let tmp: any = [];
    response.data.data.forEach((item: any) => {
      tmp.push({
        compania_id: item.id,
        companiaCorto: item.nombreCorto,
        compania: item.nombre,
        companias_productos: item.companias_productos,
        ramo: localData.value.ramo,
        ramo_id: localData.value.ramo_id,
      });
    });
    companias.value = tmp;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
};

const handleUpdateCotizacion = async () => {
  let localDataRaw = deepToRaw(localData.value);

  // prettier-ignore
  let nombreCompleto = (localDataRaw?.configuracion?.titular.nombre ?? "") + " " + (localDataRaw?.configuracion?.titular.segundoNombre ?? "") + " " + (localDataRaw?.configuracion?.titular.apellidoPaterno ?? "") + " " + (localDataRaw?.configuracion?.titular.apellidoMaterno ?? "")

  // prettier-ignore
  let tmp = {
    ...localDataRaw,
    nombre: nombreCompleto,
    configuracion: {
      ...localDataRaw.configuracion,
      companias : localDataRaw?.configuracion?.companias ?? [],
      step: step.value,
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
      localData.value.id = dataResponse.data;
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

const handleFiltrandoCotizacionesPorCompania = async () => {
  // IDs de compañías seleccionadas
  const companiasIds = localData.value.configuracion.companias.map(
    (c: any) => c.compania_id
  );

  // Cotizaciones actuales
  let cotizacionesActuales = localData.value.configuracion.cotizaciones || [];

  // Filtra las cotizaciones que siguen seleccionadas
  let cotizacionesFiltradas = cotizacionesActuales.filter((c: any) =>
    companiasIds.includes(c.compania_id)
  );

  // Encuentra el id más alto actual
  let maxId = 0;
  if (cotizacionesFiltradas.length > 0) {
    maxId = Math.max(
      ...cotizacionesFiltradas.map((c: any) => Number(c.id) || 0)
    );
  }

  // Agrega nuevas cotizaciones para compañías seleccionadas que no están en cotizacionesFiltradas
  localData.value.configuracion.companias.forEach((compania: any) => {
    // prettier-ignore
    if ( !cotizacionesFiltradas.some((c: any) => c.compania_id === compania.compania_id ) ) {
      maxId++;
      cotizacionesFiltradas.push({
        id: maxId,
        ...compania,
        titular: localData.value.configuracion.titular,
      });
    }
  });

  // Actualiza el array final
  localData.value.configuracion.cotizaciones = cotizacionesFiltradas;
};

// prettier-ignore
async function handleCotizacionesEstimadas(arr: any) {
  let tmp = await searchKeysInArray(arr, [{ key: "numeroCotizacion", tipoValidacion: "existe" }]);
  return tmp;
}

// prettier-ignore
async function handleCotizacionesParaEstimar(arr: any[]) {
  let tmp = await searchKeysInArray(arr, [
    { key: "numeroCotizacion"},
    { key: "detalles"},
  ], true);
  return !tmp
}

const estimarCotizaciones = async () => {
  const response = await customRequest({
    url: "/api/cotizaciones/estimar",
    method: "POST",
    data: localData.value,
  });

  const dataResponse = response.data;

  if (dataResponse.result) {
    await handleAddCotizacionesEstimadas(dataResponse.data);
    localData.value.configuracion.tiempoEstimacion = await getFechaAMPM();
    handleUpdateCotizacion(); // Actualiza la cotización después de estimar
    await handleCotizacionesEstimadas(localData.configuracion.companias);
  } else {
    showErrorMessage({
      title: "Error",
      message: dataResponse.message,
    });
  }
};

onMounted(async () => {
  if (props.registro) {
    localData.value = { ...props.registro };
  }

  step.value = localData.value?.configuracion?.step ?? 1;

  if (step.value === 1) {
    await getCompanias();
  }
});

watch(step, async (nuevoValor, valorAnterior) => {
  if (nuevoValor === 3) {
    await handleFiltrandoCotizacionesPorCompania();
    // prettier-ignore
    let canEstimar = await handleCotizacionesParaEstimar( localData.value.configuracion.cotizaciones );
    if (canEstimar) {
      estimarCotizaciones(); // Llama a la función para estimar cotizaciones cuando se llega al paso 3
    }
  }
});
</script>

<template>
  <div>
    <pre>{{ step }}</pre>
    <!-- prettier-ignore -->
    <BtnAtras titulo="Volver a cotizaciones" @atras="handleCancelarCotizacion" />
    <h1 class="module-title">Cotizador de Seguros de Autos</h1>
    <!-- Preguntas iniciales -->
    <div v-if="step == 1">
      <div class="card cardForm mx-auto mt-3">
        <h2 class="w-full mb-5">Información del cliente:</h2>
        <FormFactory
          :schema="schemaInicial"
          :formLive="true"
          :modelValue="localData.configuracion.titular"
          @update:modelValue="(val) => (localData.configuracion.titular = val)"
          :textButtonSubmit="'Empezar cotización'"
          :showIconButtonSubmit="false"
          :showIconButtonCancel="false"
          @submit="handleInicialSubmit"
          @cancel="handleCancelarCotizacion"
        />
      </div>
    </div>
    <div v-if="step == 2">
      <h2 class="title wFull text-center">Selecciona las compañias</h2>
      <div class="divRows mt-3">
        <!-- prettier-ignore -->
        <div
            v-for="item in companias"
            :key="item"
            class="mb-5 card cardCompania"
            @click="handleSelectCompania(item)"
            :class="{ ' activeItem ': isItemSelected(localData.configuracion.companias, item, 'compania_id') }"
        >
          <!-- prettier-ignore -->
          <p class="p-0 m-0 fontBold"> {{ item.companiaCorto }} </p>
        </div>
      </div>
      <div class="d-flex justify-between w-full mt-5">
        <div>
          <VBtn color="dark" variant="outlined" @click="handleStepPrev">
            Anterior
          </VBtn>
        </div>
        <div><VBtn @click="handleStepNext"> Siguiente </VBtn></div>
      </div>
    </div>
    <div v-if="step == 3">
      <h2 class="title wFull text-center">Estimando cotizaciones</h2>
      <div class="divRows mt-3">
        <Propuestas
          :configuracion="localData.configuracion"
          @seleccionar="handleSelectCotizacion"
        />
      </div>
      <div class="d-flex justify-between w-full mt-5">
        <div>
          <VBtn color="dark" variant="outlined" @click="handleStepPrev">
            Anterior
          </VBtn>
        </div>
        <div><VBtn @click="handleStepNext"> Siguiente </VBtn></div>
      </div>
    </div>
    <div v-if="step == 4">
      <h2 class="title wFull text-center">Estimando cotizaciones</h2>
      <div class="divRows mt-3">
        <Propuestas
          :configuracion="localData.configuracion"
          @seleccionar="handleSelectCotizacion"
        />
      </div>
      <div class="d-flex justify-between w-full mt-5">
        <div>
          <VBtn color="dark" variant="outlined" @click="handleStepPrev">
            Anterior
          </VBtn>
        </div>
        <div><VBtn @click="handleStepNext"> Siguiente </VBtn></div>
      </div>
    </div>

    <pre>{{ localData }}</pre>
  </div>
</template>

<style scoped lang="scss">
.divRows {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  margin-left: auto !important;
  margin-right: auto !important;
}
.cardCompania {
  text-align: center !important;
  min-width: 100px !important;
}
</style>
