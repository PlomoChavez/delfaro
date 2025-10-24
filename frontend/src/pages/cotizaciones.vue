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
  // Si no hay configuración o ya es un objeto, retornarlo
  if (!configString || typeof configString === "object") {
    return configString || {};
  }

  try {
    // Primer intento: parseo directo
    return JSON.parse(configString);
  } catch (error) {
    console.error("Error en primer intento de parseo:", error);

    try {
      // Segundo intento: limpiar caracteres problemáticos
      let cleanConfig = configString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remover caracteres de control
        .replace(/\\/g, "\\\\") // Escapar backslashes
        .replace(/\n/g, "\\n") // Escapar saltos de línea
        .replace(/\r/g, "\\r") // Escapar retornos de carro
        .replace(/\t/g, "\\t") // Escapar tabs
        .trim(); // Remover espacios al inicio y final

      return JSON.parse(cleanConfig);
    } catch (secondError) {
      console.error("Error en segundo intento:", secondError);

      try {
        // Tercer intento: buscar el problema específico y corregirlo
        let fixedConfig = configString;

        // Intentar encontrar y corregir problemas comunes
        // 1. Comas faltantes antes de llaves
        fixedConfig = fixedConfig.replace(/}(\s*){/g, "},\n{");

        // 2. Comas faltantes antes de corchetes
        fixedConfig = fixedConfig.replace(/}(\s*)\[/g, "},\n[");

        // 3. Comillas dobles dentro de strings
        fixedConfig = fixedConfig.replace(
          /"([^"]*)"([^"]*)"([^"]*)"/g,
          '"$1\\"$2\\"$3"'
        );

        // 4. Limpiar caracteres invisibles más agresivamente
        fixedConfig = fixedConfig.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, "");

        return JSON.parse(fixedConfig);
      } catch (thirdError) {
        console.error("Error en tercer intento:", thirdError);

        // Último intento: usar una función más robusta
        try {
          // Intentar parsear como JavaScript en lugar de JSON estricto
          const result = Function(
            '"use strict"; return (' + configString + ")"
          )();
          return result;
        } catch (finalError) {
          console.error("Todos los intentos fallaron:", finalError);
          // Si todo falla, intentar al menos extraer partes válidas
          return tryPartialParse(configString);
        }
      }
    }
  }
}

function tryPartialParse(jsonString: string) {
  // Función auxiliar para intentar extraer datos parciales
  try {
    // Buscar patrones conocidos en el JSON
    const patterns = {
      titular: /"titular":\s*({[^}]+})/,
      vehiculo: /"vehiculo":\s*({[^}]+})/,
      companias: /"companias":\s*(\[[^\]]+\])/,
    };

    const result: any = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = jsonString.match(pattern);
      if (match) {
        try {
          result[key] = JSON.parse(match[1]);
        } catch (e) {
          console.warn(`No se pudo parsear ${key}:`, e);
        }
      }
    }

    return Object.keys(result).length > 0 ? result : {};
  } catch (error) {
    console.error("Error en parseo parcial:", error);
    return {};
  }
}

const handleActionsEdit = (dataRow: any) => {
  let tmp = deepToRaw(dataRow);

  tmp.configuracion = JSON.parse(tmp.configuracion);

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
