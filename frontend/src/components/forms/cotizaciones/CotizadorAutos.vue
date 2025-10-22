<script setup lang="ts">
// Make sure the file exists at the specified path and extension
import BtnAtras from "@/components/apps/BtnAtras.vue";
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import ManagerCliente from "@/components/forms/clientes/ManagerClientes.vue";
import PropuestaEdit from "@/components/forms/cotizaciones/componentes/autosPropuestaEdit.vue";
import Propuestas from "@/components/forms/cotizaciones/componentes/autosPropuestas.vue";
import PanelEmision from "@/components/forms/cotizaciones/PanelEmision.vue";
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

const step = ref(1);
const companias: any = ref([]);
const estimando: any = ref(false);
const cotizacion: any = ref(null);
const isEstimando: any = ref(false);
const editandoTitular: any = ref(false);
const agregandoCotizaciones: any = ref(false);

// prettier-ignore
const localData: any = ref(props.registro ? { ...props.registro } : {
  configuracion: {
    companias: [],
    titular: {},
    cotizaciones: []
  }
});

const handleStepPrev = () => {
  if (step.value === 1) {
    handleCancelarCotizacion(); // Si estamos en el primer paso, cancelamos la cotización
  } else {
    step.value = step.value - 1; // Regresa al paso anterior
  }
};

const editarTitular = () => {
  editandoTitular.value = !editandoTitular.value;
};

const handleStepNext = (update: boolean = true) => {
  step.value = step.value + 1; // Avanza al siguiente paso
  if (step.value == 3) {
    if (typeof localData.value.configuracion.cotizaciones === "undefined") {
      localData.value.configuracion.cotizaciones = [];
      let tmpID = 1;
      localData.value.configuracion.companias.forEach((item: any) => {
        localData.value.configuracion.cotizaciones.push({
          id: tmpID,
          compania_id: item.compania_id,
          companiaCorto: item.companiaCorto,
          compania: item.compania,
          companias_productos: item.companias_productos,
          ramo: item.ramo,
          ramo_id: item.ramo_id,
          titular: localData.value.configuracion.titular,
          vehiculo: {
            marca: localData.value.configuracion.titular.marca,
            modelo: localData.value.configuracion.titular.modelo,
            anio: localData.value.configuracion.titular.anio,
          },
        });
        tmpID++;
      });
    }

    localData.value.configuracion.cotizaciones.forEach((element: any) => {
      if (typeof element.inicial == "undefined") {
        element.inicial = true; // Asegura que inicial esté definido
      }
      if (typeof element.estimar == "undefined") {
        element.estimar = true; // Asegura que estimar esté definido
      }
    });
  }
  if (update) {
    handleUpdateCotizacion();
  }
};

await function handleGoEmitir() {
  handleStepNext(false);
};

const handleAddCotizacionesEstimadas = async (data: any) => {
  data = data.filter((item: any) => {
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
};

const handleSelectCompania = (item: any) => {
  item = toRaw(item); // Asegúrate de que el item sea un objeto plano

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

  if (!Array.isArray(localData.value.configuracion.seleccionadas)) {
    localData.value.configuracion.seleccionadas = [];
  }
  localData.value.configuracion.seleccionadas = toggleItemInArray(
    localData.value.configuracion.seleccionadas,
    item,
    "id"
  );
};

const handleEditarCotizacion = (data: any) => {
  data = deepToRaw(data); // Asegúrate de que el data sea un objeto plano
  cotizacion.value = deepClone(data); // Asigna la cotización seleccionada para editar
};

const handleInicialSubmit = async (data: any) => {
  localData.value.configuracion.titular = data;
  step.value = 2; // Cambia al siguiente paso
  await handleUpdateCotizacion();
};

const handleActualiarTitular = async (data: any) => {
  const tmp = deepClone(localData.value);

  // Actualiza el titular principal
  Object.assign(tmp.configuracion.titular, data);

  // Actualiza el titular en cada cotización
  tmp.configuracion.cotizaciones.forEach((c: any) => {
    Object.assign(c.titular, data);
  });

  localData.value = deepClone(tmp);
  editandoTitular.value = false;
  await handleUpdateCotizacion();
};

const handleUpdateCotizaciones = async (data: any) => {
  const tmp = deepClone(localData.value);

  // Actualiza el titular principal
  tmp.configuracion.cotizaciones = data;

  localData.value = deepClone(tmp);
  setTimeout(async () => {
    agregandoCotizaciones.value = !agregandoCotizaciones.value;
  }, 10);
  console.log("Actualizando cotizaciones...", deepToRaw(data));
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

const updateCotizacion = async (data: any, editando = false) => {
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

    // prettier-ignore
    toast.success("¡Cotización guardada!", { theme: "dark",});
  } else {
    showErrorMessage({
      title: "Error",
      message: dataResponse.message,
    });
  }
};

const handleCancelarAgregarCotizaciones = async () => {
  agregandoCotizaciones.value = false;
};

const handleGetCompanias = async () => {
  if (companias.value.length == 0) {
    await getCompanias();
  }
  agregandoCotizaciones.value = !agregandoCotizaciones.value;
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
async function handleCotizacionesParaEstimar(arr: any[]) {
  // Verificar si tiene inicial=true Y estimar=true
  // prettier-ignore
  const cumpleCondicion1 = await searchKeysInArray(arr, [{ key: "estimar", tipoValidacion: "igual", valor: true}], true);

  // Verificar si tiene msgError
  // prettier-ignore
  const cumpleCondicion2 = await searchKeysInArray(arr, [{ key: "msgError"}], true);

  // Retorna true si cumple cualquiera de las dos condiciones
  const resultado = cumpleCondicion1 || !cumpleCondicion2;

  return resultado;
}

const estimarCotizaciones = async (data = null, flujoNormal = false) => {
  estimando.value = true; // Indica que se está estimando

  let localDataEstimacion = data || deepToRaw(localData.value);

  const response = await customRequest({
    url: "/api/cotizaciones/estimar",
    method: "POST",
    data: localDataEstimacion,
  });

  estimando.value = false; // Finaliza la estimación

  const dataResponse = response.data;

  if (dataResponse.result) {
    if (flujoNormal) {
      localData.value.configuracion.cotizaciones = dataResponse.data;
    } else {
      await handleAddCotizacionesEstimadas(dataResponse.data);
      // prettier-ignore
      setTimeout(async () => { await handleUpdateCotizacion(); }, 10);
    }
    localData.value.configuracion.tiempoEstimacion = await getFechaAMPM();
  } else {
    showErrorMessage({
      title: "Error",
      message: dataResponse.message,
    });
  }
};

const handleActualizarCotizacion = async (cotizacionData: any) => {
  cotizacion.value = null;
  // prettier-ignore
  const cotizacionesClon = deepClone( localData.value.configuracion.cotizaciones || []);
  const idx = cotizacionesClon.findIndex(
    (c: any) => c.id === cotizacionData.id
  );
  if (idx !== -1) {
    cotizacionesClon[idx] = cotizacionData;
  }
  // Clona el registro y actualiza las cotizaciones
  const tmpRegistro = deepClone(localData.value);
  tmpRegistro.configuracion.cotizaciones = cotizacionesClon;
  localData.value = deepClone(tmpRegistro);
  await handleUpdateCotizacion();
  // prettier-ignore
  setTimeout(async () => { await estimarCotizaciones(tmpRegistro, true); }, 10);
};

const handleRefreshEstimar = async () => {
  let data = deepToRaw(localData.value);

  data.configuracion.cotizaciones.forEach((c: any) => {
    delete c.numeroCotizacion;
    delete c.archivo;
    delete c.detalles;
  });

  localData.value.configuracion.cotizaciones = data.configuracion.cotizaciones;

  await estimarCotizaciones();
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
    let canEstimar = await handleCotizacionesParaEstimar(deepToRaw(localData.value.configuracion.cotizaciones));
    if (canEstimar == true) {
      // estimarCotizaciones(); // Llama a la función para estimar cotizaciones cuando se llega al paso 3
    }
  }
});
</script>

<template>
  <div>
    <!-- prettier-ignore -->
    <BtnAtras titulo="Volver a cotizaciones" @atras="handleCancelarCotizacion" />
    <h1 class="module-title">Cotizador de Seguros de Autos</h1>
    <div v-if="editandoTitular">
      <div class="card cardForm mx-auto mt-3">
        <h2 class="w-full mb-5">Información del cliente:</h2>
        <ManagerCliente
          :registro="localData.configuracion.titular"
          tipo="nuevo"
          form="updateCliente"
          @export="handleActualiarTitular"
          @cancelar="editarTitular"
        />
      </div>
    </div>
    <div v-else>
      <!-- Preguntas iniciales -->
      <!-- Informacion del cliente -->
      <div v-if="step == 1">
        <div class="card cardForm mx-auto mt-3">
          <h2 class="w-full mb-5">Información del cliente:</h2>
          <ManagerCliente
            @export="handleInicialSubmit"
            form="clienteCotizacion"
          />
        </div>
      </div>
      <!-- Selección de compañias -->
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
        <div class="d-flex justify-space-between w-100 mt-5">
          <div>
            <VBtn color="dark" variant="outlined" @click="handleStepPrev">
              Anterior
            </VBtn>
          </div>
          <div><VBtn @click="handleStepNext"> Siguiente </VBtn></div>
        </div>
      </div>
      <!-- Selección de estimaciones -->
      <div v-if="step == 3">
        <div v-if="!cotizacion">
          <div>
            <VBtn
              color="dark"
              variant="outlined"
              @click="handleRefreshEstimar"
              class="mr-4"
            >
              Refrescar estimación
            </VBtn>

            <!-- prettier-ignore -->
            <VBtn
            color="dark"
            variant="outlined"
            @click=" () => { console.log(deepToRaw(localData)); } "
          >
            Print cotizaciones
          </VBtn>
          </div>
          <div>
            <div class="card cardForm mx-auto mt-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <h2 class="mb-0">Detalles del titular:</h2>

                <i
                  class="fa fa-pencil font22 icono-accion text-warning"
                  aria-hidden="true"
                  title="Editar"
                  @click="editarTitular()"
                />
              </div>

              <!-- prettier-ignore -->
              <div class="">
              <span class="detalle-key font18 fontBold detalleKeyW100 text-left ">Nombre:</span>
              <span class="font24 ">{{ localData.configuracion.titular.nombre + " " + localData.configuracion.titular.segundoNombre + " " + localData.configuracion.titular.apellidoPaterno + " " + localData.configuracion.titular.apellidoMaterno }}</span>
            </div>

              <!-- prettier-ignore -->
              <div class="wFull">
                <p v-if="localData.configuracion.tiempoEstimacion" class="p-0 m-0 w-full text-right textSecondary fontItalic">Ultima actualización:  <span class="fontBold">{{ localData.configuracion.tiempoEstimacion }}</span></p>
              </div>
            </div>
          </div>
          <div v-if="estimando">
            <h1 class="wFull text-center mt-5">Estimando cotizaciones...</h1>
          </div>
          <div v-else>
            <div class="divRows mt-3">
              <Propuestas
                class="w-100"
                :companias="companias"
                :configuracion="localData.configuracion"
                @editar="handleEditarCotizacion"
                @cancelar="handleCancelarAgregarCotizaciones"
                @actualizar="handleUpdateCotizaciones"
                @getCompanias="handleGetCompanias"
                @seleccionar="handleSelectCotizacion"
              />
            </div>

            <!-- prettier-ignore -->
            <div v-if="!agregandoCotizaciones" class="d-flex justify-space-between w-100 mt-5">
              <div>
                <!-- <VBtn color="dark" variant="outlined" @click="handleStepPrev">
                Anterior
              </VBtn> -->
              </div>
              <div>
                <!-- prettier-ignore -->
                <VBtn
                  :disabled=" !(localData.configuracion.seleccionadas || []).length "
                  @click="handleStepNext"
                >
                  Siguiente
                </VBtn>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <PropuestaEdit
            :registro="localData"
            :cotizacion="cotizacion"
            @cancelar="() => (cotizacion = null)"
            @actualizar="handleActualizarCotizacion"
          />
        </div>
      </div>
      <!-- Emision de cotizaciones -->
      <div v-if="step == 4">
        <PanelEmision
          :registro="localData.configuracion.seleccionadas[0]"
          @cancelar="handleCancelarCotizacion"
        />
      </div>
    </div>
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
