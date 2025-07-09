const fs = require("fs");
const path = require("path");
const os = require("os");
require("dotenv").config();

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

async function currentPath() {
  return __dirname;
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

async function getPath(folder = "Downloads") {
  if (Array.isArray(folder)) {
    return path.join(os.homedir(), ...folder);
  }
  return path.join(os.homedir(), folder);
}

async function createNewPath(folder = "Downloads") {
  if (Array.isArray(folder)) {
    return path.join(...folder);
  }
  return path.join(folder);
}

module.exports = {
  currentPath,
  createNewPath,
  esperarDescargaArchivo,
  moverYRenombrarArchivo,
  obtenerPathArchivo,
  getPath,
  filePathToPublicUrl,
  getPathFolderCotizaciones,
};
