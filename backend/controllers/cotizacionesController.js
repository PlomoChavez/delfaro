const {
  findOne,
  getAllFrom,
  deleteById,
  createOrUpdate,
  queryWithRelations,
} = require("../db/functionsSQL");

const { escaparBarras } = require("../utils/helper");

exports.deleteCotizacion = async (req, res, catalogo) => {
  const id = req.body.id;
  const result = await deleteById("cotizaciones", id);
  res.json(result);
};

exports.getCompniasByRamo = async (req, res) => {
  try {
    const ramoId = req.body.ramo;
    if (!ramoId) {
      return res.json({
        result: false,
        message: "ramo es requerido",
        data: [],
      });
    }

    // 1. Trae todos los productos de compañías para el ramo solicitado

    const productos = await queryWithRelations({
      modelo: "companias_productos",
      filtros: {
        ramo_id: ramoId,
      },
    });

    // 2. Extrae los IDs únicos de las compañías que tienen productos en ese ramo
    const companiaIds = [...new Set(productos.map((p) => p.compania_id))];

    if (!companiaIds.length) {
      return res.json({
        result: true,
        message: "No hay compañías para ese ramo",
        data: [],
      });
    }

    // 3. Trae las compañías correspondientes
    const companias = await queryWithRelations({
      modelo: "compania",
      filtros: { id: { $in: companiaIds } },
    });

    // 4. Une productos a cada compañía
    const companiasConProductos = companias.map((compania) => ({
      ...compania,
      companias_productos: productos.filter(
        (p) => p.compania_id === compania.id
      ),
    }));

    return res.json({
      result: true,
      message: "Compañías obtenidas con éxito",
      data: companiasConProductos,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener las compañías: " + e.message,
      data: [],
    });
  }
};

exports.getAllCotizaciones = async (req, res) => {
  try {
    const queryData = await getAllFrom("cotizaciones");

    return res.json({
      result: true,
      message: "Registros obtenidos con éxito",
      data: queryData,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener los registros: " + e.message,
    });
  }
};

exports.createOrUpdateCotizacion = async (req, res) => {
  try {
    let data = { ...req.body };

    // Sanitizar y procesar la configuración
    if (data.configuracion) {
      data.configuracion = JSON.stringify(data.configuracion);
    }

    let tipoResponse = data.id ? false : "id";

    const response = await createOrUpdate({
      tabla: "cotizaciones",
      estatusDefault: false,
      data: { ...data },
      returnResponse: tipoResponse,
    });

    return res.json(response);
  } catch (e) {
    res.json({
      result: false,
      message: "Error al actualizar los productos: " + e.message,
    });
  }
};

// Función para sanitizar la configuración antes de guardarla
function sanitizeConfiguration(configuracion) {
  try {
    let config = configuracion;

    // Si es string, intentar parsearlo
    if (typeof config === "string") {
      try {
        config = JSON.parse(config);
      } catch (parseError) {
        console.warn(
          "Error al parsear configuración string:",
          parseError.message
        );
        // Si no se puede parsear, intentar reparar el JSON
        config = repairJsonString(config);
      }
    }

    // Si no es objeto después del procesamiento, crear objeto vacío
    if (typeof config !== "object" || config === null) {
      console.warn("Configuración no es objeto válido, usando objeto vacío");
      config = {};
    }

    // Limpiar el objeto de propiedades problemáticas
    config = cleanObjectForJSON(config);

    // Escapar barras invertidas si existe la función helper
    if (typeof escaparBarras === "function") {
      escaparBarras(config);
    }

    // Convertir a JSON string de forma segura
    return JSON.stringify(config, (key, value) => {
      // Filtrar propiedades problemáticas de Vue
      if (
        key.startsWith("__v_") ||
        key === "$" ||
        typeof value === "function"
      ) {
        return undefined;
      }

      // Manejar valores especiales
      if (value === undefined || (typeof value === "number" && isNaN(value))) {
        return null;
      }

      return value;
    });
  } catch (error) {
    console.error("Error en sanitizeConfiguration:", error);
    // En caso de error total, retornar JSON vacío
    return JSON.stringify({});
  }
}

// Función para limpiar objetos recursivamente
function cleanObjectForJSON(obj, seen = new WeakSet()) {
  // Prevenir referencias circulares
  if (obj !== null && typeof obj === "object") {
    if (seen.has(obj)) {
      return {}; // Retornar objeto vacío para referencias circulares
    }
    seen.add(obj);
  }

  // Si no es objeto, retornar tal como está
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  // Si es array
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObjectForJSON(item, seen));
  }

  // Si es objeto, procesar propiedades
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Saltar propiedades problemáticas
    if (
      key.startsWith("__v_") ||
      key === "$" ||
      key === "_isVue" ||
      typeof value === "function"
    ) {
      continue;
    }

    try {
      cleaned[key] = cleanObjectForJSON(value, seen);
    } catch (error) {
      console.warn(`Error procesando propiedad ${key}:`, error.message);
      // Si hay error con una propiedad, omitirla
      continue;
    }
  }

  return cleaned;
}

// Función para intentar reparar JSON strings corruptos
function repairJsonString(jsonString) {
  try {
    // Limpiar caracteres de control
    let cleaned = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    // Intentar parsear el string limpio
    let parsed = JSON.parse(cleaned);
    return parsed;
  } catch (repairError) {
    console.warn("No se pudo reparar el JSON string:", repairError.message);

    // Último intento: extraer lo que se pueda
    try {
      // Buscar patrones básicos y crear un objeto mínimo
      const basicData = {};

      // Intentar extraer titular si existe
      const titularMatch = jsonString.match(/"titular":\s*{[^}]+}/);
      if (titularMatch) {
        try {
          basicData.titular = JSON.parse(
            `{${titularMatch[0].split(":").slice(1).join(":")}}`
          );
        } catch (e) {
          // Ignorar si no se puede parsear
        }
      }

      return basicData;
    } catch (finalError) {
      console.error("Error final en reparación de JSON:", finalError);
      return {}; // Retornar objeto vacío como último recurso
    }
  }
}
