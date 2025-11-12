<script lang="ts" setup>
// Props y eventos
const props = withDefaults(
  defineProps<{
    registroId: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "cancelar"): void;
  (event: "changePanel", idx?: any): void;
}>();

const asegurados = ref([
  {
    id: 7,
    cliente_id: 33,
    rfc: "CAQJ9406101G5",
    nombre: "Jesu Ramon Chavez Quirox",
    edad: "31",
    genero: "Hombre",
    fechaNacimiento: "1994-06-10T06:00:00.000Z",
    direccion: "La Laja, Acapulco, Guerrero, CP 39600",
    colonia: "La Laja",
    codigoPostal: "39600",
    estado_id: 13,
    ciudad: "Acapulco",
    correo: "de@de.com",
    telefono: null,
    celular: "7442077733",
    oficina: "7442077733",
    observaciones: null,
    created_at: "2025-11-10T04:00:02.000Z",
    updated_at: "2025-11-10T04:00:02.000Z",
  },
  {
    id: 7,
    cliente_id: 33,
    rfc: "CAQJ9406101G5",
    nombre: "Jesu Ramon Chavez Quirox",
    edad: "31",
    genero: "Hombre",
    fechaNacimiento: "1994-06-10T06:00:00.000Z",
    direccion: "La Laja, Acapulco, Guerrero, CP 39600",
    colonia: "La Laja",
    codigoPostal: "39600",
    estado_id: 13,
    ciudad: "Acapulco",
    correo: "de@de.com",
    telefono: null,
    celular: "7442077733",
    oficina: "7442077733",
    observaciones: null,
    created_at: "2025-11-10T04:00:02.000Z",
    updated_at: "2025-11-10T04:00:02.000Z",
  },
  {
    id: 7,
    cliente_id: 33,
    rfc: "CAQJ9406101G5",
    nombre: "Jesu Ramon Chavez Quirox",
    edad: "31",
    genero: "Hombre",
    fechaNacimiento: "1994-06-10T06:00:00.000Z",
    direccion: "La Laja, Acapulco, Guerrero, CP 39600",
    colonia: "La Laja",
    codigoPostal: "39600",
    estado_id: 13,
    ciudad: "Acapulco",
    correo: "de@de.com",
    telefono: null,
    celular: "7442077733",
    oficina: "7442077733",
    observaciones: null,
    created_at: "2025-11-10T04:00:02.000Z",
    updated_at: "2025-11-10T04:00:02.000Z",
  },
]);
const schemaAsegurado = [
  {
    label: "Fecha de nacimiento",
    type: "label",
    model: "fechaNacimiento",
    classElement: " col-3",
  },
  {
    label: "Edad",
    type: "label",
    model: "edad",
    classElement: " col-3",
  },
  {
    label: "Genero",
    type: "label",
    model: "genero",
    classElement: " col-3",
  },
  {
    label: "RFC",
    type: "rfc",
    model: "numeroPoliza",
    classElement: " col-3",
  },
  {
    label: "Correo electronico",
    type: "label",
    model: "correo",
    classElement: " col-3",
  },
  {
    label: "Celular",
    type: "label",
    model: "celular",
    classElement: " col-3",
  },
  {
    label: "Oficina",
    type: "label",
    model: "oficina",
    classElement: " col-3",
  },
  {
    label: "Direccion",
    type: "label",
    model: "direccion",
    classElement: " col-3",
  },
];
</script>

<template>
  <div class="w-full">
    <div class="d-flex mb-6">
      <VIcon :icon="'tabler-users'" size="40" />
      <h1 class="pl-4 my-auto fontBold">Asegurados</h1>
    </div>
    <div class="wFull gap-4 d-flex flex-column">
      <template v-for="(row, index) in asegurados" :key="index">
        <VCard class="rounded-lg text-sm">
          <div class="w-full">
            <div class="p-4 d-flex flex-justify ml-5 mt-4">
              <VAvatar
                :size="42"
                rounded="xl"
                color="secondary"
                variant="tonal"
              >
                <VIcon :icon="'tabler-users'" size="26" />
              </VAvatar>
              <h3 class="pl-4 my-auto fontBold">{{ row.nombre }}</h3>
            </div>
            <div class="w_100 mx-auto border-t border-gray mt-2" />
          </div>
          <div class="p30 pt-10 pb-12">
            <FormFactory
              :schema="schemaAsegurado"
              :formLive="true"
              :modelValue="row"
              :showButtonsAction="false"
            />
          </div>
        </VCard>
      </template>
    </div>
  </div>
</template>
