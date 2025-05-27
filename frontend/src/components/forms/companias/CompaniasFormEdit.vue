<script lang="ts" setup>
import FormFactory from "@/components/apps/FormFactory.vue";
import CompaniasProductos from "@/components/forms/companias/CompaniasProductos.vue";
import CompaniasRepresentantes from "@/components/forms/companias/CompaniasRepresentantesV1.vue";

import { showSuccessMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { customRequest } from "@/utils/axiosInstance";
// prettier-ignore
import { ref, watch } from "vue";
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "atras"): void;
}>();

const ramos: any = ref([]);
const currentTab = ref("tab1");
const formDataLocal = ref(props.data);

// prettier-ignore
const formSchema = [
  { label: "Nombre corto", type: "text", model: "nombreCorto", placeholder: "Ingresa el nombre" },
  { label: "Nombre", type: "text", model: "nombre", placeholder: "Ingresa el nombre" },
  { label: "RFC", type: "text", model: "rfc", placeholder: "Ingresa el nombre" },
  { label: "Direcciòn", type: "text", model: "direccion", placeholder: "Ingresa el nombre" },
  { label: "Colonia", type: "text", model: "colonia", placeholder: "Ingresa el nombre" },
  { label: "Codigo Postal", type: "text", model: "codigoPostal", placeholder: "Ingresa el nombre" },
  { label: "Estado", type: "text", model: "estado", placeholder: "Ingresa el nombre" },
  { label: "Ciudad", type: "text", model: "ciudad", placeholder: "Ingresa el nombre" },
  { label: "Limite Primer pago", type: "text", model: "limitePrimerPago", placeholder: "Ingresa el nombre" },
  { label: "Limite Primer Subsecuente", type: "text", model: "limitePrimerSubsecuente", placeholder: "Ingresa el nombre" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const handleAtras = () => {
  emit("atras");
};

const handleSelectRamo = (item: any) => {
  console.log("handleSelectRamo", item);
  item.isActivo = !item.isActivo;
  ramos.value = [...ramos.value];
  console.log("handleSelectRamo", ramos.value);
};

const handleFormSubmit = async (data: any) => {
  let response = await customRequest({
    url: "/api/companias/update",
    method: "POST",
    data: { ...data },
  });
  console.log("handleFormSubmit", response);
  showSuccessMessage({});
};

const getRamos = async () => {
  let response = await customRequest({
    url: "/api/companias/ramos",
    method: "POST",
    data: { compania_id: formDataLocal.value.id },
  });
  console.log("getRamos", response);
  ramos.value = response.data.data;
};

const handleUpdateRamos = async () => {
  let response = await customRequest({
    url: "/api/companias/ramos/update",
    method: "POST",
    data: {
      compania_id: formDataLocal.value.id,
      ramos: ramos.value,
    },
  });
  console.log("getRamos", response);
};

// prettier-ignore
watch(() => props.data , (newValue) => { formDataLocal.value = newValue } );
onMounted(() => {
  getRamos();
  console.log("onMounted", props.data);
});
</script>

<style lang="scss" scoped>
.cardItem {
  min-width: 25%;
  background-color: #f7f7f7;
  text-align: center;
  width: fit-content;
  margin: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.cardsWrapper {
  display: flex;
  flex-wrap: wrap;
}
</style>

<template>
  <div class="d-flex justify-start align-center mb-5">
    <VBtn
      icon="tabler-arrow-left"
      class="cursor-pointer"
      variant="text"
      color="secondary"
      @click="handleAtras"
    />
    <h1 class="ml-4">{{ props.data.nombre }}</h1>
  </div>
  <VCard>
    <VTabs v-model="currentTab">
      <VTab>Detalles</VTab>
      <VTab>Representantes</VTab>
      <VTab>Ramos</VTab>
      <VTab>Productos</VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem :value="`tab1`">
          <FormFactory
            ref="formFactoryRef"
            :schema="formSchema"
            :modelValue="formDataLocal"
            :isDialogVisible="false"
            @submit="handleFormSubmit"
            @cancel="handleAtras"
          />
        </VWindowItem>
        <VWindowItem :value="`tab2`">
          <CompaniasRepresentantes :data="formDataLocal" />
        </VWindowItem>
        <VWindowItem :value="`tab3`">
          <h1 class="ml-4">Ramos activos</h1>
          <div class="cardsWrapper">
            <div
              v-for="(item, i) in [...ramos]"
              :key="i"
              class="cardItem"
              @click="handleSelectRamo(item)"
            >
              <VCheckbox v-model="item.isActivo" :label="item.label" />
            </div>
          </div>

          <div class="d-flex justify-end align-center mt-4">
            <VBtn color="warning" @click="handleUpdateRamos">
              <VIcon start icon="tabler-edit" />
              actualizar
            </VBtn>
          </div>
        </VWindowItem>
        <VWindowItem :value="`tab4`">
          <CompaniasProductos :data="formDataLocal" />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
