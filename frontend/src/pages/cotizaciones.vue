<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import Multicotizaciones from "@/components/forms/cotizaciones/multicotizaciones.vue";

const showWizard = ref(false); // Referencia al componente FormFactory
const showFormEdit = ref(false); // Referencia al componente FormFactory
const dataLocal: any = ref(null); // Referencia al componente FormFactory

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
  { title: "Últ. Modificación", key: "updated_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/cotizaciones", // Endpoint para obtener datos
  create: "/api/cotizaciones/create", // Endpoint para crear un elemento
  update: "/api/cotizaciones/update", // Endpoint para actualizar un elemento
  delete: "/api/cotizaciones/delete", // Endpoint para eliminar un elemento
};
function safeParseConfig(configString: any) {
  try {
    if (!configString) return {};

    // Sanitizar caracteres de control comunes
    let cleanConfig = configString
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remover caracteres de control
      .replace(/\\/g, "\\\\") // Escapar backslashes
      .replace(/\n/g, "\\n") // Escapar saltos de línea
      .replace(/\r/g, "\\r") // Escapar retornos de carro
      .replace(/\t/g, "\\t"); // Escapar tabs

    return JSON.parse(cleanConfig);
  } catch (error) {
    console.error("Error al parsear configuración:", error);
    console.log(
      "Configuración problemática:",
      configString.substring(960, 980)
    ); // Mostrar área problemática

    // Intentar una segunda vez con limpieza más agresiva
    try {
      let aggressiveClean = configString
        .replace(/[\x00-\x1F\x7F]/g, "") // Remover todos los caracteres de control ASCII
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ""); // Mantener solo caracteres imprimibles

      return JSON.parse(aggressiveClean);
    } catch (secondError) {
      console.error("Segundo intento falló:", secondError);
      return {}; // Retornar objeto vacío como fallback
    }
  }
}

const handleActionsEdit = (dataRow: any) => {
  let tmp = toRaw(dataRow);
  let tmpConfig = safeParseConfig(dataRow.configuracion);
  tmp.configuracion = tmpConfig;

  // Solo parsea si es string
  if (typeof tmp.configuracion == "string") {
    try {
      tmp.configuracion = JSON.parse(tmp.configuracion);
    } catch (e) {
      console.log("Error al parsear la configuración:", e);
      return;
    }
  }
  console.log("Editar acción:", tmp);
  dataLocal.value = tmp;
  showWizard.value = true;
};

const handleActionsCreate = () => {
  dataLocal.value = {}; // Reiniciar dataLocal para crear una nueva cotización
  showWizard.value = true;
};
const handleActionsCancel = () => {
  showWizard.value = false;
  showFormEdit.value = false;
};
</script>

<template>
  <div v-if="showWizard">
    <Multicotizaciones
      :registro="dataLocal"
      @cotizar="showWizard = false"
      @cancelar="handleActionsCancel"
    />
  </div>
  <div v-if="!showWizard && !showFormEdit">
    <CrudManager
      title="Cotizaciones"
      :formModal="true"
      :show-title="true"
      :emitEdit="true"
      :emitNew="true"
      :tableHeaders="tableHeaders"
      :filtroAgrupador="'compania.nombreCorto'"
      :filtroAgrupadorInicial="'Todos'"
      :apiEndpoints="apiEndpoints"
      @customEdit="handleActionsEdit"
      @customCreate="handleActionsCreate"
    />
  </div>
</template>
