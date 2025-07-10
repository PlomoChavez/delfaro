const { By } = require("selenium-webdriver");
const { descargarConCookies } = require("../helpers/GeneralHelper");
const { getPathFolderCotizaciones } = require("../../utils/filesHelper");

/**
 * Busca un <a> cuyo <u> contiene el texto indicado (en cualquier columna), abre el href en una nueva pestaña y cambia el foco.
 * @param {WebDriver} driver
 * @param {string} texto - Texto exacto o parcial dentro del <u> (ej: número de cotización)
 * @param {string} nombreArchivo - (No se usa aquí, solo para compatibilidad)
 */
async function descargarArchivoHipervinculo(driver, href, nombreArchivo) {
  let pathDirectorioCotizaciones = await getPathFolderCotizaciones("qualitas");
  let responseFile = await descargarConCookies(
    driver,
    href,
    pathDirectorioCotizaciones,
    nombreArchivo
  );
  return responseFile;
}

async function handleDescargarPDF(driver, texto) {
  let response = {
    status: false,
    message: "No se pudo descargar el archivo.",
  };
  // prettier-ignore
  const tbody = await driver.findElement(By.css("#tableCotizaciones_wrapper tbody"));

  const filas = await tbody.findElements(By.css("tr"));
  for (const fila of filas) {
    const tds = await fila.findElements(By.css("td"));
    if (tds.length === 0) continue;
    for (const td of tds) {
      try {
        const a = await td.findElement(By.css("a"));
        const u = await a.findElement(By.css("u"));
        const valorEncontrado = await u.getText();

        if (
          // prettier-ignore
          valorEncontrado.trim().toLowerCase().includes(texto.trim().toLowerCase())
        ) {
          // Obtener el href y abrirlo en una nueva pestaña
          const href = await a.getAttribute("href");

          // prettier-ignore
          let responseFile = await descargarArchivoHipervinculo(driver,href,"cotizacion_" + texto);

          if (responseFile.status) {
            response = responseFile;
            response.message = "Archivo descargado correctamente.";
          } else {
            response.message =
              responseFile.message || "Error al descargar el archivo.";
          }

          return response;
        }
      } catch (e) {
        continue;
      }
    }
  }
  throw new Error("No se encontró la cotización con el texto indicado.");
}

async function esperarFilasTablaCotizaciones(driver, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const tbody = await driver.findElement(
      By.css("#tableCotizaciones_wrapper tbody")
    );
    const filas = await tbody.findElements(By.css("tr"));
    let hayFilasValidas = false;

    for (const fila of filas) {
      // Ignora filas con la clase dataTables_empty
      const clase = await fila.getAttribute("class");
      if (clase && clase.includes("dataTables_empty")) continue;

      const tds = await fila.findElements(By.css("td"));
      // Si hay más de una columna y no es fila vacía, es válida
      if (tds.length > 1) {
        hayFilasValidas = true;
        break;
      }
    }

    if (hayFilasValidas) {
      return true;
    }

    // Espera un poco antes de volver a revisar
    await driver.sleep(500);
  }
  // Si termina el timeout sin encontrar filas válidas
  console.log("Timeout esperando filas válidas en la tabla de cotizaciones.");
  return false;
}

async function obtenerFrecuenciasPago(driver) {
  const resultados = [];
  // Selecciona todos los divs de tipo paymentTypeItem
  const items = await driver.findElements(By.css(".paymentTypeItem"));

  for (const item of items) {
    // Dentro de cada item, busca el monto y el tipo
    const montoElem = await item.findElement(By.css(".text-secondary.c4.mt-1"));
    const tipoElem = await item.findElement(
      By.css(".text-muted.c5.mt-1:not(.d-sm-none)")
    );

    const monto = await montoElem.getText();
    const tipo = await tipoElem.getText();

    resultados.push({ tipo, monto });
  }

  return resultados;
}

module.exports = {
  handleDescargarPDF,
  obtenerFrecuenciasPago,
  descargarArchivoHipervinculo,
  esperarFilasTablaCotizaciones,
};
