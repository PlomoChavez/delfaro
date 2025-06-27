<script setup lang="ts">
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { showInfoMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { customRequest } from "@/utils/axiosInstance";
const emit = defineEmits(["terminar"]);

import { onMounted, ref } from "vue";
const props = withDefaults(
  defineProps<{
    registro: any;
  }>(),
  {
    registro: null,
  }
);
const cotizacion: any = ref({});
const isEditando = ref(false);
const newAsegurado: any = ref(null);
const formTitular: any = ref({});
const tmp: any = ref([]);
const formTmpSchema: any = ref([]);
const formTmp: any = ref(null);
const formTmpValores: any = ref({});
const step = ref(1);

// prettier-ignore
const formSchema: any = [
  { label: "Nombre", type: "text", model: "nombre"},
  { label: "Sexo", type: "select", model: "sexo", options: [{label:"Hombre",id:"Hombre"},{label:"Mujer",id:"Mujer"}]},
  { label: "Fecha Nacimiento", type: "date", model: "fechaNacimiento"},
  { label: "Localidad", type: "select", model: "localidad", catalogo:"estados"},
];
// prettier-ignore
const formSchemaPersona: any = [
  { label: "Nombre", type: "text", model: "nombre"},
  { label: "Sexo", type: "select", model: "sexo", options: [{label:"Hombre",id:"Hombre"},{label:"Mujer",id:"Mujer"}]},
  { label: "Fecha Nacimiento", type: "date", model: "fechaNacimiento"},
];

const planes = ref([
  { label: "Plan Seguro Óptimo Plus" },
  { label: "Plan Seguro Óptimo" },
  { label: "Plan Seguro Avanzado" },
  { label: "Plan Seguro Intermedio" },
  { label: "Plan Seguro Esencial" },
  { label: "Plan Seguro Primer Nivel" },
]);

function editarAsegurado(index: number) {
  newAsegurado.value = { ...cotizacion.value.asegurados[index] };
}

function eliminarAsegurado(index: number) {
  cotizacion.value.asegurados.splice(index, 1);
}

// prettier-ignore
const formSchemaPersonalizacion2: any = [
  { label: "Emergencia en el Extranjero (EMER)", type: "switch", model: "emergenciaExtranjero",},
  { label: "SumaAsegurada",                 type: "select", model: "sumaAsegurada",
    options: [
      { label:"S.A. 50,000 dls",id:"S.A. 50,000 dls"},
      { label:"S.A. 100,000 dls",id:"S.A. 100,000 dls"},
    ]
  },
  { label: "Cobertura en el Extranjero (CE)", type: "switch", model: "coberturaExtranjero"},
  { label: "Atención Dental", type: "switch", model: "atencionDental"},
  { label: "Cobertura Dental",                 type: "select", model: "atencionDentalSelect",
    options: [
      { label:"Atención Dental +",id:"Atención Dental +"},
      { label:"Atención Dental Total",id:"Atención Dental Total"},
    ]
  },
  { label: "Indemnización Diaria por Hospitalización por Accidente (IDHA)", type: "switch", model: "indemnizacionDiaria"},
  { label: "Suma por dia",                 type: "select", model: "indemnizacionDiariaSelect",
    options: [
      { label:"500.00 por dia",id:"500.00 por dia"},
      { label:"1000.00 por dia",id:"1000.00 por dia"},
      { label:"1,500.00 por dia",id:"1,500.00 por dia"},
      { label:"2,000.00 por dia",id:"502,000.00 por dia"},
    ]
  },
  { label: "Reducción de coaseguro por Padecimiento de Nariz en caso de Accidente.", type: "switch", model: "reduccionCoaseguro"},
  { label: "Eliminación de Deducible por Accidente", type: "switch", model: "eliminacionDeducible"},
];

// prettier-ignore
const formSchemaPersonalizacion1: any = [
  { label: "Suma Asegurada",            type: "select", model: "sumaAsegurada",
    options: [
      { label:"1000 UMAM",id:"1000 UMAM"},
      { label:"1500 UMAM",id:"1500 UMAM"},
      { label:"2000 UMAM",id:"2000 UMAM"},
      { label:"2500 UMAM",id:"2500 UMAM"},
      { label:"3000 UMAM",id:"3000 UMAM"},
      { label:"3500 UMAM",id:"3500 UMAM"},
      { label:"4000 UMAM",id:"4000 UMAM"},
      { label:"7000 UMAM",id:"7000 UMAM"},
      { label:"11000 UMAM",id:"11000 UMAM"},
      { label:"14000 UMAM",id:"14000 UMAM"},
      { label:"20000 UMAM",id:"20000 UMAM"},
      { label:"Sin límites",id:"Sin límites"},
    ]
  },
  { label: "Deducible",                 type: "select", model: "deducible",
    options: [
      { label:"0 UMAM",id:"0 UMAM"},
      { label:"4 UMAM",id:"4 UMAM"},
      { label:"5 UMAM",id:"5 UMAM"},
      { label:"6 UMAM",id:"6 UMAM"},
      { label:"7 UMAM",id:"7 UMAM"},
      { label:"8 UMAM",id:"8 UMAM"},
      { label:"9 UMAM",id:"9 UMAM"},
      { label:"10 UMAM",id:"10 UMAM"},
      { label:"12 UMAM",id:"12 UMAM"},
      { label:"14 UMAM",id:"14 UMAM"},
      { label:"16 UMAM",id:"16 UMAM"},
      { label:"18 UMAM",id:"18 UMAM"},
      { label:"20 UMAM",id:"20 UMAM"},
      { label:"25 UMAM",id:"25 UMAM"},
      { label:"30 UMAM",id:"30 UMAM"},
      { label:"35 UMAM",id:"35 UMAM"},
      { label:"40 UMAM",id:"40 UMAM"},
    ]
  },
  { label: "Coaseguro",                 type: "select", model: "coaseguro",
    options: [
    { label:"0 %",id:"0 %"},
    { label:"10 %",id:"10 %"},
    { label:"15 %",id:"15 %"},
    { label:"20 %",id:"20 %"},
    { label:"25 %",id:"25 %"},
    { label:"30 %",id:"30 %"},
    ]
  },
  { label: "Tope Máximo de Coaseguro",  type: "select", model: "topeMaximo",
    options: [
    { label:"$30,000",id:"$30,000"},
    { label:"$40,000",id:"$40,000"},
    { label:"$50,000",id:"$50,000"},
    ]
  },
  { label: "Nivel Hospitalario",        type: "select", model: "nivelHospitalario",
    options: [
      {label:"Serie 200",id:"Serie 200"},
      {label:"Serie 300",id:"Serie 300"},
      {label:"Serie 400",id:"Serie 400"},
    ]
  },
  { label: "T.H.Q.",                    type: "select", model: "thq",
    options: [
      {label:"24",id:"24"},
      {label:"27",id:"27"},
      {label:"30",id:"30"},
      {label:"33",id:"33"},
      {label:"36",id:"36"},
      {label:"40",id:"40"},
      {label:"50",id:"50"},
      {label:"60",id:"60"},
      {label:"G.U.A.",id:"G.U.A."},
    ]
  },
  { label: "Frecuencia de pago",        type: "select", model: "frecuenciaPago",
    options: [
      {label:"Anual",id:"Anual"},
      {label:"Semestral",id:"Semestral"},
      {label:"Trimestral",id:"Trimestral"},
      {label:"Mensual",id:"Mensual"},
    ]
  },
];

function obtenerFechaHoy(
  sumar: any = { años: 0, meses: 0, días: 0 },
  formato = "dd/mm/aaaa"
): string {
  const hoy = new Date();

  // Sumar años, meses y días
  hoy.setFullYear(hoy.getFullYear() + (sumar.años || 0));
  hoy.setMonth(hoy.getMonth() + (sumar.meses || 0));
  hoy.setDate(hoy.getDate() + (sumar.días || 0));

  // Formatear la fecha
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses empiezan en 0
  const anio = hoy.getFullYear();

  // Retornar según el formato solicitado
  if (formato === "dd/mm/aaaa") {
    return `${dia}/${mes}/${anio}`;
  } else if (formato === "mm/dd/aaaa") {
    return `${mes}/${dia}/${anio}`;
  } else if (formato === "aaaa-mm-dd") {
    return `${anio}-${mes}-${dia}`;
  }

  return `${dia}/${mes}/${anio}`; // Formato por defecto
}

async function handleFormSubmit(data: any) {
  cotizacion.value = {
    ...cotizacion.value,
    titular: data,
  };
  handleNextStep();
}

async function handleNextPersonas() {
  cotizacion.value = {
    ...cotizacion.value,
    personas: tmp.value,
  };
  tmp.value = {
    inicio: obtenerFechaHoy(),
    fin: obtenerFechaHoy({ años: 1 }),
  };
  handleNextStep();
}

async function handleNextPlan() {
  cotizacion.value = {
    ...cotizacion.value,
    ...tmp.value,
  };
  tmp.value = {
    inicio: obtenerFechaHoy(),
    fin: obtenerFechaHoy({ años: 1 }),
  };
  handleNextStep();
}

async function handleFormSubmitPersona(data: any) {
  const asegurados = cotizacion.value.asegurados || [];
  const idx = asegurados.findIndex((a: any) => a.id === data.id);

  if (!data.id) {
    // Si no hay id, asigna el siguiente id incremental
    const maxId =
      asegurados.length > 0
        ? Math.max(...asegurados.map((a: any) => a.id || 0))
        : 0;
    data.id = maxId + 1;
  }

  if (idx !== -1) {
    // Reemplaza el asegurado existente
    cotizacion.value.asegurados = asegurados.map((a: any, i: number) =>
      i === idx ? data : a
    );
  } else {
    // Agrega el nuevo asegurado
    cotizacion.value.asegurados = [...asegurados, data];
  }
  newAsegurado.value = null;
}

async function handleSubmit(data: any) {
  cotizacion.value[formTmp.value] = data;
  formTmp.value = null;
  formTmpValores.value = {};
}

async function terminarCotizacion() {
  emit("terminar", cotizacion);
}

async function handleFormPersonalizacion(tipo: string) {
  switch (tipo) {
    case "parametrosFlexibles":
      formTmpSchema.value = [...formSchemaPersonalizacion1];
      formTmpValores.value = cotizacion.value.parametrosFlexibles || {};
      break;
    case "proteccionAdicional":
      formTmpSchema.value = [...formSchemaPersonalizacion2];
      formTmpValores.value = cotizacion.value.proteccionAdicional || {};
      break;
    case "reconocimientoAntiguedad":
      formTmpSchema.value = [];
      break;

    default:
      break;
  }
  formTmp.value = tipo;
}

async function handleNextStep() {
  step.value = step.value + 1;
}
async function handleTerminarEntrevista() {
  if (
    cotizacion.value.parametrosFlexibles !== undefined &&
    cotizacion.value.proteccionAdicional !== undefined
  ) {
    isEditando.value = false;
  } else {
    showInfoMessage({
      title: "Faltan formularios",
      message:
        "Debes completar los formularios de personalización antes de terminar la entrevista.",
    });
    return;
  }
}

async function handlePrevStep() {
  step.value = step.value - 1;
}

async function sendCotizacion() {
  try {
    const payload = cotizacion.value;

    const response = await customRequest({
      url: "/api/robot",
      method: "POST",
      data: payload,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}
function handleAtras() {
  // emit("atras");
}

onMounted(() => {
  cotizacion.value = props.registro || {};
  console.log("cotizacion", cotizacion.value);
  if (cotizacion.value.asegurados === undefined) {
    cotizacion.value.asegurados = [];
  }
  if (cotizacion.value.titular != undefined) {
    formTitular.value = { ...cotizacion.value.titular };
  }
  isEditando.value = !props.registro.isTerminado || false;
});
</script>

<style scoped lang="scss">
.asegurado-card {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fafbfc;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.04);
}
.asegurado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.asegurado-actions {
  display: flex;
  gap: 0.5rem;
}
.asegurado-info {
  margin-top: 0.5rem;
}
.bgRed {
  background-color: red;
}
.divPlanes {
  display: flex;
  flex-direction: column;
  width: 700px;
  margin-left: auto !important;
  margin-right: auto !important;
}
.w-fit {
  width: fit-content;
}

.divFechas {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 2rem;
}
.divPlanItem {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  align-items: center;
  width: 200px;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
}
</style>

<template>
  <div>
    <div v-if="isEditando">
      <!-- Boton de atras  -->
      <!-- <div class="d-flex justify-start align-center mb-5">
        <VBtn
          icon="tabler-arrow-left"
          class="cursor-pointer"
          variant="text"
          color="secondary"
          @click="handleAtras"
        />
      </div> -->
      <div v-if="step == 1">
        <ModuladorFormFactory
          class="w-full"
          title="Titular"
          :schema="formSchema"
          :formLive="true"
          :modelValue="formTitular"
          :isDialogVisible="false"
          :textButtonSubmit="'Siguiente pregunta'"
          :showIconButtonSubmit="false"
          :showButtonCancel="false"
          @update:modelValue="
            (val) => {
              cotizacion.titular = { ...val };
            }
          "
          @submit="handleFormSubmit"
        />
      </div>
      <div v-if="step == 2">
        <!-- Entrevista -->
        <div v-if="newAsegurado != null">
          <ModuladorFormFactory
            title="Asegurado"
            :schema="formSchemaPersona"
            :textButtonSubmit="'Guardar asegurado'"
            :modelValue="newAsegurado"
            :isDialogVisible="false"
            @cancel="() => (newAsegurado = null)"
            @submit="handleFormSubmitPersona"
          />
        </div>
        <!-- Vista Uno de asegurados -->
        <div v-else>
          <!-- Boton de nuevo -->
          <div class="d-flex justify-end">
            <VBtn color="secondary" @click="() => (newAsegurado = {})">
              Nuevo
              <VIcon start icon="tabler-checkbox" />
            </VBtn>
          </div>
          <!-- Registro de los asegurados -->
          <div v-if="cotizacion.asegurados.length == 0">
            <p class="w-full text-center">No hay asegurados registrados</p>
          </div>
          <div
            v-for="(item, index) in cotizacion.asegurados"
            :key="index"
            class="asegurado-card"
          >
            <div class="asegurado-header">
              <h3>Datos del Asegurado</h3>
              <div class="asegurado-actions">
                <span
                  class="icon-action"
                  @click="editarAsegurado(index)"
                  title="Editar"
                  tabindex="0"
                  role="button"
                >
                  <VIcon icon="tabler-edit" color="warning" size="25" />
                </span>
                <span
                  class="icon-action"
                  @click="eliminarAsegurado(index)"
                  title="Eliminar"
                  tabindex="0"
                  role="button"
                >
                  <VIcon icon="tabler-trash" color="error" size="25" />
                </span>
              </div>
            </div>
            <div class="asegurado-info">
              <p class="p-0 m-0">
                <strong>ID:</strong> {{ item.id }}<br />
                <strong>Nombre:</strong> {{ item.nombre || "Sin nombre" }}<br />
                <strong>Sexo:</strong>
                {{
                  typeof item.sexo === "object"
                    ? item.sexo.label
                    : item.sexo || "Sin especificar"
                }}<br />
                <strong>Fecha de Nacimiento:</strong>
                {{ item.fechaNacimiento || "Sin fecha" }}
              </p>
            </div>
          </div>
          <!-- Botones de redireccion -->
          <div class="d-flex justify-between w-full mt-5">
            <div>
              <VBtn color="dark" variant="outlined" @click="handlePrevStep">
                Anterior
              </VBtn>
            </div>
            <div><VBtn @click="handleNextPlan"> Siguiente </VBtn></div>
          </div>
        </div>
      </div>
      <div v-if="step == 3" class="divPlanes">
        <div class="d-flex justify-center w-full">
          <h3 class="w-full">¿En qué fecha iniciará tu plan de salud?</h3>
        </div>
        <div class="divFechas">
          <div class="w-fit text-center">
            <h3>Inicio de vigencia</h3>
            <p>{{ cotizacion.inicio }}</p>
          </div>
          <div class="w-fit text-center">
            <h3>Fin de Vigencia</h3>
            <p>{{ cotizacion.fin }}</p>
          </div>
        </div>
        <div v-if="cotizacion.plan">
          <h3>Plan Seleccionado</h3>
          <div class="d-flex align-center w-full">
            <span class="icon-action" @click="() => (cotizacion.plan = null)">
              <VIcon icon="tabler-x" class="textDanger" size="20" />
            </span>
            <p class="mb-0">{{ cotizacion.plan.label }}</p>
          </div>
        </div>
        <div v-else>
          <div
            v-for="(item, index) in planes"
            :key="index"
            @click="() => (cotizacion.plan = item)"
          >
            Nombre: {{ item.label }}
          </div>
        </div>
        <div class="d-flex justify-between w-full mt-5">
          <VBtn color="dark" variant="outlined" @click="handlePrevStep">
            Anterior
          </VBtn>
          <VBtn @click="handleNextPlan"> Siguiente </VBtn>
        </div>
      </div>
      <div v-if="step == 4">
        <div v-if="!formTmp" class="d-flex justify-center w-full gap-5">
          <!-- prettier-ignore -->
          <div
            class="divPlanItem"
            :class="{ 'completado': cotizacion.parametrosFlexibles }"
            @click="() => { handleFormPersonalizacion('parametrosFlexibles'); }"
            style="position: relative;"
          >
          <span v-if="cotizacion.parametrosFlexibles" class="text-success font-bold font20"><i class="fa-solid fa-circle-check"></i></span><br>
          <span>Parámetros flexibles</span> 
          </div>
          <!-- prettier-ignore -->
          <div class="divPlanItem" @click="() => { handleFormPersonalizacion('proteccionAdicional'); }" style="position: relative;">
            
            <span v-if="cotizacion.proteccionAdicional" class="text-success font-bold font20"><i class="fa-solid fa-circle-check"></i></span> <br>
          <span>Protección con costo adicional</span>

          </div>
          <!-- prettier-ignore -->
          <!-- <div class="divPlanItem" @click="() => { handleFormPersonalizacion('reconocimientoAntiguedad'); }">Reconocimiento de Antigüedad</div> -->
        </div>
        <div v-else>
          <ModuladorFormFactory
            :schema="formTmpSchema"
            :formLive="true"
            :modelValue="formTmpValores"
            @update:modelValue="
              (val) => {
                console.log({ ...val });
                formTmpValores = { ...val };
              }
            "
            :isDialogVisible="false"
            @submit="handleSubmit"
            @cancel="() => (formTmp = null)"
          />
        </div>
        <div class="d-flex justify-between w-full mt-5">
          <div>
            <VBtn color="dark" variant="outlined" @click="handlePrevStep">
              Anterior
            </VBtn>
          </div>
          <div><VBtn @click="handleTerminarEntrevista"> Siguiente </VBtn></div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="card-entrevista-terminada mx-auto">
        <div class="text-center mb-4">
          <VIcon icon="tabler-check" color="success" size="32" class="mb-2" />
          <h4 class="mb-1">¡Entrevista terminada!</h4>
          <p class="mb-0 text-secondary">
            Puedes editar o finalizar la entrevista.
          </p>
        </div>
        <div class="d-flex justify-center gap-3">
          <VBtn
            color="warning"
            variant="outlined"
            @click="() => (isEditando = true)"
          >
            <VIcon icon="tabler-edit" start /> Editar entrevista
          </VBtn>
          <VBtn color="success" @click="terminarCotizacion">
            <span class="mr-3">Terminar Entrevista</span>
            <VIcon icon="tabler-check" class="ml-0 mr-0" start />
          </VBtn>
        </div>
      </div>
    </div>

    <!-- <pre>{{ formTmpValores }}</pre> -->
    <pre>{{ cotizacion.parametrosFlexibles }}</pre>
  </div>
</template>

<style lang="scss">
.justify-between {
  justify-content: space-between;
}
</style>
