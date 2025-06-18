<script setup lang="ts">
definePage({
  meta: {
    requiresAuth: true,
    action: "read",
    subject: "Dashboard",
  },
});
import Multicotizaciones from "@/components/forms/cotizaciones/multicotizaciones.vue";
import SelectorCotizacion from "@/components/forms/cotizaciones/selectorCotizacion.vue";
import { ref } from "vue";

const isCotizar = ref(true);

const cotizaciones: any = ref({
  cotizacion1: {
    compania: {
      compania: "Plan Seguro",
      producto: "Plan Seguro Óptimo Plus",
    },
    configuracion: {
      titular: {
        nombre: "Jesus ramon",
        sexo: {
          label: "Hombre",
          id: "Hombre",
        },
        fechaNacimiento: "1994-05-02",
        localidad: {
          label: "Aguascalientes",
          id: 1,
        },
      },
      personas: [],
      inicio: "03/05/2025",
      fin: "03/05/2026",
      plan: {
        label: "Plan Seguro Óptimo Plus",
      },
      parametrosFlexibles: {
        sumaAsegurada: {
          label: " 3000 UMAM ",
          id: " 3000 UMAM ",
        },
        topeMaximo: {
          label: "$40,000",
          id: "$40,000",
        },
        deducible: {
          label: " 7 UMAM",
          id: "7 UMAM",
        },
        nivelHospitalario: {
          label: "Serie 300",
          id: "Serie 300",
        },
        frecuenciaPago: {
          label: "Trimestral",
          id: "Trimestral",
        },
        coaseguro: {
          label: "0%",
          id: "0%",
        },
        thq: {
          label: "36",
          id: "36",
        },
      },
      proteccionAdicional: {
        emergenciaExtranjero: true,
        atencionDental: true,
        indemnizacionDiariaSelect: {
          label: "500.00 por día",
          id: "500.00 por día",
        },
        reduccionCoaseguro: true,
        sumaAsegurada: {
          label: "SA 50,000 dlls",
          id: "SA 50,000 dlls",
        },
        atencionDentalSelect: {
          label: "Atención Dental Total",
          id: "Atención Dental Total",
        },
        coberturaExtranjero: true,
        indemnizacionDiaria: true,
        eliminacionDeducible: true,
      },
    },
    detalle: {
      resumen: {
        "Frecuencia de pago:": "Trimestral",
        "Primer Pago:": "$18,346.46",
        "Pagos Subsecuentes:": "$16,606.46",
        "Total:": "$68,165.79",
      },
      parametros_flexibles: {
        "Suma Asegurada:": "3000 UMAM ($10,318,380.00)",
        "Deducible:": "7 UMAM ($24,076.22):",
        "Coaseguro:": "0%",
        "Tope Máximo de Coaseguro:": "Sin tope",
        "Nivel Hospitalario:": "Serie 300",
        "T.H.Q.": "36 UMAM ($123,820.56)",
      },
      proteccion_con_costo: {
        "Emergencia en el Extranjero (EMER):": [
          "Suma Asegurada:",
          ": SA 50,000 dlls",
        ],
        "Cobertura en el Extranjero (CE):": ["Selección:", ": C"],
        "Atención Dental:": ["Selección", ": Atención Dental Total"],
        "Indemnización Diaria por Hospitalización por Accidente (IDHA):": [
          "Suma por día:",
          ": 500.00 por día",
        ],
        "Incremento de Suma Asegurada por Parto:": ["Selección", ": No"],
        "Reducción de Coaseguro por Padecimiento de Nariz por Accidente:": [
          "Selección",
          ": Sí",
        ],
        "Eliminación de Deducible por Accidente": ["Selección", ": Sí"],
        "Eliminación de Coaseguro por Accidente": ["Selección", ": No"],
      },
    },
  },
});

function handleSendToCotizar(configuiracion: any) {
  isCotizar.value = false;
}
</script>

<template>
  <div class="divBtnWrapper">
    <Multicotizaciones v-if="isCotizar" @cotizar="handleSendToCotizar" />
    <SelectorCotizacion v-else :cotizaciones="cotizaciones" />
  </div>
</template>

<style scoped></style>
