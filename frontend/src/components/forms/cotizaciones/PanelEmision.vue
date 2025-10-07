<script setup lang="ts">
import OpcionSelector from "@/components/custom/OpcionSelector.vue";
import { ref } from "vue";

const paso = ref(1);
const formData: any = ref({});
const data: any = ref({
  cliente: {
    fechaNacimiento: "2025-10-10",
    nombre: "Jesus",
    segundoNombre: "Ramon",
    apellidoPaterno: "Chavez",
    apellidoMaterno: "Quiroz",
    curp: "CAQJ",
    sexo: {
      label: "Mujer",
      id: "Mujer",
    },
    telefono: "7442077733",
    correo: "de@de.com",
    codigoPostal: "31304",
    direccion: "JOSEFA ORTIZ DE DOMINGUEZ, CHIHUAHUA, CHIHUAHUA, CP 31304",
    marca: "NISSAN",
    modelo: "MARCH",
    anio: "2019",
    version: "SENSE 1.6L STD., 05 OCUP.",
    colonia: "JOSEFA ORTIZ DE DOMINGUEZ",
    municipio: "CHIHUAHUA",
    estado: {
      label: "Chihuahua",
      id: 6,
    },
    nacionalidad: "Mexicana",
    estadoNacimiento: {
      label: "Guerrero",
      id: 13,
    },
    rfc: "CAQJ",
    tipoIdentificacion: "INE",
    referenciaIdentificacion: "INE19992",
    genero: true,
    pais: "Mexico",
    calle: "dede",
    numeroExterior: "dede",
    telefonoFijo: "dedede",
    celular: "dede",
    profesion: "dede",
    ocupacion: "dede",
    giro: "dedede",
    isPolitico: true,
  },
  asegurado: {
    fechaNacimiento: "2025-10-10",
    nombre: "Jesus",
    segundoNombre: "Ramon",
    apellidoPaterno: "Chavez",
    apellidoMaterno: "Quiroz",
    curp: "CAQJ",
    sexo: {
      label: "Mujer",
      id: "Mujer",
    },
    telefono: "7442077733",
    correo: "de@de.com",
    codigoPostal: "31304",
    direccion: "JOSEFA ORTIZ DE DOMINGUEZ, CHIHUAHUA, CHIHUAHUA, CP 31304",
    marca: "NISSAN",
    modelo: "MARCH",
    anio: "2019",
    version: "SENSE 1.6L STD., 05 OCUP.",
    colonia: "JOSEFA ORTIZ DE DOMINGUEZ",
    municipio: "CHIHUAHUA",
    estado: {
      label: "Chihuahua",
      id: 6,
    },
    nacionalidad: "Mexicana",
    estadoNacimiento: {
      label: "Guerrero",
      id: 13,
    },
    rfc: "CAQJ",
    tipoIdentificacion: "INE",
    referenciaIdentificacion: "INE19992",
    genero: true,
    pais: "Mexico",
    calle: "dede",
    numeroExterior: "dede",
    telefonoFijo: "dedede",
    celular: "dede",
    profesion: "dede",
    ocupacion: "dede",
    giro: "dedede",
    isPolitico: true,
  },
});

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();

const props = withDefaults(
  defineProps<{
    registro: any;
  }>(),
  {
    registro: null,
  }
);

// prettier-ignore
const opciones = {
  cliente: [
    { label: "Registro nuevo", accion: "nuevo",   icono: "fa fa-user-plus fa-2x",},
    { label: "Buscar cliente", accion: "buscar",  icono: "fa fa-search fa-2x",   }, 
  ],
  aseguradoIgual: [
    { label: "Sí, es el mismo",   accion: "igual",      icono: "fa fa-user-check fa-2x", },
    { label: "No, es diferente",  accion: "diferente",  icono: "fa fa-user-edit fa-2x",  },
  ],
  asegurado: [
    { label: "Registro nuevo asegurado",  accion: "nuevoAsegurado", icono: "fa fa-user-plus fa-2x",},
    { label: "Buscar asegurado existente",accion: "buscarAsegurado",icono: "fa fa-search fa-2x",   },
  ],
};

// prettier-ignore
const formSchema = [
  { label: "Nacionalidad",                  type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "nacionalidad"},
  { label: "Estado de nacimiento",          type: "select",   classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "estadoNacimiento", catalogo: "estados" },
  { label: "Nombres",                       type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "nombre" },
  { label: "Apellido paterno",              type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "apellidoPaterno" },
  { label: "Apellido materno",              type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "apellidoMaterno" },
  { label: "Fecha de nacimiento",           type: "date",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "fechaNacimiento" },
  { label: "CURP",                          type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "curp" },
  { label: "RFC",                           type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "rfc" },
  { label: "Tipo de identificación",        type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "tipoIdentificacion" },
  { label: "Referencia de identificación",  type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "referenciaIdentificacion" },
  { label: "Género",                        type: "switch",   classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "genero", options: [ {label:"Hombre",id:"Hombre"}, {label:"Mujer",id:"Mujer"} ]},
  

  // Domicilio
  { label: "Domicilio",         type: "separador", classElement: " col-12 ",},
  { label: "País",              type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "pais" },
  { label: "Estado",            type: "select",  classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "estado", catalogo: "estados" },
  { label: "Municipio",         type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "municipio" },
  { label: "Colonia",           type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "colonia" },
  { label: "Calle",             type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "calle" },
  { label: "Número exterior",   type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "numeroExterior" },
  { label: "Código postal",     type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "codigoPostal" },
  { label: "Teléfono fijo",     type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "telefonoFijo" },
  { label: "Celular",           type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "celular" },
  { label: "Correo",            type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "correo" },
  { label: "Profesión",         type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "profesion" },
  { label: "Ocupación",         type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "ocupacion" },
  { label: "Giro",              type: "text",    classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "giro" },
  { label: "¿Es político?",     type: "switch",  classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "isPolitico" },
];

// prettier-ignore
let formSchemaCarro = [
  { label: "Conductor habitual",  type: "text",   classElement: " col-12 ", model: "conductorHabitual" },
  { label: "Placas",              type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "placas" },
  { label: "Número de serie",     type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "numeroSerie" },
  { label: "Número de motor",     type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "numeroMotor" },
  { label: "Color",               type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "color" },
  { label: "Repuve",              type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "repuve" },
  { label: "Número económico",    type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "numeroEconomico" },
]

function handleCliente(accion: string) {
  switch (accion) {
    case "nuevo":
      paso.value = 3; // Ir al formulario de nuevo cliente
      break;
    case "buscar":
      paso.value = 2; // Ir al formulario de búsqueda de cliente
      break;
  }
}

function handleAseguradoIgual(accion: string) {
  paso.value = accion === "igual" ? 8 : 5;
}

function handleAsegurado(accion: string) {
  paso.value = accion === "nuevoAsegurado" ? 7 : 6;
}

function handleTerminar() {
  data.value.carro = { ...formData.value };
  paso.value = 9;
}

function handleFormSubmit() {
  let isCliente = paso.value < 4;
  if (isCliente) {
    data.value.cliente = { ...formData.value };
    formData.value = {};
    paso.value = 4;
  } else {
    data.value.asegurado = { ...formData.value };
    formData.value = {};
    paso.value = 8;
  }
}

onBeforeMount(() => {
  if (props.registro) {
    let tmp = { ...props.registro.titular, ...props.registro.vehiculo };

    // prettier-ignore
    let domicilioArr = (props.registro.titular.direccion || "").split(",");
    tmp.colonia = domicilioArr[0]?.trim() || "";
    tmp.municipio = domicilioArr[1]?.trim() || "";
    tmp.estado = {
      label: domicilioArr[2]?.trim() || "",
      id: domicilioArr[2]?.trim(),
    };

    delete tmp.direcciones;
    delete tmp.versiones;

    formData.value = tmp;
  }
});
</script>

<template>
  <div>
    <pre>{{ paso }}</pre>
    <OpcionSelector
      v-if="paso === 1"
      :config="{
        titulo: 'Información del cliente',
        subtitulo:
          'Elige una opción para continuar con la gestión de tu seguro.',
        tipo: 'cards',
        opciones: opciones.cliente,
      }"
      :widthCard="'200px'"
      @accionSeleccionada="handleCliente"
    />

    <OpcionSelector
      v-else-if="paso === 4"
      :config="{
        titulo: '¿El asegurado es el mismo que el cliente?',
        subtitulo: 'Selecciona una opción.',
        tipo: 'cards',
        opciones: opciones.aseguradoIgual,
      }"
      :widthCard="'200px'"
      @accionSeleccionada="handleAseguradoIgual"
    />

    <OpcionSelector
      v-else-if="paso === 5"
      :config="{
        titulo: 'Asegurado',
        subtitulo: 'Selecciona una opción para el asegurado.',
        tipo: 'cards',
        opciones: opciones.asegurado,
      }"
      :widthCard="'200px'"
      @accionSeleccionada="handleAsegurado"
    />

    <div v-else-if="paso === 2 || paso === 3 || paso === 6 || paso === 7">
      <div v-if="paso === 2 || paso === 6">panel de busqueda</div>
      <div v-if="paso === 3 || paso === 7">
        <ModuladorFormFactory
          class="col-sm-10 col-md-8 col-lg-8 mx-auto"
          :title="'Información del ' + (paso === 3 ? 'cliente' : 'asegurado')"
          :titleClass="' mb12 '"
          :customTitle="true"
          :divCard="true"
          :schema="formSchema"
          :formLive="true"
          :modelValue="formData"
          :isDialogVisible="false"
          :textButtonSubmit="'Siguiente pregunta'"
          :showIconButtonSubmit="false"
          :showButtonCancel="false"
          @submit="handleFormSubmit"
        />
      </div>
      <!-- Aquí puedes colocar tu formulario final -->
    </div>
    <div>
      <div v-if="paso === 8">
        <!-- <pre>{{ data }}</pre> -->
        <ModuladorFormFactory
          class="col-sm-10 col-md-8 col-lg-8 mx-auto"
          :title="'Información del Carro'"
          :titleClass="' mb12 '"
          :customTitle="true"
          :divCard="true"
          :schema="formSchemaCarro"
          :formLive="true"
          :modelValue="formData"
          :isDialogVisible="false"
          :textButtonSubmit="'Continuar'"
          :showIconButtonSubmit="false"
          :showButtonCancel="false"
          @submit="handleTerminar"
        />
      </div>
      <panelValidarAntesEmitir
        v-if="paso === 9"
        :data="data"
        @cancelar="$emit('cancelar')"
      />
    </div>
  </div>
</template>
