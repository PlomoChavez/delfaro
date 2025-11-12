<script lang="ts" setup>
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { ref, watch } from "vue";

const currentTab = ref("item1");
const modalContrasenia = ref(false);
const formDisabled = ref(true);
const dataContrasenia = ref({});
const recibos: any = ref({});
const formSchema: any = ref({});
const historial: any = ref([]);

// Props y eventos
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "cancelar"): void;
  (event: "changePanel", idx?: any): void;
}>();

const schemaResumenPoliza = [
  {
    label: "Número de póliza",
    type: "label",
    model: "numeroPoliza",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Compañía",
    type: "label",
    model: "compania.nombre",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Ramo",
    type: "label",
    model: "ramo.label",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Producto",
    type: "label",
    model: "producto.nombre",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Estatus",
    type: "label",
    model: "estatusPoliza.label",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Inicio de vigencia",
    type: "label",
    model: "inicioVigencia",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Fin de vigencia",
    type: "label",
    model: "finVigencia",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Frecuencia de pago",
    type: "label",
    model: "frecuencia",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
  {
    label: "Moneda",
    type: "label",
    model: "moneda.label",
    classElement: " col-sm-12 col-md-6  col-lg-6 ",
  },
];

const schemaCliente = [
  {
    label: "Nombre",
    type: "label",
    model: "cliente.nombre",
    classElement: " col-4 ",
  },
  {
    label: "RFC",
    type: "label",
    model: "cliente.rfc",
    classElement: " col-4 ",
  },
  {
    label: "CURP",
    type: "label",
    model: "cliente.curp",
    classElement: " col-4 ",
  },
];

// Funciones para obtener datos
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

// Manejo de eventos
const handleEditForm = () => {
  formDisabled.value = !formDisabled.value;
};

// Manejo de eventos
const handleShowModalContrasenia = () => {
  formDisabled.value = !formDisabled.value;
};

const handleBack = () => {
  emit("cancelar");
};

const handleChangePanel = (idx?: any) => {
  emit("changePanel", idx);
};

watch(
  () => currentTab.value,
  (newValue) => {
    if (currentTab.value == "item3") {
      getRecibos();
    }
    if (currentTab.value == "item4") {
      getHistorial();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="w-full">
    <div class="text-right w-full mb-3">
      <!-- <VBtn
        class="ml-2"
        size="small"
        variant="outlined"
        @click="handleShowModalContrasenia"
      >
        <VIcon start icon="tabler-edit" />
        Editar
      </VBtn> -->
      <VBtn
        class="ml-2"
        size="small"
        variant="outlined"
        @click="handleChangePanel(2)"
      >
        <VIcon start icon="tabler-users" />
        Ver asegurados
      </VBtn>
      <VBtn
        class="ml-2"
        size="small"
        variant="outlined"
        @click="handleShowModalContrasenia"
      >
        <VIcon start icon="tabler-eye" />
        Ver póliza
      </VBtn>
      <VBtn
        class="ml-2"
        size="small"
        variant="outlined"
        @click="handleShowModalContrasenia"
      >
        <VIcon start icon="tabler-key" />
        Corregir póliza
      </VBtn>
      <VBtn
        class="ml-2"
        size="small"
        variant="outlined"
        @click="handleShowModalContrasenia"
      >
        <VIcon start icon="tabler-mail" />
        Enviar por correo
      </VBtn>
      <VBtn
        class="ml-2"
        size="small"
        variant="outlined"
        @click="handleShowModalContrasenia"
      >
        <VIcon start icon="tabler-send" />
        Enviar mensaje
      </VBtn>
      <VBtn
        class="ml-2"
        size="small"
        variant="flat"
        color="error"
        @click="handleShowModalContrasenia"
      >
        <VIcon start icon="tabler-cancel" />
        Cancelar póliza
      </VBtn>
    </div>
    <div class="d-flex">
      <div class="col-8 gap-4 d-flex flex-column">
        <VCard class="rounded-lg">
          <div class="w-full">
            <div class="p-4">
              <h3 class="pl-4 pt-4 fontBold">Detalles de poliza</h3>
            </div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="p30">
            <FormFactory
              :schema="schemaResumenPoliza"
              :formLive="true"
              :modelValue="props.data"
              :showButtonsAction="false"
            />
          </div>
        </VCard>

        <VCard class="rounded-lg">
          <div class="w-full">
            <div class="p-4">
              <h3 class="pl-4 pt-4 fontBold">Inmueble asegurado</h3>
            </div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="wFull p30">
            <FormFactory
              :schema="schemaCliente"
              :formLive="true"
              :modelValue="props.data"
              :showButtonsAction="false"
            />
          </div>
        </VCard>

        <VCard class="rounded-lg">
          <div class="w-full">
            <div class="p-4">
              <h3 class="pl-4 pt-4 fontBold">Detalles del cliente</h3>
            </div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="wFull p30">
            <FormFactory
              :schema="schemaCliente"
              :formLive="true"
              :modelValue="props.data"
              :showButtonsAction="false"
            />
          </div>
        </VCard>

        <VCard class="rounded-lg">
          <div class="w-full">
            <div class="p-4">
              <h3 class="pl-4 pt-4 fontBold">Detalles del agente</h3>
            </div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="wFull p30">
            <FormFactory
              :schema="schemaCliente"
              :formLive="true"
              :modelValue="props.data"
              :showButtonsAction="false"
            />
          </div>
        </VCard>
      </div>
      <div class="col-4 gap-4 d-flex flex-column">
        <VCard class="rounded-lg">
          <div class="w-full">
            <div class="p-4">
              <h3 class="pl-4 pt-4 fontBold">Proximo pago</h3>
            </div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="p30 pt-10 pb-12">
            <h4 class="fontItalic textSecondary mt-3">Monto</h4>
            <h3 class="fontBold">
              {{ formatCurrency(props.data.proximoPagoMonto) }}
            </h3>
            <h3 class="fontBold"></h3>
            <h4 class="fontItalic textSecondary mt-3">
              Fecha de limite de pago
            </h4>
            <h3 class="fontBold">
              {{ formatDateMoment(props.data.proximoPagoFecha, "DD/MM/YYYY") }}
            </h3>
            <div class="col-11 mx-auto mt-2">
              <VBtn
                block
                size="small"
                variant="outlined"
                rounded="primary"
                @click="handleChangePanel(3)"
              >
                <VIcon start icon="tabler-wallet" />
                Realizar pago
              </VBtn>
            </div>
          </div>
        </VCard>
        <!-- prettier-ignore -->
        <VCard class="rounded-lg">
          <div class="w-full">
            <div class="p-4"><h3 class="pl-4 pt-4 fontBold">Resumen financiero</h3></div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="p30 pt-10 pb-12">
            <h4 class="fontItalic textSecondary mt-3">Prima neta</h4>
            <h2 class="fontBold ml-4">{{ formatCurrency(props.data.primaNeta) }}</h2>
            <h4 class="fontItalic textSecondary mt-3">Prima total</h4>
            <h2 class="fontBold ml-4">{{ formatCurrency(props.data.primaTotal) }}</h2>
            <div class="wFull flex flex-wrap gap-4">
                <div class="w_100 mx-auto border-t border-gray mt-4 mb-4 " />
                <div class="w-full d-flex">
                    <div class="mr-auto font-medium text-gray-700">Pago inicial</div>
                    <div class="ml-auto font-bold">{{ formatCurrency(props.data.pagoInicial) }}</div>
                </div>
                <div class="w-full d-flex">
                    <div class="mr-auto font-medium text-gray-700">Pago subsecuente</div>
                    <div class="ml-auto font-bold">{{ formatCurrency(props.data.pagoSubsecuente) }}</div>
                </div>
                <div class="w-full d-flex">
                    <div class="mr-auto font-medium text-gray-700">Financiamiento</div>
                    <div class="ml-auto font-bold">{{ formatCurrency(props.data.financiamiento) }}</div>
                </div>
                <div class="w-full d-flex">
                    <div class="mr-auto font-medium text-gray-700">Comisión agente</div>
                    <div class="ml-auto font-bold">{{ formatCurrency(props.data.comisionAgente) }}</div>
                </div>
            </div>
            <div class="col-11 mx-auto mt-2">
              <VBtn
                block
                size="small"
                variant="outlined"
                rounded="primary"
                @click="handleChangePanel(4)"
              >
                <VIcon start icon="tabler-receipt-2" />
                Ver recibos
              </VBtn>
            </div>
          </div>
        </VCard>

        <!-- prettier-ignore -->
        <VCard class="rounded-lg">
          <div class="w-full">
            <div class="p-4"><h3 class="pl-4 pt-4 fontBold">Historial de poliza</h3></div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="p30 pt-10 pb-12">
            <div class="wFull flex flex-wrap gap-4">
                <div class="w-full d-flex">
                    <div class="mr-auto font-medium text-gray-700">Creación</div>
                    <div class="ml-auto font-bold">{{ formatDateMoment(props.data.created_at, "DD/MM/YYYY hh:mm A") }}</div>
                </div>
                <div class="w-full d-flex">
                    <div class="mr-auto font-medium text-gray-700">Utl. Actualización</div>
                    <div class="ml-auto font-bold">{{ formatDateMoment(props.data.updated_at, "DD/MM/YYYY hh:mm A") }}</div>
                </div>
                <div class="w_100 mx-auto border-t border-gray mt-4 mb-4 " />
                    <div class="w-full font-medium text-gray-700">Acción</div>
                    <div class="ml-auto font-bold">Ultima movimiento</div>
            </div>
            <div class="col-11 mx-auto mt-2">
              <VBtn
                block
                size="small"
                variant="outlined"
                rounded="primary"
                @click="handleChangePanel(5)"
              >
                <VIcon start icon="tabler-clock-hour-3" />
                Ver Historial
              </VBtn>
            </div>
          </div>
        </VCard>
      </div>
    </div>
  </div>
</template>
