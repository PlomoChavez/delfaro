/**
 * @fileoverview Utilidades helper para manipulación y formato de datos
 * @description Este módulo contiene funciones de utilidad para el procesamiento de datos,
 * incluyendo escape de caracteres, logging mejorado y formateo de objetos.
 */

/**
 * Escapa las barras invertidas en strings dentro de un objeto de forma recursiva.
 * Recorre todas las propiedades del objeto y si encuentra un string, reemplaza
 * cada barra invertida (\) con doble barra invertida (\\). Si encuentra un objeto
 * anidado, aplica la función recursivamente para procesar todos los niveles.
 * Útil para preparar datos que serán serializados o enviados a APIs que requieren
 * escape de caracteres especiales.
 * @param {Object} obj - El objeto al cual se le escaparán las barras invertidas
 */
function escaparBarras(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/\\/g, "\\\\");
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      escaparBarras(obj[key]);
    }
  }
}

/**
 * Imprime un objeto en la consola con formato mejorado y colores.
 * Utiliza console.dir con configuración para mostrar todos los niveles anidados
 * del objeto (depth: null) y con colores habilitados para mejor legibilidad.
 * Ideal para debugging y análisis de estructuras de datos complejas.
 * @param {any} obj - El objeto que se imprimirá en la consola
 */
function deepPrint(obj) {
  console.dir(obj, { depth: null, colors: true });
}

/**
 * Función asíncrona que reorganiza las propiedades de un objeto según su tipo de dato en un orden específico:
 * primero propiedades simples (string, number, boolean, null, Date), luego objetos, y finalmente arrays.
 * Itera sobre todas las propiedades del objeto data y las clasifica en tres grupos separados, después combina
 * estos grupos usando el operador spread para crear un nuevo objeto con el orden deseado. Es útil para normalizar
 * la estructura de datos en APIs, mejorar la legibilidad en logs, preparar datos para serialización y mantener
 * consistencia en el orden de propiedades en responses. Incluye logging de la data original y formateada para debugging.
 * @param {Object} data - El objeto que se va a formatear y reorganizar
 * @returns {Promise<Object>} Un nuevo objeto con las propiedades reorganizadas según el tipo
 */
async function formatearData(data) {
  let response = {};
  let propiedadesSimples = {};
  let propiedadesObjetos = {};
  let propiedadesArrays = {};

  // Iterar sobre todas las propiedades del objeto data
  for (const [key, value] of Object.entries(data)) {
    if (value === null || !(typeof value === "object")) {
      // Propiedades simples (string, number, boolean, null)
      propiedadesSimples[key] = value;
    } else if (Array.isArray(value)) {
      // Arrays
      propiedadesArrays[key] = value;
    } else if (value instanceof Date) {
      // Dates van con las propiedades simples
      propiedadesSimples[key] = value;
    } else {
      // Objetos
      propiedadesObjetos[key] = value;
    }
  }

  // Combinar en el orden específico: simples, objetos, arrays
  response = {
    ...propiedadesSimples,
    ...propiedadesObjetos,
    ...propiedadesArrays,
  };

  return response;
}

function traducirError(error, prefijo = "Error: ") {
  // Extraer el mensaje del error según su tipo
  let mensajeError;

  if (typeof error === "string") {
    mensajeError = error;
  } else if (error && error.message) {
    mensajeError = error.message;
  } else if (error && error.toString) {
    mensajeError = error.toString();
  } else {
    mensajeError = "Error desconocido en el procesamiento";
  }

  // Diccionario de traducciones de términos técnicos comunes
  const traducciones = {
    // Timeouts y esperas
    Timeout: "Tiempo de espera agotado",
    timeout: "Tiempo de espera agotado",
    "Timed out": "Tiempo de espera agotado",
    "timed out": "Tiempo de espera agotado",

    // Elementos no encontrados
    "Element not found": "Elemento no encontrado",
    "element not found": "Elemento no encontrado",
    "No such element": "Elemento no encontrado",
    "no such element": "Elemento no encontrado",
    "Unable to locate element": "No se pudo localizar el elemento",
    "unable to locate element": "No se pudo localizar el elemento",

    // Errores de red y conexión
    "Network error": "Error de conexión",
    "network error": "Error de conexión",
    "Connection refused": "Conexión rechazada",
    "connection refused": "Conexión rechazada",
    "Connection failed": "Conexión fallida",
    "connection failed": "Conexión fallida",
    "Connection timeout": "Tiempo de conexión agotado",
    "connection timeout": "Tiempo de conexión agotado",

    // Errores de página
    "Page not found": "Página no encontrada",
    "page not found": "Página no encontrada",
    "Page load timeout": "Tiempo de carga de página agotado",
    "page load timeout": "Tiempo de carga de página agotado",

    // Errores de sesión
    "Session expired": "Sesión expirada",
    "session expired": "Sesión expirada",
    "Session not found": "Sesión no encontrada",
    "session not found": "Sesión no encontrada",

    // Errores de validación
    "input must be a string": "El valor debe ser un texto válido",
    "Invalid selector": "Selector inválido",
    "invalid selector": "Selector inválido",
    "Invalid argument": "Argumento inválido",
    "invalid argument": "Argumento inválido",
    "Missing required parameter": "Falta parámetro requerido",
    "missing required parameter": "Falta parámetro requerido",

    // Errores de JavaScript
    ReferenceError: "Error de referencia",
    TypeError: "Error de tipo",
    SyntaxError: "Error de sintaxis",
    RangeError: "Error de rango",

    // Errores de browser/driver
    "WebDriver error": "Error del navegador",
    "webdriver error": "Error del navegador",
    "Browser not found": "Navegador no encontrado",
    "browser not found": "Navegador no encontrado",
    "Driver not found": "Controlador no encontrado",
    "driver not found": "Controlador no encontrado",

    // Errores específicos de Selenium
    StaleElementReferenceException: "Referencia de elemento obsoleta",
    ElementNotInteractableException: "Elemento no interactuable",
    ElementClickInterceptedException: "Click interceptado por otro elemento",
    NoSuchWindowException: "Ventana no encontrada",
    NoSuchFrameException: "Marco no encontrado",
  };

  // Aplicar traducciones si se encuentran palabras clave
  for (const [englishTerm, spanishTerm] of Object.entries(traducciones)) {
    if (mensajeError.toLowerCase().includes(englishTerm.toLowerCase())) {
      mensajeError = mensajeError.replace(
        new RegExp(englishTerm, "gi"),
        spanishTerm
      );
    }
  }

  return `${prefijo}${mensajeError}`;
}

function printDeep(
  obj,
  {
    label = "Objeto",
    maxDepth = null,
    showFunctions = false,
    showUndefined = true,
    colors = true,
    exclude = [], // Propiedades a excluir
    include = [], // Solo estas propiedades
  } = {}
) {
  const visited = new Set();

  function shouldIncludeProperty(key, value) {
    // Si hay lista de inclusión, solo mostrar esas propiedades
    if (include.length > 0 && !include.includes(key)) {
      return false;
    }

    // Excluir propiedades especificadas
    if (exclude.includes(key)) {
      return false;
    }

    // Filtrar funciones si no se desean
    if (!showFunctions && typeof value === "function") {
      return false;
    }

    // Filtrar undefined si no se desean
    if (!showUndefined && value === undefined) {
      return false;
    }

    return true;
  }

  function printValue(value, depth = 0, currentPath = "") {
    const indent = "  ".repeat(depth);

    // Controlar profundidad máxima
    if (maxDepth !== null && depth > maxDepth) {
      return colors
        ? "\x1b[90m[Max depth reached]\x1b[0m"
        : "[Max depth reached]";
    }

    // Manejar null y undefined
    if (value === null) {
      return colors ? "\x1b[90mnull\x1b[0m" : "null";
    }
    if (value === undefined) {
      return colors ? "\x1b[90mundefined\x1b[0m" : "undefined";
    }

    // Manejar primitivos
    if (typeof value === "string") {
      return colors ? `\x1b[32m"${value}"\x1b[0m` : `"${value}"`;
    }
    if (typeof value === "number") {
      return colors ? `\x1b[33m${value}\x1b[0m` : value.toString();
    }
    if (typeof value === "boolean") {
      return colors ? `\x1b[35m${value}\x1b[0m` : value.toString();
    }
    if (typeof value === "function") {
      const funcStr = value.toString().split("\n")[0];
      return colors
        ? `\x1b[36m[Function: ${funcStr}]\x1b[0m`
        : `[Function: ${funcStr}]`;
    }

    // Detectar referencias circulares
    if (typeof value === "object" && visited.has(value)) {
      return colors
        ? "\x1b[31m[Circular Reference]\x1b[0m"
        : "[Circular Reference]";
    }

    if (typeof value === "object") {
      visited.add(value);

      // Manejar arrays
      if (Array.isArray(value)) {
        if (value.length === 0) {
          visited.delete(value);
          return "[]";
        }

        let result = "[\n";
        value.forEach((item, index) => {
          if (shouldIncludeProperty(index.toString(), item)) {
            result += `${indent}  ${index}: ${printValue(
              item,
              depth + 1,
              `${currentPath}[${index}]`
            )},\n`;
          }
        });
        result += `${indent}]`;
        visited.delete(value);
        return result;
      }

      // Manejar objetos
      const keys = Object.keys(value);
      if (keys.length === 0) {
        visited.delete(value);
        return "{}";
      }

      let result = "{\n";
      keys.forEach((key) => {
        if (shouldIncludeProperty(key, value[key])) {
          const keyColor = colors ? `\x1b[34m${key}\x1b[0m` : key;
          result += `${indent}  ${keyColor}: ${printValue(
            value[key],
            depth + 1,
            `${currentPath}.${key}`
          )},\n`;
        }
      });
      result += `${indent}}`;
      visited.delete(value);
      return result;
    }

    return value.toString();
  }

  const labelColor = colors ? `\x1b[1m\x1b[36m${label}\x1b[0m` : label;
  console.log(`\n🔍 ${labelColor}:`);
  console.log(printValue(obj));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function extraerNumeroFlotante(cadenaConDinero) {
  if (!cadenaConDinero) {
    return 0;
  }

  // Convertir a string si no lo es
  const cadena = String(cadenaConDinero);

  // Remover símbolos de moneda ($, €, etc.), comas y espacios
  // Mantener solo números, puntos y guiones (para negativos)
  const numeroLimpio = cadena
    .replace(/[$€£¥₹₽¢]/g, "") // Símbolos de moneda comunes
    .replace(/[,\s]/g, "") // Comas y espacios
    .replace(/[^\d.-]/g, ""); // Todo excepto dígitos, puntos y guiones

  // Convertir a número flotante
  const numero = parseFloat(numeroLimpio);

  // Retornar 0 si no es un número válido
  return isNaN(numero) ? 0 : numero;
}

module.exports = {
  escaparBarras,
  deepPrint,
  printDeep,
  deepClone,
  formatearData,
  traducirError,
  extraerNumeroFlotante,
};
