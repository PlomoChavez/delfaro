<script lang="ts" setup>
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { ref } from "vue";
import PolizaAsegurados from "./polizas/PolizaAsegurados.vue";
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
  let payload = { poliza_id: props.data.id };
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
  let payload = { poliza_id: props.data.id };
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
const handleEditForm = () => { formDisabled.value = !formDisabled.value; };
// prettier-ignore
const handleBack = () => { emit("cancelar"); };
// accept an optional index so the handler can be called with zero args
const handleChangePanel = (idx?: any) => {
  if (typeof idx !== "undefined") {
    panel.value = idx;
  }
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
  props.data.data = JSON.parse(props.data.data);
});
</script>

<template>
  <div class="d-flex flex-column gap-4">
    <template v-if="panel == 1">
      <div class="w-full">
        <!-- prettier-ignore -->
        <BtnAtras titulo="Volver a polizas" @atras="handleBack" />

        <!-- prettier-ignore -->
        <h1 class="ml-4 wFull text-right">{{ props.data.numeroPoliza }} - {{  props.data.ramo.label }} - {{ props.data.compania.nombreCorto }}</h1>
      </div>
      <PolizaDetalles :data="props.data" @changePanel="handleChangePanel" />
    </template>
    <template v-if="panel != 1">
      <!-- prettier-ignore -->
      <BtnAtras titulo="Volver al detalle de la póliza" @atras="handleChangePanel(1)" />
      <template v-if="panel == 2">
        <PolizaAsegurados
          :registroId="props.data.id"
          :asegurados="props.data.asegurados"
        />
      </template>
      <template v-if="panel == 3">
        <PolizaReciboPago :data="props.data" />
      </template>
      <template v-if="panel == 4">
        <PolizaRecibos
          :registroId="props.data.id"
          :recibos="props.data.recibos"
        />
      </template>
      <template v-if="panel == 5">
        <p>Panel 5</p>
        <div class="wFull text-center"></div>
      </template>
    </template>
  </div>
</template>
