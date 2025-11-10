<template>
  <div class="">
    <h1 class="mb30">Confirma tu información</h1>
    <div class="w-full row">
      <VCard class="col-6 mx-auto">
        <VCardText>
          <div v-for="(section, idx) in sections" :key="idx" class="mb30">
            <div class="d-flex align-center justify-space-between mb-2">
              <h2 class="mb-3 flex items-center gap-2">
                <span :class="section.icono"></span>
                {{ section.title }}
              </h2>

              <i
                class="fa fa-pencil font22 icono-accion text-warning"
                aria-hidden="true"
                title="Editar"
                @click="handleAtras(idx)"
              />
            </div>
            <div class="w-full row">
              <div
                v-for="(field, fidx) in section.fields"
                :key="fidx"
                :class="`${field.cols} border-t pt-3`"
              >
                <p class="text-sm text-grey text-muted mb-0">
                  {{ field.label }}:
                </p>
                <p class="text-dark font-bold mb-0">{{ field.value }}</p>
              </div>
            </div>
          </div>
          <div class="wFull row">
            <VBtn
              variant="outlined"
              class="mr-auto"
              color="black"
              @click="$emit('cancelar')"
            >
              <VIcon start class="font-bold" icon="tabler-x" size="24" />
              Cancelar
            </VBtn>
            <VBtn variant="tonal" class="ml-auto" @click="$emit('continuar')">
              Emitir poliza
              <VIcon
                end
                class="font-bold"
                icon="tabler-chevron-right"
                size="24"
              />
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VCard, VCardText } from "vuetify/components";

const emit = defineEmits<{
  (event: "cancelar"): void;
  (event: "continuar"): void;
  (event: "back", idx: number): void;
}>();
const props = withDefaults(
  defineProps<{
    data?: any;
  }>(),
  {
    data: null,
  }
);

// prettier-ignore
function formatIdentificacion(data: any) {
  return data ? `${data.tipoIdentificacion ?? ""} - ${data.referenciaIdentificacion ?? ""}` : "";
}

// prettier-ignore
function handleAtras(idx: any) {
  emit("back", idx);
  console.log("Editar sección:", idx);
}

// prettier-ignore
function formatName(data: any) {
  return data ? [ data.nombre, data.segundoNombre, data.apellidoPaterno, data.apellidoMaterno, ] .filter(Boolean).join(" ") : "";
}

// prettier-ignore
function formatDomicilio(data: any) {
  return data ? [ data.calle, data.numeroExterior, data.codigoPostal, data.colonia, data.municipio, data.estado?.label, data.pais, ].filter(Boolean).join(", ") : "";
}

// Genera los campos para cada sección
// prettier-ignore
function getFields(data: any) {
  if (!data) return [];
  return [
    { label: "Nombre", value: formatName(data), cols: "col-12" },
    { label: "CURP", value: data.curp, cols: "col-6" },
    { label: "RFC", value: data.rfc, cols: "col-6" },
    { label: "Correo electrónico", value: data.correo, cols: "col-6" },
    { label: "Teléfono", value: data.telefono, cols: "col-6" },
    { label: "Fecha de nacimiento", value: data.fechaNacimiento, cols: "col-6"},
    { label: "Identificación", value: formatIdentificacion(data),cols: "col-6"},
    { label: "Domicilio", value: formatDomicilio(data), cols: "col-12" },
  ];
}
// prettier-ignore
function getFieldsCarro(data: any) {
  if (!data) return [];
  return [
    { label: "Conductor habitual", value: data.conductorHabitual, cols: "col-12" },
    { label: "Placas", value: data.placas, cols: "col-6" },
    { label: "Número de serie", value: data.numeroSerie, cols: "col-6" },
    { label: "Número de motor", value: data.numeroMotor, cols: "col-6" },
    { label: "Color", value: data.color, cols: "col-6" },
    { label: "Repuve", value: data.repuve, cols: "col-6" },
    { label: "Número económico", value: data.numeroEconomico, cols: "col-6" },
  ];
}

const sections = [
  {
    title: "Información del cliente",
    icono: "fa fa-user-tie fa-2x",
    fields: getFields(props.data?.cliente),
  },
  {
    title: "Información del asegurado",
    icono: "fa fa-user-shield fa-2x",
    fields: getFields(props.data?.asegurado),
  },
  {
    title: "Información del carro",
    icono: "fa fa-car fa-2x",
    fields: getFieldsCarro(props.data?.carro),
  },
];
</script>
