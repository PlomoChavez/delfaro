const fs = require("fs");
const path = require("path");
const os = require("os");
require("dotenv").config();
const { PDFDocument } = require("pdf-lib");
const AdmZip = require("adm-zip"); // ✅ AGREGAR ESTA DEPENDENCIA

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

/**
 * Mueve y renombra un archivo.
 * @param {string} oldPath - Ruta actual del archivo.
 * @param {string} newPath - Nueva ruta (incluyendo el nuevo nombre).
 */
async function moverYRenombrarArchivo(oldPath, newPath) {
  await fs.promises.rename(oldPath, newPath);
}

async function createNewPath(folder = "Downloads") {
  if (Array.isArray(folder)) {
    return path.join(...folder);
  }
  return path.join(folder);
}

async function currentPath() {
  return __dirname;
}

async function getPath(folder = "Downloads") {
  if (Array.isArray(folder)) {
    return path.join(os.homedir(), ...folder);
  }
  return path.join(os.homedir(), folder);
}

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
 * Obtiene el path absoluto de un archivo en un directorio.
 * @param {string} dir - Directorio.
 * @param {string} fileName - Nombre del archivo.
 * @returns {string}
 */
async function obtenerPathArchivo(dir, fileName) {
  return path.resolve(dir, fileName);
}

/**
 * Descomprime un archivo ZIP y guarda el contenido en una carpeta específica
 * @param {string} rutaArchivoZip - Ruta completa del archivo ZIP
 * @param {string} numeroPoliza - Número de póliza para crear la carpeta
 * @returns {Object} Resultado de la descompresión
 */
async function descomprimirArchivoPoliza(rutaArchivoZip, numeroPoliza) {
  console.log("📦 Iniciando descompresión del archivo ZIP...");
  console.log("📁 Archivo origen:", rutaArchivoZip);

  try {
    // Verificar que el archivo ZIP existe
    if (!fs.existsSync(rutaArchivoZip)) {
      throw new Error(`El archivo ZIP no existe: ${rutaArchivoZip}`);
    }

    // Crear la ruta de destino
    const carpetaBase = path.join(process.cwd(), "backend", "files", "polizas");
    const carpetaPoliza = path.join(carpetaBase, `poliza_${numeroPoliza}`);

    console.log("📂 Carpeta destino:", carpetaPoliza);

    // Crear las carpetas si no existen
    if (!fs.existsSync(carpetaBase)) {
      fs.mkdirSync(carpetaBase, { recursive: true });
      console.log("✅ Carpeta base creada:", carpetaBase);
    }

    if (!fs.existsSync(carpetaPoliza)) {
      fs.mkdirSync(carpetaPoliza, { recursive: true });
      console.log("✅ Carpeta de póliza creada:", carpetaPoliza);
    }

    // Descomprimir el archivo
    const zip = new AdmZip(rutaArchivoZip);
    const zipEntries = zip.getEntries();

    console.log(`📋 Archivos encontrados en el ZIP: ${zipEntries.length}`);

    const archivosExtraidos = [];

    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        const nombreArchivo = entry.entryName;
        const rutaDestino = path.join(carpetaPoliza, nombreArchivo);

        console.log(`📄 Extrayendo: ${nombreArchivo}`);

        // Crear subdirectorios si es necesario
        const directorioDestino = path.dirname(rutaDestino);
        if (!fs.existsSync(directorioDestino)) {
          fs.mkdirSync(directorioDestino, { recursive: true });
        }

        // Extraer el archivo
        fs.writeFileSync(rutaDestino, entry.getData());

        archivosExtraidos.push({
          nombreOriginal: nombreArchivo,
          rutaCompleta: rutaDestino,
          tamaño: entry.header.size,
        });
      }
    });

    console.log(
      `✅ Descompresión completada. ${archivosExtraidos.length} archivos extraídos`
    );

    // Opcional: Eliminar el archivo ZIP original después de extraer
    try {
      fs.unlinkSync(rutaArchivoZip);
      console.log("🗑️ Archivo ZIP original eliminado");
    } catch (deleteError) {
      console.log(
        "⚠️ No se pudo eliminar el archivo ZIP original:",
        deleteError.message
      );
    }

    return {
      success: true,
      carpetaDestino: carpetaPoliza,
      archivosExtraidos: archivosExtraidos,
      totalArchivos: archivosExtraidos.length,
      message: "Descompresión completada exitosamente",
    };
  } catch (error) {
    console.log("❌ Error descomprimiendo archivo:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Obtiene la lista de archivos de una carpeta
 * @param {string} carpetaPath - Ruta de la carpeta
 * @returns {Array} Lista de archivos (vacía si la carpeta no existe)
 */
function obtenerArchivosEnCarpeta(carpetaPath) {
  return fs.existsSync(carpetaPath) ? fs.readdirSync(carpetaPath) : [];
}

async function eliminarArchivo(rutaArchivoCompleta) {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(rutaArchivoCompleta)) {
      return {
        success: false,
        error: `El archivo no existe: ${rutaArchivoCompleta}`,
        rutaArchivo: rutaArchivoCompleta,
      };
    }

    // Eliminar el archivo
    fs.unlinkSync(rutaArchivoCompleta);

    return {
      success: true,
      rutaArchivo: rutaArchivoCompleta,
      nombreArchivo: path.basename(rutaArchivoCompleta),
      message: "Archivo eliminado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      rutaArchivo: rutaArchivoCompleta,
    };
  }
}
/**
 * Hace merge de la portada con un PDF específico
 * @param {string} rutaPortada - Ruta del archivo de portada
 * @param {string} rutaArchivoOriginal - Ruta del archivo PDF original
 * @param {string} rutaArchivoDestino - Ruta donde guardar el archivo con merge
 * @returns {Object} Resultado del merge
 */
async function mergePDFConPortada(
  rutaPortada,
  rutaArchivoOriginal,
  rutaArchivoDestino
) {
  try {
    // Leer archivos PDF
    const portadaBytes = fs.readFileSync(rutaPortada);
    const archivoOriginalBytes = fs.readFileSync(rutaArchivoOriginal);

    // Crear nuevo documento PDF
    const pdfDoc = await PDFDocument.create();

    // Cargar PDFs existentes
    const portadaPdf = await PDFDocument.load(portadaBytes);
    const archivoOriginalPdf = await PDFDocument.load(archivoOriginalBytes);

    // Copiar páginas de la portada PRIMERO
    const portadaPages = await pdfDoc.copyPages(
      portadaPdf,
      portadaPdf.getPageIndices()
    );
    portadaPages.forEach((page) => pdfDoc.addPage(page));

    // Copiar páginas del archivo original DESPUÉS
    const originalPages = await pdfDoc.copyPages(
      archivoOriginalPdf,
      archivoOriginalPdf.getPageIndices()
    );
    originalPages.forEach((page) => pdfDoc.addPage(page));

    // Guardar el PDF combinado
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(rutaArchivoDestino, pdfBytes);

    return {
      success: true,
      rutaDestino: rutaArchivoDestino,
      message: "Merge completado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function archivoExiste(rutaArchivo, options = {}) {
  const { verbose = false } = options;

  try {
    const existe = fs.existsSync(rutaArchivo);

    if (verbose) {
      if (existe) {
        console.log(`✅ Archivo existe: ${rutaArchivo}`);
      } else {
        console.log(`❌ Archivo no existe: ${rutaArchivo}`);
      }
    }

    return existe;
  } catch (error) {
    if (verbose) {
      console.log(`❌ Error verificando archivo: ${error.message}`);
    }
    return false;
  }
}
module.exports = {
  archivoExiste,
  mergePDFConPortada,
  currentPath,
  createNewPath,
  eliminarArchivo,
  esperarDescargaArchivo,
  moverYRenombrarArchivo,
  obtenerPathArchivo,
  getPath,
  filePathToPublicUrl,
  getPathFolderCotizaciones,
  descomprimirArchivoPoliza,
  obtenerArchivosEnCarpeta,
};
