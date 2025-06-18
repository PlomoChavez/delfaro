<script setup lang="ts">
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { customRequest } from "@/utils/axiosInstance";

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
  cotizacion.value.asegurados = [...cotizacion.value.asegurados, data];
  newAsegurado.value = null;
}
async function handleSubmit(data: any) {
  cotizacion.value[formTmp.value] = data;
  formTmp.value = null;
  formTmpValores.value = {};
}

async function handleFormPersonalizacion(tipo: string) {
  switch (tipo) {
    case "parametrosFlexibles":
      formTmpSchema.value = [...formSchemaPersonalizacion1];
      break;
    case "proteccionAdicional":
      formTmpSchema.value = [...formSchemaPersonalizacion2];
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

onMounted(() => {
  cotizacion.value = props.registro || {};
  console.log("cotizacion", cotizacion.value);
  if (cotizacion.value.asegurados === undefined) {
    cotizacion.value.asegurados = [];
  }
  if (cotizacion.value.titular != undefined) {
    formTitular.value = { ...cotizacion.value.titular };
  }
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
    <pre>{{ formTmpValores }}</pre>
    <pre>{{ cotizacion }}</pre>
    <div v-if="step == 1">
      <ModuladorFormFactory
        class="w-full"
        title="Titular"
        :schema="formSchema"
        :formLive="true"
        :modelValue="formTitular"
        @update:modelValue="
          (val) => {
            cotizacion.titular = { ...val };
          }
        "
        :isDialogVisible="false"
        @submit="handleFormSubmit"
      />
    </div>
    <div v-if="step == 2">
      <div v-if="newAsegurado == null">
        <div class="d-flex justify-end">
          <VBtn color="secondary" @click="() => (newAsegurado = {})">
            Nuevo
            <VIcon start icon="tabler-checkbox" />
          </VBtn>
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
                <VIcon icon="tabler-edit" color="primary" size="25" />
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
        <div v-if="cotizacion.asegurados.length == 0">
          <p class="w-full text-center">No hay asegurados registrados</p>
        </div>
      </div>
      <ModuladorFormFactory
        v-else
        title="Asegurado"
        :schema="formSchemaPersona"
        :modelValue="newAsegurado"
        :isDialogVisible="false"
        @cancel="() => (newAsegurado = null)"
        @submit="handleFormSubmitPersona"
      />
      <VBtn @click="handleNextPersonas">
        Next
        <VIcon start icon="tabler-checkbox" />
      </VBtn>
    </div>
    <div v-if="step == 3" class="divPlanes">
      <div class="d-flex justify-center w-full">
        <h3 class="w-full">¿En qué fecha iniciará tu plan de salud?</h3>
      </div>
      <div class="divFechas">
        <div class="w-fit text-center">
          <h3>Inicio de vigencia</h3>
          <p>{{ tmp.inicio }}</p>
        </div>
        <div class="w-fit text-center">
          <h3>Fin de Vigencia</h3>
          <p>{{ tmp.fin }}</p>
        </div>
      </div>
      <div v-if="tmp.plan">
        <h3>Plan Seleccionado</h3>
        <p>{{ tmp.plan.label }}</p>
      </div>
      <div v-else>
        <div
          v-for="(item, index) in planes"
          :key="index"
          @click="() => (tmp.plan = item)"
        >
          Nombre: {{ item.label }}
        </div>
      </div>
      <div class="d-flex justify-end w-full">
        <VBtn @click="handleNextPlan">
          Next
          <VIcon start icon="tabler-checkbox" />
        </VBtn>
      </div>
    </div>
    <div v-if="step == 4">
      <div v-if="!formTmp" class="d-flex justify-center w-full gap-5">
        <!-- prettier-ignore -->
        <div class="divPlanItem" @click="() => { handleFormPersonalizacion('parametrosFlexibles'); }">Parámetros flexibles</div>
        <!-- prettier-ignore -->
        <div class="divPlanItem" @click="() => { handleFormPersonalizacion('proteccionAdicional'); }">Protección con costo adicional</div>
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
              formTmpValores.value = { ...val };
            }
          "
          :isDialogVisible="false"
          @submit="handleSubmit"
          @cancel="() => (formTmp = null)"
        />
      </div>
      <div class="d-flex justify-end w-full">
        <VBtn @click="handleNextPlan">
          Next
          <VIcon start icon="tabler-checkbox" />
        </VBtn>
      </div>
    </div>
    <div v-if="step == 5">
      <div class="d-flex justify-center w-full">
        <VBtn @click="sendCotizacion">
          Enviar Cotización
          <VIcon start icon="tabler-checkbox" />
        </VBtn>
      </div>
    </div>
  </div>
</template>
