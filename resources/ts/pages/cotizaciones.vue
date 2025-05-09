<script setup lang="ts">
import { customRequest } from "@/utils/axiosInstance";
import Multicotizaciones from "@/components/forms/cotizaciones/multicotizaciones.vue";
async function fetchTableData() {
  try {
    const payload = {
      titular: {
        nombre: "Jesus ramon",
        sexo: {
          label: "Hombre",
          id: "Hombre",
        },
        fechaNacimiento: "2025-05-02",
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
          label: "1000 UMAM",
          id: "1000 UMAM",
        },
        topeMaximo: {
          label: "$40,000",
          id: "$40,000",
        },
        deducible: {
          label: "4 UMAM",
          id: "4 UMAM",
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
          label: "0 %",
          id: "0 %",
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
          label: "500.00 por dia",
          id: "500.00 por dia",
        },
        reduccionCoaseguro: true,
        sumaAsegurada: {
          label: "S.A. 50,000 dls",
          id: "S.A. 50,000 dls",
        },
        atencionDentalSelect: {
          label: "Atención Dental Total",
          id: "Atención Dental Total",
        },
        coberturaExtranjero: true,
        indemnizacionDiaria: true,
        eliminacionDeducible: true,
      },
    };

    const response = await customRequest({
      url: "/api/robot",
      method: "POST",
      data: payload,
    });
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}
</script>

<template>
  <div class="divBtnWrapper">
    <Multicotizaciones />
  </div>
</template>
