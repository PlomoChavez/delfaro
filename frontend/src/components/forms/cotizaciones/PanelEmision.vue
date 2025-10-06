<script setup lang="ts">
import OpcionSelector from "@/components/custom/OpcionSelector.vue";
import { ref } from "vue";

const paso = ref(1);
const formData: any = ref({});

const props = withDefaults(
  defineProps<{
    registro: any;
  }>(),
  {
    registro: null,
  }
);

const opciones = {
  cliente: [
    {
      label: "Registro nuevo",
      accion: "nuevo",
      icono: "fa fa-user-plus fa-2x",
      disabled: false,
    },
    {
      label: "Buscar cliente",
      accion: "buscar",
      icono: "fa fa-search fa-2x",
      disabled: false,
    },
  ],
  aseguradoIgual: [
    {
      label: "Sí, es el mismo",
      accion: "igual",
      icono: "fa fa-user-check fa-2x",
      disabled: false,
    },
    {
      label: "No, es diferente",
      accion: "diferente",
      icono: "fa fa-user-edit fa-2x",
      disabled: false,
    },
  ],
  asegurado: [
    {
      label: "Registro nuevo asegurado",
      accion: "nuevoAsegurado",
      icono: "fa fa-user-plus fa-2x",
      disabled: false,
    },
    {
      label: "Buscar asegurado existente",
      accion: "buscarAsegurado",
      icono: "fa fa-search fa-2x",
      disabled: false,
    },
  ],
};

// prettier-ignore
const formSchema = [
  { label: "Nacionalidad",                  type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "nacionalidad" },
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

  // Vehículo
  { label: "Datos del auto",    type: "separador", classElement: " col-12 ",},
  { label: "Conductor habitual",  type: "text",   classElement: " col-12 ", model: "conductorHabitual" },
  { label: "Placas",              type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "placas" },
  { label: "Número de serie",     type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "numeroSerie" },
  { label: "Número de motor",     type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "numeroMotor" },
  { label: "Color",               type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "color" },
  { label: "Repuve",              type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "repuve" },
  { label: "Número económico",    type: "text",   classElement: " col-sm-12 col-md-6 col-lg-6 ", model: "numeroEconomico" },
];

function handleCliente(accion: string) {
  console.log("Acción seleccionada para cliente:", accion);
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
  paso.value = paso.value > 4 ? 8 : 4;
}

function handleFormSubmit() {}

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
    <pre>{{ formData }}</pre>
    <OpcionSelector
      v-if="paso === 1"
      :config="{
        titulo: 'Cliente',
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
      <div v-if="paso === 2 || paso === 6">
        <ModuladorFormFactory
          class="col-sm-10 col-md-8 col-lg-8 mx-auto"
          title="Titular"
          :titleClass="' mb9 '"
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
      <div v-if="paso === 3 || paso === 7">
        <ModuladorFormFactory
          class="col-sm-10 col-md-8 col-lg-8 mx-auto"
          title="Titular2"
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
  </div>
</template>
