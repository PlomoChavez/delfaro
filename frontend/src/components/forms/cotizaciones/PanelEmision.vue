<script setup lang="ts">
import { createCliente } from "@/apis/clienteApi";
import {
  showConfirmationMessage,
  showErrorMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
import OpcionSelector from "@/components/custom/OpcionSelector.vue";
import ClienteBuscador from "@/components/forms/clientes/clienteBuscador.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
const router = useRouter();
const paso = ref(1);
const formData: any = ref({});
const data: any = ref({});

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();

const props = withDefaults(
  defineProps<{
    dataEmitir: any;
    registro: any;
    actualizarFN: any;
  }>(),
  {
    registro: null,
    dataEmitir: null,
  }
);
const userData = JSON.parse(localStorage.getItem("userData") || "{}");

// prettier-ignore
function convertirDatosSeguro(data :  any) {
  const resultado : any = {
    accesorios: [],
    coberturasBasicas: []
  };

  // Procesar accesorios seleccionados
  data.accesorios.forEach((accesorio :  any) => {
    if (accesorio.selected) {
      const accesorioSimplificado :  any = {
        nombre: accesorio.nombre,
        valores: []
      };

      // Extraer valores de los hijos
      accesorio.hijos.forEach((hijo :  any) => {
        if (hijo.tag === 'input' && hijo.label) {
          accesorioSimplificado.valores.push({
            campo: hijo.label,
            valor: hijo.valor
          });
        } else if (hijo.tag === 'select' && hijo.label) {
          accesorioSimplificado.valores.push({
            campo: hijo.label,
            valor: hijo.valor
          });
        } else if (hijo.label && !hijo.tag) {
          // Para casos como deducible que no tienen tag
          accesorioSimplificado.valores.push({
            campo: hijo.label,
            valor: hijo.valor
          });
        }
      });

      resultado.accesorios.push(accesorioSimplificado);
    }
  });

  // Procesar coberturas básicas
  data.coberturasBasicas.forEach((cobertura :  any) => {
    const coberturaSimplificada :  any = {
      cobertura: cobertura.cobertura,
      sumaAsegurada: null,
      deducible: null,
      prima: cobertura.prima.texto
    };

    // Extraer suma asegurada
    if (Array.isArray(cobertura.sumaSegura)) {
      // Si es array, buscar el valor relevante
      cobertura.sumaSegura.forEach((item :  any) => {
        if (item.tag === 'input') {
          coberturaSimplificada.sumaAsegurada = item.valor;
        } else if (item.tag === 'select') {
          coberturaSimplificada.sumaAsegurada = item.valor.texto || item.valor;
        } else if (item.tag === 'p') {
          coberturaSimplificada.sumaAsegurada = item.texto;
        }
      });
    } else if (cobertura.sumaSegura) {
      // Si es objeto único
      if (cobertura.sumaSegura.tag === 'input') {
        coberturaSimplificada.sumaAsegurada = cobertura.sumaSegura.valor;
      } else if (cobertura.sumaSegura.tag === 'select') {
        coberturaSimplificada.sumaAsegurada = cobertura.sumaSegura.valor.texto || cobertura.sumaSegura.valor;
      } else if (cobertura.sumaSegura.tag === 'p') {
        coberturaSimplificada.sumaAsegurada = cobertura.sumaSegura.texto;
      }
    }

    // Extraer deducible
    if (cobertura.deducible && cobertura.deducible.valor) {
      coberturaSimplificada.deducible = cobertura.deducible.valor.texto || cobertura.deducible.valor;
    }

    resultado.coberturasBasicas.push(coberturaSimplificada);
  });

  return resultado;
}

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
    { label: "Registro nuevo asegurado",  accion: "nuevo", icono: "fa fa-user-plus fa-2x",},
    { label: "Buscar asegurado existente",accion: "buscar",icono: "fa fa-search fa-2x",   },
  ],
};

// prettier-ignore
const formSchema = [
  { label: "Nacionalidad",                  type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "nacionalidad"},
  { label: "Estado de nacimiento",          type: "select",   classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "estadoNacimiento", catalogo: "estados" },
  { label: "Nombres",                       type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "nombre" },
  { label: "Segundo nombre",                type: "text",     classElement: " col-sm-12 col-md-6  col-lg-6 ", model: "segundoNombre" },
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

function handleContinuar(accion: string) {
  let isCliente = paso.value < 4;
  if (isCliente) {
    paso.value = accion === "nuevo" ? 3 : 2;
  } else {
    paso.value = accion === "nuevo" ? 7 : 6;
  }
}

function handleBack(idx: number) {
  switch (idx) {
    case 0:
      paso.value = 1;
      break;
    case 1:
      paso.value = 4;
      break;
    case 2:
      handleGetDataCarro();
      paso.value = 8;
      break;
  }
}

function handleGetDataCarro() {
  formData.value = { ...(data.value?.carro ?? {}) };
}

function handleAseguradoIgual(accion: string) {
  if (accion == "igual") {
    data.value.asegurado = { ...data.value.cliente };
  }
  paso.value = accion === "igual" ? 8 : 5;
}

async function handleActualizarEmision() {
  let tmp = toRaw(data.value);
  tmp.cotizacion = toRaw(props.registro);
  tmp.agente_id = userData.id;
  tmp.compania = tmp.cotizacion.compania.toLowerCase();
  tmp.cliente.isCliente = true;
  tmp.asegurado.isCliente = false;
  if (!props.dataEmitir) {
    let tmpt = convertirDatosSeguro(tmp.cotizacion.detalles);
    tmp.cotizacion.detalles.accesorios = tmpt.accesorios;
    tmp.cotizacion.detalles.coberturasBasicas = tmpt.coberturasBasicas;
  }

  delete tmp.cliente.data;
  delete tmp.asegurado.data;
  delete tmp.cotizacion.titular.direcciones;
  delete tmp.cotizacion.detalles.frecuenciasPago;
  delete tmp.cotizacion.detalles.titular;

  props.actualizarFN(tmp);
  return tmp;
}

async function handleEmitir() {
  showConfirmationMessage({
    title: "¿Deseas emitir esta cotización?",
    message: "Este proceso no se puede revertir.",
    confirmText: "Sí, continuar",
    cancelText: "Cancelar",
    onConfirm: async () => {
      let tmp = await handleActualizarEmision();
      await handleEmitirApi(tmp);
    },
    onCancel: () => {},
  });
}

async function handleGuardarEmision() {
  await handleActualizarEmision();
}

async function handleEmitirApi(payload: any) {
  const response = await customRequest({
    url: "/api/cotizaciones/emitir",
    method: "POST",
    data: payload,
  });
  const dataResponse = response.data;
  if (dataResponse.result) {
    // prettier-ignore
    toast.success("¡Cotización guardada!", { theme: "dark",});

    router.push("/polizas");
  } else {
    showErrorMessage({
      title: "Error",
      message: dataResponse.message,
    });
  }
}

function handleTerminar() {
  data.value.carro = { ...formData.value };
  paso.value = 9;
}

async function handleFormSubmit() {
  let response: any;
  let isCliente = paso.value < 4;
  let payload: any = { ...formData.value, isCliente };
  let tipo = isCliente ? "cliente" : "asegurado";
  response = await createCliente(payload);
  if (response.result) {
    data.value[tipo] = payload;
    formData.value = {};
    paso.value = isCliente ? 4 : 8;
  }
}

async function handleContinue(dataCliente: any) {
  let isCliente = paso.value < 4;
  let payload: any = { ...dataCliente, isCliente };
  let tipo = isCliente ? "cliente" : "asegurado";
  data.value[tipo] = payload;
  formData.value = {};
  paso.value = isCliente ? 4 : 8;
}

async function handleCancelar() {
  let isCliente = paso.value < 5;
  if (paso.value == 1) {
    emit("cancelar");
  } else if (paso.value == 5) {
    paso.value = 4;
  } else {
    paso.value = isCliente ? 1 : 5;
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
    if (props.dataEmitir) {
      paso.value = 9;
      data.value = { ...props.dataEmitir };
    }
  }
});

watch(
  () => paso.value,
  (newVal) => {
    if (newVal === 8) {
      handleGetDataCarro();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
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
      :btnCancelar="true"
      @accionSeleccionada="handleContinuar"
      @cancelar="handleCancelar"
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
      :btnCancelar="true"
      @accionSeleccionada="handleAseguradoIgual"
      @cancelar="handleCancelar"
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
      :btnCancelar="true"
      @accionSeleccionada="handleContinuar"
      @cancelar="handleCancelar"
    />

    <div v-else-if="paso === 2 || paso === 3 || paso === 6 || paso === 7">
      <div v-if="paso === 2 || paso === 6">
        <ClienteBuscador
          :isCliente="paso < 4"
          @select="handleContinue"
          @cancelar="handleCancelar"
        />
      </div>
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
          @submit="handleFormSubmit"
          @cancel="handleCancelar"
        />
      </div>
      <!-- Aquí puedes colocar tu formulario final -->
    </div>
    <div v-if="paso === 8">
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
        @submit="handleTerminar"
        @cancel="handleCancelar"
      />
    </div>
    <panelValidarAntesEmitir
      v-if="paso === 9"
      :data="data"
      @back="handleBack"
      @guardar="handleGuardarEmision"
      @cancelar="$emit('cancelar')"
      @continuar="handleEmitir"
    />
  </div>
</template>
