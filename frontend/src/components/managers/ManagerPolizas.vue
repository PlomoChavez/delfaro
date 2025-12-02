<script lang="ts" setup>
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import moment from "moment";
import { ref } from "vue";
import PolizaArchivos from "./polizas/PolizaArchivos.vue";
import PolizaAsegurados from "./polizas/PolizaAsegurados.vue";
import PolizaCancelar from "./polizas/PolizaCancelar.vue";
import PolizaCorreo from "./polizas/PolizaCorreo.vue";
import PolizaDetalles from "./polizas/PolizaDetalles.vue";
import PolizaReciboPago from "./polizas/PolizaReciboPago.vue";
import PolizaRecibos from "./polizas/PolizaRecibos.vue";

const currentTab = ref("item1");
const panel = ref(1);
const modalContrasenia = ref(false);
const formDisabled = ref(true);
const dataContrasenia = ref({});
const recibos: any = ref({});
const historial: any = ref([]);

// prettier-ignore
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),{});

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();

const dataPoliza: any = ref(null);
// prettier-ignore
const formSchema : any = [
  { label: "Numero de poliza",          type: "label",      model: "numeroPoliza",    },
  { label: "Numero de cliente",         type: "label",      model: "numeroCliente",   },
  { label: "Compañia",                  type: "label",      model: "compania.nombre"  },
  { label: "Ramo",                      type: "label",      model: "ramo.label"       },
  { label: "Producto",                  type: "label",      model: "producto.nombre"   },
  { label: "Cliente",                   type: "label",      model: "cliente.nombre"   },
  { label: "Subagente",                 type: "label",      model: "subagente"        },
  { label: "Agente",                    type: "label",      model: "agente"           },
  { label: "Forma de pago",             type: "label",      model: "formaPago.label",       },
  { ref: "vigencia",                    type: "label",      minModel: "inicioVigencia", minLabel: "Inicio de vigencia",maxModel: "finVigencia",maxLabel: "Fin de vigencia",        },
  { label: "Antiguedad",                type: "label",      model: "antiguedad",      },
  { label: "Tipo de vencimiento",       type: "label",      model: "tipoVencimiento.label", },
  { label: "Metodo de pago",            type: "label",      model: "metodoPago.label",      },
  { label: "Prima neta anual",          type: "label",      model: "primaNeta",  config:{ prefix:'$ '} },
  { label: "Finaciamiento",             type: "label",      model: "financiamiento",  },
  { label: "PCT COMI (%)",              type: "label",      model: "comision",        },
  { label: "Prima total",               type: "label",      model: "primaTotal",      },
  { label: "Moneda",                    type: "label",      model: "moneda.label",          },
  { label: "Importe pago inicial",      type: "label",      model: "pagoInicial",     },
  { label: "Importe pago subsecuente",  type: "label",      model: "pagoSubsecuente", },
  { label: "Estatus",                   type: "label",      model: "estatus",         },
];

async function getRecibos() {
  let url = "/api/polizas/recibos";
  let payload = { poliza_id: dataPoliza.id };
  let response = await customRequest({
    url: url,
    method: "POST",
    data: payload,
  });
  if (response.data.result) {
    recibos.value = response.data.data;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}
async function getHistorial() {
  let url = "/api/polizas/historial";
  let payload = { poliza_id: dataPoliza.id };
  let response = await customRequest({
    url: url,
    method: "POST",
    data: payload,
  });
  if (response.data.result) {
    historial.value = response.data.data;
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

// prettier-ignore
const findReciboByVencimiento = (recibos: any[], proximoPagoFecha: string) => {
  return recibos.find((recibo) => {
    const fechaComparar = moment(recibo.fechaInicio, "DD/MM/YYYY");
    const proximoPago = moment(proximoPagoFecha, "DD/MM/YYYY");

    return fechaComparar.isSame(proximoPago, "day");
  });
};

// prettier-ignore
const handleEditForm = () => { formDisabled.value = !formDisabled.value; };
// prettier-ignore
const handleBack = () => { emit("cancelar"); };
// accept an optional index so the handler can be called with zero args
const handleChangePanel = (idx?: any) => {
  if (typeof idx !== "undefined") {
    panel.value = idx;
  }
};

// Función para calcular los días entre la fecha de vencimiento y la fecha actual
const getDaysDifference = (fecha1: string, fecha2: any = null): number => {
  const now = fecha2 == null ? moment() : moment(fecha2); // Fecha actual
  const vencimientoDate = moment(fecha1, "DD/MM/YYYY"); // Convertir la fecha de vencimiento
  return now.diff(vencimientoDate, "days"); // Diferencia en días
};

watch(
  () => currentTab.value,
  (newValue) => {
    if (currentTab.value == "2") {
      // getRecibos();
      recibos.value = [
        {
          id: 25,
          poliza_id: 29,
          numeroRecibo: "REC-29-0001",
          vencimiento: "2025-01-23",
          importe: "6650.61",
          estatus: "Pendiente",
          fechaPago: null,
          fechaCancelado: null,
          evidencia: null,
          created_at: "2025-05-02T17:36:29.000000Z",
          updated_at: "2025-05-02T17:36:29.000000Z",
        },
        {
          id: 26,
          poliza_id: 29,
          numeroRecibo: "REC-29-0002",
          vencimiento: "2025-07-23",
          importe: "5954.63",
          estatus: "Pagado",
          fechaPago: null,
          fechaCancelado: null,
          evidencia: null,
          created_at: "2025-05-02T17:36:29.000000Z",
          updated_at: "2025-05-02T17:36:29.000000Z",
        },
      ];
    }
    if (currentTab.value == "3") {
      getHistorial();
    }
  },
  { immediate: true }
);

onMounted(() => {
  let tmpData = JSON.parse(JSON.stringify(props.data));
  tmpData.data = JSON.parse(tmpData.data);

  // Función para agrupar recibos en "pasado", "actual" y "pendientes"

  if (tmpData.recibos) {
    const now = moment(); // Fecha actual
    tmpData.recibos.forEach((recibo: any) => {
      const vencimiento = moment(recibo.vencimiento, "DD/MM/YYYY"); // Especificar el formato de la fecha

      recibo.isPagado = !(
        recibo.fechaPago == null && recibo.fechaCancelado == null
      );

      recibo.concepto = `Pago del recibo ${recibo.numeroRecibo} de la poliza ${tmpData.numeroPoliza}`;
      recibo.montoFormateado = formatCurrency(recibo.importe);
      // if (recibo.estatus !== "Pagado") {
      //   recibo.diferenciaDias = getDaysDifference(recibo.vencimiento);
      // } else {
      //   let fecha2 =
      //     recibo.fechaCancelado != null
      //       ? recibo.fechaCancelado
      //       : recibo.fechaPago;

      //   recibo.diferenciaDias = getDaysDifference(recibo.vencimiento, fecha2);
      // }
      recibo.diferenciaDias = getDaysDifference(recibo.vencimiento);

      console.log(
        recibo.numeroRecibo,
        " Vencimiento: ",
        recibo.vencimiento,
        " Fecha de pago: ",
        recibo.fechaPago || recibo.fechaCancelado,
        " Diferencia dias:",
        recibo.diferenciaDias,
        " dias"
      );

      recibo.diferenciaDias = getDaysDifference(
        recibo.estatus !== "Pagado"
          ? recibo.vencimiento
          : recibo.fechaCancelado || recibo.fechaPago
      );

      recibo.isVencido = vencimiento.isBefore(now, "day"); // true si la fecha de vencimiento es anterior a hoy

      if (recibo.isVencido && recibo.estatus !== "Pagado") {
        recibo.estatus = "Atrasado";
      }
    });
  }

  dataPoliza.value = tmpData;
});
</script>

<template>
  <div v-if="dataPoliza != null" class="d-flex flex-column gap-4">
    <template v-if="panel == 1">
      <div class="w-full">
        <!-- prettier-ignore -->
        <BtnAtras titulo="Volver a polizas" @atras="handleBack" />

        <!-- prettier-ignore -->
        <h1 class="ml-4 wFull text-right">{{ dataPoliza.numeroPoliza }} - {{  dataPoliza.ramo.label }} - {{ dataPoliza.compania.nombreCorto }}</h1>
      </div>
      <PolizaDetalles :data="dataPoliza" @changePanel="handleChangePanel" />
    </template>
    <template v-if="panel != 1">
      <!-- prettier-ignore -->
      <BtnAtras titulo="Volver al detalle de la póliza" @atras="handleChangePanel(1)" />
      <template v-if="panel == 2">
        <PolizaAsegurados
          :registroId="dataPoliza.id"
          :asegurados="dataPoliza.asegurados"
        />
      </template>
      <template v-if="panel == 3">
        <PolizaReciboPago
          :data="dataPoliza"
          :recibo="dataPoliza.recibo"
          @changePanel="handleChangePanel"
        />
      </template>
      <template v-if="panel == 4">
        <PolizaRecibos
          :data="dataPoliza"
          :registroId="dataPoliza.id"
          :recibos="dataPoliza.recibos"
          @changePanel="handleChangePanel"
        />
      </template>
      <!-- Historial -->
      <template v-if="panel == 5">
        <p>Panel 5</p>
        <div class="wFull text-center"></div>
      </template>
      <!-- Archivos -->
      <template v-if="panel == 6">
        <PolizaArchivos :data="dataPoliza" @changePanel="handleChangePanel" />
      </template>
      <!-- Cancelar -->
      <template v-if="panel == 7">
        <PolizaCancelar :data="dataPoliza" @goInicio="handleBack" />
      </template>
      <!-- Mandar por correo -->
      <template v-if="panel == 8">
        <PolizaCorreo :data="dataPoliza" @goInicio="handleBack" />
      </template>
    </template>
  </div>
</template>
