<script lang="ts" setup>
// prettier-ignore
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import {
  showErrorMessage,
  showSuccessMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
import PolizaWidget from "@/components/forms/polizas/PolizaWidget.vue";
import PolizaClientes from "@/components/forms/polizas/PolizaWizardClientes.vue";
import { ref } from "vue";

const emit = defineEmits<{
  (event: "cancel"): void;
}>();

const step = ref<any>(0);
const poliza = ref<any>({});
const companias = ref<any>(null);
const claves = ref<any>(null);
const ramos = ref<any>([]);
const Productos = ref<any>([]);
const Agentes = ref<any>([
  { id: 1, nombre: "Agente 1", estatus: true, clave: 131 },
  { id: 2, nombre: "Agente 2", estatus: true, clave: 151 },
  { id: 3, nombre: "Agente 3", estatus: true, clave: 1972 },
  { id: 4, nombre: "Agente 4", estatus: true, clave: 132 },
]);

// prettier-ignore
const formSchema = [
  { label: "Numero de poliza",          type: "text",       model: "numeroPoliza",   },
  { label: "Numero de cliente",         type: "text",       model: "numeroCliente",  },
  { label: "Compañia",                  type: "text",       model: "compania",       disabled: true },
  { label: "Ramo",                      type: "text",       model: "ramo",           disabled: true},
  { label: "Producto",                  type: "text",       model: "producto",       disabled: true},
  { label: "Cliente",                   type: "text",       model: "cliente",        disabled: true},
  { label: "Subagente",                 type: "text",       model: "subagente",      disabled: true},
  { label: "Agente",                    type: "text",       model: "agente",         disabled: true},
  { label: "Forma de pago",             type: "select",     model: "formaPago",       catalogo: "formas-pagos"},
  { ref: "vigencia",                    type: "rangeDate",  minModel: "inicioVigencia", minLabel: "Inicio de vigencia",maxModel: "finVigencia",maxLabel: "Fin de vigencia",        },
  { label: "Antiguedad",                type: "text",       model: "antiguedad",     },
  { label: "Tipo de vencimiento",       type: "select",     model: "tipoVencimiento", catalogo: "tipo-vencimiento"},
  { label: "Metodo de pago",            type: "select",     model: "metodoPago",      catalogo: "metodos-pago"},
  { label: "Prima neta anual",          type: "number",     model: "primaNeta",       config:{ prefix:'$ '} },
  { label: "Finaciamiento",             type: "text",       model: "financiamiento", },
  { label: "PCT COMI (%)",              type: "text",       model: "comisionAgente",  },
  { label: "Prima total",               type: "text",       model: "primaTotal",     },
  { label: "Moneda",                    type: "select",     model: "moneda",          catalogo: "moneda"},
  { label: "Importe pago inicial",      type: "text",       model: "pagoInicial",    },
  { label: "Importe pago subsecuente",  type: "text",       model: "pagoSubsecuente",},
  { label: "Estatus",                   type: "select",     model: "estatus",         catalogo: "estatus-polizas"},
];

async function fetchData() {
  try {
    let url = "/api/polizas/wizard";
    if (url != "") {
      let payload = {
        usuario_id: 5,
      };
      const response = await customRequest({
        url: url,
        method: "POST",
        data: payload,
      });
      const data = response.data.data;
      companias.value = data.companias;
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

function handleSelectCompania(compania: any) {
  step.value = 1;
  ramos.value = compania.ramos;
  poliza.value.compania = compania;
}

function handleSelectRamo(ramo: any) {
  step.value = 2;
  Productos.value = ramo.productos;
  poliza.value.ramo = ramo;
}

function handleSelectProducto(producto: any) {
  step.value = 3;
  poliza.value.producto = producto;
}

function handleSelectCliente(cliente: any) {
  step.value = 4;
  poliza.value.cliente = cliente;
}

function handleSelectSubAgente(Subagente: any) {
  poliza.value.subAgente = Subagente;
  poliza.value = {
    compania: poliza.value.compania.nombreCorto,
    compania_id: poliza.value.compania.id,
    ramo: poliza.value.ramo.label,
    ramo_id: poliza.value.ramo.id,
    producto: poliza.value.producto.nombre,
    producto_id: poliza.value.producto.id,
    cliente: poliza.value.cliente.nombre,
    cliente_id: poliza.value.cliente.id,
    subagente: poliza.value.subAgente.nombre,
    subagente_id: poliza.value.subAgente.id,
  };
  step.value = 5;
}

function handleCancel() {
  emit("cancel");
}
async function handleSubmit() {
  let url = "/api/polizas/create";
  let payload = { ...poliza.value };
  let response = await customRequest({
    url: url,
    method: "POST",
    data: payload,
  });
  if (response.data.result) {
    showSuccessMessage({
      title: "Guardado",
      message: response.data.message,
    });
    emit("cancel");
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.cardItem {
  min-width: 200px;
  background-color: #f7f7f7;
  text-align: center;
  width: fit-content;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.cardsWrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}
</style>

<template>
  <VCard title="Detalles de la póliza" class="mb-4">
    <VCardText>
      <div class="w-full" v-if="step != 5">
        <PolizaWidget :data="poliza" />
        <!-- Compania -->
        <div class="mb-4" v-if="step == 0">
          <h1 class="w-full text-center mb-5">Selecciona una compañia:</h1>
          <div class="cardsWrapper">
            <div
              class="cardItem"
              v-for="(item, index) in companias"
              :key="index"
              @click="handleSelectCompania(item)"
            >
              <span>{{ item.nombreCorto }}</span>
            </div>
          </div>
        </div>
        <!-- Ramo -->
        <div class="mb-4" v-if="step == 1">
          <h1 class="w-full text-center mb-5">Selecciona un ramo:</h1>
          <div class="cardsWrapper">
            <div
              class="cardItem"
              v-for="(item, index) in ramos"
              :key="index"
              @click="handleSelectRamo(item)"
            >
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
        <!-- Producto-->
        <div class="mb-4" v-if="step == 2">
          <h1 class="w-full text-center mb-5">Selecciona un producto:</h1>
          <div class="cardsWrapper">
            <div
              class="cardItem"
              v-for="(item, index) in Productos"
              :key="index"
              @click="handleSelectProducto(item)"
            >
              <span>{{ item.nombre }}</span>
            </div>
          </div>
        </div>
        <!-- Cliente -->
        <div class="mb-4" v-if="step == 3">
          <h1 class="w-full text-center mb-5">Selecciona un cliente:</h1>
          <PolizaClientes @actionSeleccionar="handleSelectCliente" />
        </div>
        <!-- Subagente -->
        <div class="mb-4" v-if="step == 4">
          <h1 class="w-full text-center mb-5">Selecciona un subagente:</h1>
          <div class="cardsWrapper">
            <div
              class="cardItem"
              v-for="(item, index) in Productos"
              :key="index"
              @click="handleSelectSubAgente(item)"
            >
              <span>{{ item.nombre }}</span>
            </div>
          </div>
        </div>
        <div class="d-flex justify-start align-center">
          <VBtn color="secondary" variant="outlined" @click="handleCancel">
            <VIcon start icon="tabler-alert-circle" />
            Cancelar
          </VBtn>
        </div>
      </div>
      <div v-if="step == 5">
        <ModuladorFormFactory
          :title="null"
          :isDialogVisible="false"
          :schema="formSchema"
          :modelValue="poliza"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </VCardText>
  </VCard>
</template>
