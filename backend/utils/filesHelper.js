const fs = require("fs");
const path = require("path");
const os = require("os");
require("dotenv").config();
const AdmZip = require("adm-zip");
const { PDFDocument } = require("pdf-lib");

// ========================================
// 📄 FUNCIONES DE MERGE PDF
// Combinan múltiples archivos PDF en uno solo
// ========================================

/**
 * 📄 Combina múltiples archivos PDF en uno solo
 * @param {Object} options - Opciones de configuración
 * @param {string} options.archivoSalida - Ruta completa del archivo PDF resultante
 * @param {Array|string} options.archivosEntrada - Array de rutas o carpeta con PDFs
 * @param {string} options.carpeta - Carpeta que contiene los PDFs (si no se especifican archivos)
 * @param {boolean} options.logs - Mostrar logs (por defecto false)
 * @param {string} options.patronArchivos - Patrón para filtrar archivos (por defecto "*.pdf")
 * @param {boolean} options.eliminarOriginales - Eliminar archivos originales después del merge (por defecto false)
 * @param {boolean} options.crearCarpetaSalida - Crear carpeta de salida si no existe (por defecto true)
 * @returns {Object} Resultado de la operación
 */

async function mergePDFs(options = {}) {
  let {
    archivoOriginal,
    archivosMerge,
    newName = null,
    orden = "asc",
    reubicar = null,
    eliminarOriginal = false,
    logs = false,
  } = options;

  if (logs) {
    console.log("📄 Iniciando merge de archivos PDF...");
  }

  try {
    // ✅ PASO 1: Validar parámetros
    if (!archivoOriginal) {
      return {
        result: false,
        error: "Se debe especificar la ruta del archivo original",
      };
    }

    if (!existeArchivo(archivoOriginal)) {
      return {
        result: false,
        error: `Archivo original no existe: ${archivoOriginal}`,
      };
    }

    if (Array.isArray(archivosMerge) || typeof archivosMerge === "string") {
      archivosMerge =
        typeof archivosMerge === "string" ? [archivosMerge] : archivosMerge;
    } else {
      archivosMerge = null;
    }

    if (!archivosMerge) {
      return {
        result: false,
        error: "archivosMerge debe ser un string o un array de strings",
      };
    }

    // Validar que todos los archivos de merge existen
    for (const archivo of archivosMerge) {
      if (!existeArchivo(archivo)) {
        return {
          result: false,
          error: `Archivo de merge no existe: ${archivo}`,
        };
      }
    }

    const todosLosArchivos =
      orden === "asc"
        ? [...archivosMerge, archivoOriginal]
        : [archivoOriginal, ...archivosMerge];

    if (logs) {
      console.log(
        `📋 Archivos a procesar (orden: ${orden}):`,
        todosLosArchivos.length
      );
      todosLosArchivos.forEach((archivo, index) => {
        console.log(`   ${index + 1}. ${path.basename(archivo)}`);
      });
    }

    // ✅ PASO 2: Crear documento PDF combinado usando pdf-lib
    const pdfCombinado = await PDFDocument.create();
    const archivosIncluidos = [];
    const erroresProcesamiento = [];

    for (let i = 0; i < todosLosArchivos.length; i++) {
      const rutaArchivo = todosLosArchivos[i];
      const esOriginal = rutaArchivo === archivoOriginal;
      const tipoArchivo = esOriginal ? "original" : "merge";

      try {
        if (logs) {
          console.log(
            `📄 Procesando (${tipoArchivo}): ${path.basename(rutaArchivo)}`
          );
        }

        // Leer el archivo PDF
        const archivoBytes = fs.readFileSync(rutaArchivo);
        const pdfOriginal = await PDFDocument.load(archivoBytes);

        // Obtener todas las páginas del PDF
        const indicePaginas = pdfOriginal.getPageIndices();
        const paginas = await pdfCombinado.copyPages(
          pdfOriginal,
          indicePaginas
        );

        // Agregar páginas al documento combinado
        paginas.forEach((pagina) => pdfCombinado.addPage(pagina));

        archivosIncluidos.push({
          archivo: path.basename(rutaArchivo),
          rutaCompleta: rutaArchivo,
          paginas: pdfOriginal.getPageCount(),
          tamaño: fs.statSync(rutaArchivo).size,
          tipo: tipoArchivo,
          orden: i + 1,
        });

        if (logs) {
          console.log(`   ✅ Incluido: ${pdfOriginal.getPageCount()} páginas`);
        }
      } catch (error) {
        erroresProcesamiento.push({
          archivo: path.basename(rutaArchivo),
          rutaCompleta: rutaArchivo,
          error: error.message,
          tipo: tipoArchivo,
        });

        if (logs) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }

    // ✅ PASO 3: Validar que al menos un archivo se procesó
    if (archivosIncluidos.length === 0) {
      return {
        result: false,
        error: "No se pudo procesar ningún archivo PDF",
        errores: erroresProcesamiento,
      };
    }

    // ✅ PASO 4: Determinar nombre del archivo de salida
    let nombreArchivo;
    if (newName && typeof newName === "string" && newName.trim() !== "") {
      // Usar el nombre personalizado, agregar .pdf si no lo tiene
      nombreArchivo = newName.endsWith(".pdf") ? newName : `${newName}.pdf`;
      if (logs) {
        console.log(`📝 Usando nombre personalizado: ${nombreArchivo}`);
      }
    } else {
      // Usar el nombre del archivo original (sin cambios)
      nombreArchivo = path.basename(archivoOriginal);
      if (logs) {
        console.log(`📝 Manteniendo nombre original: ${nombreArchivo}`);
      }
    }

    // ✅ PASO 5: Determinar directorio de destino
    let directorioDestino;
    if (reubicar && typeof reubicar === "string" && reubicar.trim() !== "") {
      // Validar que la ruta de reubicación existe o se puede crear
      if (existeCarpeta(reubicar)) {
        directorioDestino = reubicar;
        if (logs) {
          console.log(`📁 Reubicando a: ${directorioDestino}`);
        }
      } else {
        // Intentar crear la carpeta
        const resultadoCreacion = crearCarpeta(reubicar, {
          logs: false,
          recursive: true,
        });
        if (resultadoCreacion.result) {
          directorioDestino = reubicar;
          if (logs) {
            console.log(
              `📁 Carpeta creada y reubicando a: ${directorioDestino}`
            );
          }
        } else {
          if (logs) {
            console.log(
              `⚠️ No se pudo crear carpeta de reubicación, usando directorio original`
            );
          }
          directorioDestino = path.dirname(archivoOriginal);
        }
      }
    } else {
      // Usar el directorio del archivo original
      directorioDestino = path.dirname(archivoOriginal);
      if (logs) {
        console.log(`📁 Usando directorio original: ${directorioDestino}`);
      }
    }

    // ✅ PASO 6: Generar ruta completa de salida
    const archivoSalida = path.join(directorioDestino, nombreArchivo);

    // ✅ PASO 7: Guardar archivo combinado
    if (logs) {
      console.log(`💾 Guardando archivo combinado: ${archivoSalida}`);
    }

    const pdfBytes = await pdfCombinado.save();

    const resultadoEscritura = escribirArchivo(archivoSalida, pdfBytes, {
      logs: false,
      encoding: null, // Binario para PDF
    });

    if (!resultadoEscritura.result) {
      return {
        result: false,
        error: `Error guardando archivo: ${resultadoEscritura.error}`,
      };
    }

    // ✅ PASO 8: Eliminar archivo original si está habilitado
    let archivoOriginalEliminado = false;
    let errorEliminacion = null;

    if (eliminarOriginal && archivoSalida !== archivoOriginal) {
      try {
        const resultadoEliminacion = await eliminarArchivo(archivoOriginal, {
          logs,
        });

        if (resultadoEliminacion.result) {
          archivoOriginalEliminado = true;
          if (logs) {
            console.log(
              `🗑️ Archivo original eliminado: ${path.basename(archivoOriginal)}`
            );
          }
        } else {
          errorEliminacion = resultadoEliminacion.error;
          if (logs) {
            console.log(
              `⚠️ No se pudo eliminar archivo original: ${errorEliminacion}`
            );
          }
        }
      } catch (error) {
        errorEliminacion = error.message;
        if (logs) {
          console.log(
            `⚠️ Error eliminando archivo original: ${errorEliminacion}`
          );
        }
      }
    } else if (eliminarOriginal && archivoSalida === archivoOriginal) {
      if (logs) {
        console.log(
          `⚠️ No se puede eliminar archivo original: es el mismo archivo de salida`
        );
      }
      errorEliminacion = "El archivo de salida es el mismo que el original";
    }

    // ✅ PASO 9: RETURN EXITOSO CORRECTO
    const totalPaginas = archivosIncluidos.reduce(
      (sum, archivo) => sum + archivo.paginas,
      0
    );

    if (logs) {
      console.log("\n📊 RESUMEN DEL MERGE:");
      console.log(`   📄 Archivos procesados: ${archivosIncluidos.length}`);
      console.log(`   📋 Total de páginas: ${totalPaginas}`);
      console.log(`   💾 Archivo de salida: ${path.basename(archivoSalida)}`);
      console.log(`   📁 Directorio: ${directorioDestino}`);
      console.log(
        `   📐 Tamaño final: ${fs.statSync(archivoSalida).size} bytes`
      );

      if (eliminarOriginal) {
        if (archivoOriginalEliminado) {
          console.log(`   🗑️ Archivo original eliminado exitosamente`);
        } else if (errorEliminacion) {
          console.log(`   ⚠️ Error eliminando original: ${errorEliminacion}`);
        }
      }

      if (erroresProcesamiento.length > 0) {
        console.log(`   ❌ Errores: ${erroresProcesamiento.length}`);
      }
    }

    return {
      result: true,
      archivoSalida,
      archivoOriginal,
      archivosMerge: archivosMerge,
      archivosIncluidos,
      totalArchivos: archivosIncluidos.length,
      totalPaginas,
      tamaño: fs.statSync(archivoSalida).size,
      directorio: directorioDestino,
      nombrePersonalizado: newName && typeof newName === "string",
      reubicado: reubicar && typeof reubicar === "string",
      archivoOriginalEliminado,
      errorEliminacion,
      erroresProcesamiento,
      message: "Merge de PDFs completado exitosamente",
    };
  } catch (error) {
    if (logs) {
      console.log("❌ Error general en merge de PDFs:", error.message);
    }

    return {
      result: false,
      error: error.message,
    };
  }
}
// ========================================
// 📦 FUNCIONES DE COMPRESIÓN/DESCOMPRESIÓN
// Manejan archivos ZIP y comprimidos
// ========================================

/**
 * 📦 Descomprime un archivo ZIP genérico
 * @param {string} rutaArchivo - Ruta del archivo ZIP a descomprimir
 * @param {string} rutaDestino - Carpeta donde extraer los archivos
 * @param {boolean} logs - Mostrar logs durante el proceso (por defecto false)
 * @returns {Object} Resultado de la operación con detalles
 */
function descomprimirArchivo(rutaArchivo, rutaDestino, logs = false) {
  if (logs) {
    console.log("📦 Iniciando descompresión...");
    console.log("📁 Archivo:", rutaArchivo);
    console.log("📂 Destino:", rutaDestino);
  }

  try {
    // ✅ PASO 1: Verificar que el archivo ZIP existe
    if (!existeArchivo(rutaArchivo, { logs })) {
      return {
        result: false,
        error: `El archivo ZIP no existe: ${rutaArchivo}`,
        rutaArchivo,
        rutaDestino,
      };
    }

    // ✅ PASO 2: Crear carpeta de destino
    const resultadoCarpeta = crearCarpeta(rutaDestino, {
      logs,
      recursive: true,
    });
    if (!resultadoCarpeta.result) {
      return {
        result: false,
        error: `Error creando carpeta destino: ${resultadoCarpeta.error}`,
        rutaArchivo,
        rutaDestino,
      };
    }

    // ✅ PASO 3: Cargar y leer el archivo ZIP
    const zip = new AdmZip(rutaArchivo);
    const zipEntries = zip.getEntries();

    if (logs) {
      console.log(`📋 Archivos encontrados en el ZIP: ${zipEntries.length}`);
    }

    const archivosExtraidos = [];
    const erroresExtracciones = [];

    // ✅ PASO 4: Extraer cada archivo
    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        const nombreArchivo = entry.entryName;
        const rutaArchivoDestino = path.join(rutaDestino, nombreArchivo);

        if (logs) {
          console.log(`📄 Extrayendo: ${nombreArchivo}`);
        }

        try {
          // Escribir archivo usando función genérica
          const resultadoEscritura = escribirArchivo(
            rutaArchivoDestino,
            entry.getData(),
            {
              logs: false,
              encoding: null, // Binario
              crearCarpetaAuto: true,
            }
          );

          if (resultadoEscritura.result) {
            archivosExtraidos.push({
              nombreOriginal: nombreArchivo,
              rutaCompleta: rutaArchivoDestino,
              tamañoOriginal: entry.header.size,
              tamañoFinal: resultadoEscritura.tamaño,
            });
          } else {
            erroresExtracciones.push({
              archivo: nombreArchivo,
              error: resultadoEscritura.error,
            });
          }
        } catch (extractError) {
          erroresExtracciones.push({
            archivo: nombreArchivo,
            error: extractError.message,
          });
        }
      }
    }

    if (logs) {
      console.log(`✅ Descompresión completada`);
      console.log(`📄 Archivos extraídos: ${archivosExtraidos.length}`);

      if (erroresExtracciones.length > 0) {
        console.log(`⚠️ Errores: ${erroresExtracciones.length}`);
        erroresExtracciones.forEach((error) => {
          console.log(`   - ${error.archivo}: ${error.error}`);
        });
      }
    }

    return {
      result: true,
      rutaArchivo,
      rutaDestino,
      carpetaCreada: resultadoCarpeta.creada,
      archivosExtraidos,
      totalArchivos: archivosExtraidos.length,
      erroresExtracciones,
      totalErrores: erroresExtracciones.length,
      message: "Descompresión completada exitosamente",
    };
  } catch (error) {
    if (logs) {
      console.log("❌ Error general descomprimiendo:", error.message);
    }

    return {
      result: false,
      error: error.message,
      rutaArchivo,
      rutaDestino,
    };
  }
}

// ========================================
// 🔍 FUNCIONES DE VERIFICACIÓN
// Verifican existencia de archivos y carpetas
// ========================================

/**
 * 🔍 Verifica si un archivo específico existe (no carpetas)
 * @param {string} rutaArchivo - Ruta del archivo
 * @param {Object} options - Opciones
 * @param {boolean} options.logs - Mostrar logs (por defecto false)
 * @returns {boolean} true si el archivo existe
 */
function existeArchivo(rutaArchivo, options = {}) {
  const { logs = false } = options;

  try {
    const existe =
      fs.existsSync(rutaArchivo) && fs.statSync(rutaArchivo).isFile();

    if (logs) {
      if (existe) {
        console.log(`✅ Archivo existe: ${rutaArchivo}`);
      } else {
        console.log(`❌ Archivo no existe: ${rutaArchivo}`);
      }
    }

    return existe;
  } catch (error) {
    if (logs) {
      console.log(`❌ Error verificando archivo: ${error.message}`);
    }
    return false;
  }
}

/**
 * 🔍 Verifica si una carpeta específica existe (no archivos)
 * @param {string} rutaCarpeta - Ruta de la carpeta
 * @param {Object} options - Opciones
 * @param {boolean} options.logs - Mostrar logs (por defecto false)
 * @param {boolean} options.crearSiNoExiste - Crear carpeta si no existe (por defecto false)
 * @param {boolean} options.recursive - Crear carpetas padre si no existen (por defecto true)
 * @returns {boolean} true si la carpeta existe o fue creada
 */
function existeCarpeta(rutaCarpeta, options = {}) {
  const { logs = false, crearSiNoExiste = false, recursive = true } = options;

  try {
    const existe =
      fs.existsSync(rutaCarpeta) && fs.statSync(rutaCarpeta).isDirectory();

    if (existe) {
      if (logs) {
        console.log(`✅ Carpeta existe: ${rutaCarpeta}`);
      }
      return true;
    }

    // Si no existe y está habilitada la opción de crear
    if (!existe && crearSiNoExiste) {
      if (logs) {
        console.log(`📁 Carpeta no existe, creando: ${rutaCarpeta}`);
      }

      const resultadoCreacion = crearCarpeta(rutaCarpeta, {
        logs: false,
        recursive,
      });

      if (resultadoCreacion.result) {
        if (logs) {
          console.log(`✅ Carpeta creada exitosamente: ${rutaCarpeta}`);
        }
        return true;
      } else {
        if (logs) {
          console.log(`❌ Error creando carpeta: ${resultadoCreacion.error}`);
        }
        return false;
      }
    }

    // Si no existe y no está habilitada la creación automática
    if (logs) {
      console.log(`❌ Carpeta no existe: ${rutaCarpeta}`);
    }
    return false;
  } catch (error) {
    if (logs) {
      console.log(`❌ Error verificando carpeta: ${error.message}`);
    }
    return false;
  }
}

/**
 * 🔍 Verifica si cualquier ruta existe (archivo o carpeta)
 * @param {string} ruta - Ruta a verificar
 * @param {Object} options - Opciones
 * @param {boolean} options.logs - Mostrar logs (por defecto false)
 * @returns {boolean} true si la ruta existe
 */
function existeRuta(ruta, options = {}) {
  const { logs = false } = options;

  try {
    const existe = fs.existsSync(ruta);

    if (logs) {
      if (existe) {
        const tipo = fs.statSync(ruta).isDirectory() ? "Carpeta" : "Archivo";
        console.log(`✅ ${tipo} existe: ${ruta}`);
      } else {
        console.log(`❌ Ruta no existe: ${ruta}`);
      }
    }

    return existe;
  } catch (error) {
    if (logs) {
      console.log(`❌ Error verificando ruta: ${error.message}`);
    }
    return false;
  }
}

// ========================================
// 📁 FUNCIONES DE CREACIÓN
// Crean carpetas y estructuras de directorios
// ========================================

/**
 * 📁 Crea carpetas con opción recursiva y manejo de errores
 * @param {string} rutaCarpeta - Ruta de la carpeta a crear
 * @param {Object} options - Opciones
 * @param {boolean} options.logs - Mostrar logs (por defecto false)
 * @param {boolean} options.recursive - Crear carpetas padre si no existen (por defecto true)
 * @returns {Object} Resultado de la operación
 */
function crearCarpeta(rutaCarpeta, options = {}) {
  const { logs = false, recursive = true } = options;

  try {
    if (!fs.existsSync(rutaCarpeta)) {
      fs.mkdirSync(rutaCarpeta, { recursive });

      if (logs) {
        console.log(`📁 Carpeta creada: ${rutaCarpeta}`);
      }

      return {
        result: true,
        rutaCarpeta,
        creada: true,
        message: "Carpeta creada exitosamente",
      };
    } else {
      if (logs) {
        console.log(`📁 Carpeta ya existe: ${rutaCarpeta}`);
      }

      return {
        result: true,
        rutaCarpeta,
        creada: false,
        message: "Carpeta ya existe",
      };
    }
  } catch (error) {
    if (logs) {
      console.log(`❌ Error creando carpeta: ${error.message}`);
    }

    return {
      result: false,
      error: error.message,
      rutaCarpeta,
    };
  }
}

// ========================================
// 📝 FUNCIONES DE ESCRITURA
// Escriben y guardan archivos
// ========================================

/**
 * 📝 Escribe contenido a archivos con auto-creación de carpetas
 * @param {string} rutaArchivo - Ruta donde escribir el archivo
 * @param {*} contenido - Contenido a escribir
 * @param {Object} options - Opciones
 * @param {boolean} options.logs - Mostrar logs (por defecto false)
 * @param {string} options.encoding - Encoding del archivo (por defecto null para binario)
 * @param {boolean} options.crearCarpetaAuto - Crear carpetas padre si no existen (por defecto true)
 * @returns {Object} Resultado de la operación
 */
function escribirArchivo(rutaArchivo, contenido, options = {}) {
  const { logs = false, encoding = null, crearCarpetaAuto = true } = options;

  try {
    // Crear carpeta padre si es necesario
    if (crearCarpetaAuto) {
      const carpetaPadre = path.dirname(rutaArchivo);
      const resultadoCarpeta = crearCarpeta(carpetaPadre, { logs: false });

      if (!resultadoCarpeta.result) {
        return {
          result: false,
          error: `Error creando carpeta padre: ${resultadoCarpeta.error}`,
          rutaArchivo,
        };
      }
    }

    fs.writeFileSync(rutaArchivo, contenido, encoding);

    if (logs) {
      const tamaño = fs.statSync(rutaArchivo).size;
      console.log(`💾 Archivo escrito: ${rutaArchivo} (${tamaño} bytes)`);
    }

    return {
      result: true,
      rutaArchivo,
      tamaño: fs.statSync(rutaArchivo).size,
      message: "Archivo escrito exitosamente",
    };
  } catch (error) {
    if (logs) {
      console.log(`❌ Error escribiendo archivo: ${error.message}`);
    }

    return {
      result: false,
      error: error.message,
      rutaArchivo,
    };
  }
}

// ========================================
// 🗑️ FUNCIONES DE ELIMINACIÓN
// Eliminan archivos del sistema
// ========================================

/**
 * 🗑️ Elimina archivos con verificación previa de existencia
 * @param {string} rutaArchivo - Ruta del archivo a eliminar
 * @param {Object} options - Opciones
 * @param {boolean} options.logs - Mostrar logs (por defecto false)
 * @returns {Object} Resultado de la operación
 */
async function eliminarArchivo(rutaArchivo, options = {}) {
  const { logs = false } = options;

  try {
    if (!existeArchivo(rutaArchivo)) {
      return {
        result: false,
        error: `Archivo no existe: ${rutaArchivo}`,
        rutaArchivo,
      };
    }

    fs.unlinkSync(rutaArchivo);

    if (logs) {
      console.log(`🗑️ Archivo eliminado: ${rutaArchivo}`);
    }

    return {
      result: true,
      rutaArchivo,
      message: "Archivo eliminado exitosamente",
    };
  } catch (error) {
    if (logs) {
      console.log(`❌ Error eliminando archivo: ${error.message}`);
    }

    return {
      result: false,
      error: error.message,
      rutaArchivo,
    };
  }
}

// ========================================
// 🌐 FUNCIONES DE CONVERSIÓN/URL
// Convierten rutas a URLs públicas
// ========================================

/**
 * 🌐 Convierte ruta absoluta a URL pública del servidor
 * @param {string} absolutePath - Ruta absoluta del archivo
 * @returns {string|null} URL pública o null si no contiene /files/
 */
async function filePathToPublicUrl(absolutePath) {
  // Busca la parte después de /files/
  const idx = absolutePath.indexOf(path.sep + "files" + path.sep);
  if (idx === -1) return null;
  // Obtiene la ruta relativa a /files
  const relativePath = absolutePath.substring(idx + 1); // +1 para quitar el primer slash
  // Usa la variable de entorno API_URL o un valor por defecto
  const baseUrl = process.env.API_URL || "http://localhost:3000";
  // Convierte los separadores de carpeta a "/"
  const urlPath = relativePath.split(path.sep).join("/");
  return `${baseUrl}/${urlPath}`;
}

// ========================================
// ⏰ FUNCIONES DE ESPERA/POLLING
// Esperan eventos o cambios en el sistema de archivos
// ========================================

/**
 * ⏰ Espera que aparezca un archivo con patrón específico (polling)
 * @param {string} dir - Directorio donde esperar el archivo
 * @param {RegExp} pattern - Patrón regex para el nombre del archivo
 * @param {number} timeout - Tiempo límite en ms (por defecto 20000)
 * @returns {string} Ruta completa del archivo encontrado
 * @throws {Error} Si no encuentra el archivo en el tiempo límite
 */
async function esperarDescargaArchivo(dir, pattern, timeout = 20000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const files = fs.readdirSync(dir);
    const file = files.find((f) => pattern.test(f));
    if (file) return path.join(dir, file);
    await new Promise((res) => setTimeout(res, 500));
  }
  throw new Error("Archivo no descargado en el tiempo esperado");
}

// ========================================
// 🔄 FUNCIONES DE MANIPULACIÓN
// Mueven, renombran y manipulan archivos
// ========================================

/**
 * 🔄 Mueve/renombra archivos usando fs.promises.rename
 * @param {string} oldPath - Ruta actual del archivo
 * @param {string} newPath - Nueva ruta (incluyendo el nuevo nombre)
 */
async function moverYRenombrarArchivo(oldPath, newPath) {
  await fs.promises.rename(oldPath, newPath);
}

// ========================================
// 📍 FUNCIONES DE RUTAS/PATHS
// Generan y manipulan rutas del sistema
// ========================================

/**
 * 📍 Obtiene el directorio actual (__dirname)
 * @returns {string} Directorio actual del script
 */
async function currentPath() {
  return __dirname;
}

/**
 * 📍 Ruta específica a carpeta de cotizaciones del proyecto
 * @param {string|Array} folders - Subcarpetas adicionales (opcional)
 * @returns {string} Ruta completa a la carpeta de cotizaciones
 */
async function getPathFolderCotizaciones(folders = null) {
  let tmp = await currentPath();
  tmp = path.join(tmp, "../", "files", "cotizaciones");
  if (folders) {
    if (Array.isArray(folders)) {
      tmp = path.join(tmp, ...folders);
    } else if (typeof folders === "string") {
      tmp = path.join(tmp, folders);
    }
  }
  return tmp;
}
/**
 * 📍 Ruta específica a carpeta de cotizaciones del proyecto
 * @param {string|Array} folders - Subcarpetas adicionales (opcional)
 * @returns {string} Ruta completa a la carpeta de cotizaciones
 */
async function getPathFolderFiles(folders = null) {
  let tmp = await currentPath();
  tmp = path.join(tmp, "../", "files");
  if (folders) {
    if (Array.isArray(folders)) {
      tmp = path.join(tmp, ...folders);
    } else if (typeof folders === "string") {
      tmp = path.join(tmp, folders);
    }
  }
  return tmp;
}

/**
 * 📍 Resuelve ruta absoluta de archivo (wrapper de path.resolve)
 * @param {string} dir - Directorio base
 * @param {string} fileName - Nombre del archivo
 * @returns {string} Ruta absoluta completa
 */
async function obtenerPathArchivo(dir, fileName) {
  return path.resolve(dir, fileName);
}

/**
 * 📍 Construye ruta al directorio home del usuario
 * @param {string|Array} folder - Carpeta(s) dentro del home (por defecto "Downloads")
 * @returns {string} Ruta completa al directorio en home
 */
async function getPath(folder = "Downloads") {
  if (Array.isArray(folder)) {
    return path.join(os.homedir(), ...folder);
  }
  return path.join(os.homedir(), folder);
}

// Al inicio del archivo
function obtenerRutaBackendFiles(...subcarpetas) {
  return path.join(process.cwd(), "files", ...subcarpetas);
}

/**
 * 📍 Construye rutas genéricas usando path.join
 * @param {string|Array} folder - Carpeta(s) a unir (por defecto "Downloads")
 * @returns {string} Ruta construida
 */
async function createNewPath(folder = "Downloads") {
  if (Array.isArray(folder)) {
    return path.join(...folder);
  }
  return path.join(folder);
}

const handleFilePostMulter = (options = {}) => {
  const { folderContenedor, newFileName, file } = options;

  if (!file) {
    throw new Error("El archivo es obligatorio.");
  }

  // Crear la carpeta si no existe
  if (!fs.existsSync(folderContenedor)) {
    fs.mkdirSync(folderContenedor, { recursive: true });
  }

  // Obtener la extensión del archivo
  const fileExtension = path.extname(file.originalname);

  // Determinar el nombre final del archivo
  const finalFileName = newFileName
    ? `${newFileName}${fileExtension}` // Si hay un nuevo nombre, úsalo
    : file.originalname; // Si no, usa el nombre original

  // Ruta final del archivo
  const finalFilePath = path.join(folderContenedor, finalFileName);

  // Mover el archivo a la carpeta de destino
  fs.renameSync(file.path, finalFilePath);

  // Convertir la ruta absoluta en una ruta relativa
  const relativeFolder = `.${path.sep}${path.relative(
    process.cwd(),
    folderContenedor
  )}`;

  // Retornar información del archivo procesado
  return {
    originalName: file.originalname,
    finalName: finalFileName,
    finalPath: finalFilePath,
    folder: relativeFolder, // Ruta relativa
  };
};

// ========================================
// 📦 EXPORTACIONES ORGANIZADAS POR CATEGORÍA
// ========================================

module.exports = {
  // 📦 FUNCIONES DE COMPRESIÓN/DESCOMPRESIÓN
  descomprimirArchivo,
  // 📄 FUNCIONES DE MERGE PDF
  mergePDFs,
  // 🔍 VERIFICACIÓN (3 funciones)
  existeArchivo, // Verifica si archivo existe
  existeCarpeta, // Verifica si carpeta existe
  existeRuta, // Verifica si ruta existe

  // 📁 CREACIÓN (1 función)
  crearCarpeta, // Crea carpetas con recursividad

  // 📝 ESCRITURA (1 función)
  escribirArchivo, // Escribe archivos con auto-creación

  // 🗑️ ELIMINACIÓN (1 función)
  eliminarArchivo, // Elimina archivos con verificación

  // 🌐 CONVERSIÓN (1 función)
  filePathToPublicUrl, // Convierte ruta a URL pública

  // ⏰ POLLING (1 función)
  esperarDescargaArchivo, // Espera archivo con patrón

  // 🔄 MANIPULACIÓN (1 función)
  moverYRenombrarArchivo, // Mueve/renombra archivos

  // 📍 RUTAS/PATHS (5 funciones)
  currentPath, // Directorio actual
  obtenerRutaBackendFiles, // Ruta base backend/files
  getPath, // Ruta a home del usuario
  createNewPath, // Construye rutas genéricas
  obtenerPathArchivo, // Ruta absoluta de archivo
  getPathFolderCotizaciones, // Ruta específica cotizaciones
  getPathFolderFiles,
  handleFilePostMulter,
};

/*
📊 RESUMEN POR CATEGORÍAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 COMPRESIÓN/DESCOMPRESIÓN (1) 
🔍 VERIFICACIÓN (3) 
📁 CREACIÓN (1)     
📝 ESCRITURA (1)   
🗑️ ELIMINACIÓN (1)
🌐 CONVERSIÓN (1)   
⏰ POLLING (1)      
🔄 MANIPULACIÓN (1)
📍 RUTAS/PATHS (5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
