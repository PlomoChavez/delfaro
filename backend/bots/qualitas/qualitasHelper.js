const { until, By } = require("selenium-webdriver");
const { descargarConCookies } = require("../helpers/GeneralHelper");
const { getPathFolderCotizaciones } = require("../../utils/filesHelper");
const { deepPrint } = require("../../utils/helper");

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

  const resultado = await buscarFilaCotizacionPorTexto(driver, texto);
  if (resultado) {
    // Puedes usar resultado.href para descargar, resultado.valores para los textos de la fila
    const href = resultado.href;

    // prettier-ignore
    let responseFile = await descargarArchivoHipervinculo(driver,href,"cotizacion_" + texto);

    if (responseFile.status) {
      response = responseFile;
      response.message = "Archivo descargado correctamente.";
    } else {
      // prettier-ignore
      response.message = responseFile.message || "Error al descargar el archivo.";
    }

    return response;
  } else {
    console.log("No se encontró la cotización con el texto indicado.");
  }
}

async function buscarTbodyCotizaciones(driver) {
  // Intenta encontrar la tabla de cotizaciones
  try {
    const tbody = await driver.findElement(
      By.css("#tableCotizaciones_wrapper tbody")
    );
    return { tbody, tipo: "cotizaciones" };
  } catch (e) {
    // Si no existe, intenta con la tabla de coberturas básicas
    try {
      const tbody = await driver.findElement(
        By.css('table[aria-label="Coberturas básicas"] tbody')
      );
      return { tbody, tipo: "coberturasBasicas" };
    } catch (e2) {
      throw new Error(
        "No se encontró ninguna tabla válida de cotizaciones ni de coberturas básicas."
      );
    }
  }
}

async function buscarFilaCotizacionPorTexto(driver, texto) {
  const { tbody, tipo } = await buscarTbodyCotizaciones(driver);

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
          valorEncontrado
            .trim()
            .toLowerCase()
            .includes(texto.trim().toLowerCase())
        ) {
          const href = await a.getAttribute("href");
          // Extrae los textos de todas las celdas de la fila
          const valores = [];
          for (const celda of tds) {
            valores.push(await celda.getText());
          }
          return { href, fila, valores };
        }
      } catch (e) {
        continue;
      }
    }
  }
  return null;
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

async function redireccionarCotizacionGuardada(driver, row) {
  let fila = row.fila || null; // Asegura que fila sea un elemento WebDriver
  // Extrae el href de la columna 8 (columna 7 en índice 0)
  const hrefCol8 = await fila.findElement(By.css("td:nth-child(8) a"));
  const href = await hrefCol8.getAttribute("href");

  // Abre el enlace en una nueva pestaña
  await driver.executeScript(`window.open("${href}", "_blank");`);

  // Cambia el foco al nuevo tab
  const tabs = await driver.getAllWindowHandles();
  await driver.switchTo().window(tabs[tabs.length - 1]);

  return href;
}

async function esperarElementoVisible(driver, selector, timeout = 20000) {
  const element = await driver.wait(
    until.elementLocated(By.css(selector)),
    timeout,
    `No se encontró el elemento: ${selector}`
  );
  await driver.wait(
    until.elementIsVisible(element),
    timeout,
    `El elemento no está visible: ${selector}`
  );
  return element;
}

async function obtenerNombresCoberturasAccesorias(driver) {
  // prettier-ignore
  const labels = await driver.findElements(By.css("#coberturasAccesoriasItems label"));

  const nombres = [];

  for (const label of labels) {
    await driver.executeScript("arguments[0].scrollIntoView(true);", label);
    await driver.sleep(500);
    await driver.executeScript("arguments[0].click();", label);
    await driver.sleep(300);

    const idLabel = await label.getAttribute("for");
    let nombre = null;
    let prima = null;

    let rowMb4;
    try {
      rowMb4 = await label.findElement(By.css("div.shadow .row.mb-4"));
    } catch (e) {
      continue;
    }

    const ps = await rowMb4.findElements(By.css("p.c2"));
    if (ps.length > 0) {
      nombre = await ps[0].getText();
      if (ps.length > 1) {
        prima = await ps[1].getText();
      }
    }

    if (!nombre || nombre.trim() === "") {
      continue;
    }

    // Busca los hijos en la segunda .row, agrupados por columna
    let hijosInfo = [];
    try {
      const rows = await label.findElements(By.css("div.shadow .row"));
      if (rows.length > 1) {
        const hijosRow = rows[1];
        const grupos = await hijosRow.findElements(
          By.css("div[class*='col-']")
        );
        for (const grupo of grupos) {
          let info = {};

          // Busca todos los labels (pueden ser varios, ej: "25%" y "Deducible")
          let labels = [];
          try {
            const labelElems = await grupo.findElements(By.css("label"));
            for (const labelElem of labelElems) {
              const txt = (await labelElem.getText()).trim();
              if (txt) labels.push(txt);
            }
          } catch (e) {}

          // Input
          try {
            const input = await grupo.findElement(By.css("input"));
            info.tag = "input";
            info.tipo = await input.getAttribute("type");
            info.valor = await input.getAttribute("value");
            info.id = await input.getAttribute("id");
          } catch (e) {}

          // Select
          try {
            const select = await grupo.findElement(By.css("select"));
            info.tag = "select";
            info.valor = await select.getAttribute("value");
            info.id = await select.getAttribute("id");
            // Opciones del select
            info.opciones = [];
            const opcionesElems = await select.findElements(By.css("option"));
            for (const opcionElem of opcionesElems) {
              const value = await opcionElem.getAttribute("value");
              const texto = await opcionElem.getText();
              info.opciones.push({ value, texto });
            }
          } catch (e) {}

          // p
          try {
            const p = await grupo.findElement(By.css("p"));
            info.tag = "p";
            info.valor = await p.getText();
          } catch (e) {}

          // --- TRANSFORMACIÓN DE LABELS ---
          if (labels.length === 1) {
            info.label = labels[0];
          } else if (labels.length === 2) {
            info.valor = labels[0];
            info.label = labels[1];
          } else if (labels.length === 0) {
            info.label = null;
            info.valor = info.valor || null;
          }

          // Solo agrega si tiene algo relevante
          if (info.tag || info.label || info.valor) {
            hijosInfo.push(info);
          }
        }
      }
    } catch (e) {
      // Si no hay hijos, hijosInfo queda vacío
    }

    nombres.push({
      label_id: idLabel,
      nombre,
      prima,
      hijos: hijosInfo,
    });
  }

  return nombres;
}

function transformarCoberturas(filas) {
  return filas
    .map((fila) => {
      function normalizarCelda(celda) {
        if (!celda || celda.length === 0) return null;
        if (celda.length === 1) return celda[0];
        return celda;
      }

      return {
        cobertura: fila[0]?.[0]?.texto || "",
        sumaSegura: normalizarCelda(fila[1]),
        deducible: normalizarCelda(fila[2]),
        prima: normalizarCelda(fila[3]),
      };
    })
    .filter((item) => item.cobertura !== "");
}

async function obtenerCoberturasBasicas(driver) {
  // Espera a que la tabla esté visible
  await esperarElementoVisible(
    driver,
    'table[aria-label="Coberturas básicas"]',
    20000
  );

  // Selecciona todas las filas del tbody
  const filas = await driver.findElements(
    By.css('table[aria-label="Coberturas básicas"] tbody tr')
  );
  let resultado = [];

  for (const fila of filas) {
    const tds = await fila.findElements(By.css("td,th"));
    const filaInfo = [];

    for (const td of tds) {
      // Busca p, input:text y select dentro del td
      const ps = await td.findElements(By.css("p"));
      const inputs = await td.findElements(By.css("input"));
      const selects = await td.findElements(By.css("select"));

      const elementos = [];

      for (const p of ps) {
        const texto = await p.getText();
        if (texto.trim() !== "") {
          elementos.push({ tag: "p", texto });
        }
      }

      for (const input of inputs) {
        const type = await input.getAttribute("type");
        if (!type || type === "text") {
          // Si no tiene type o es text
          const valor = await input.getAttribute("value");
          const id = await input.getAttribute("id");
          const name = await input.getAttribute("name");
          const disabled = (await input.getAttribute("disabled")) !== null;
          const readonly = (await input.getAttribute("readonly")) !== null;
          elementos.push({
            tag: "input",
            tipo: "text",
            valor,
            id,
            name,
            disabled,
            readonly,
          });
        } else if (type === "checkbox") {
          const valor = await input.getAttribute("value");
          const id = await input.getAttribute("id");
          const name = await input.getAttribute("name");
          const checked = (await input.getAttribute("checked")) !== null;
          elementos.push({
            tag: "input",
            tipo: "checkbox",
            valor,
            id,
            name,
            checked,
          });
        }
      }

      for (const select of selects) {
        const valor = await select.getAttribute("value");
        const id = await select.getAttribute("id");
        const name = await select.getAttribute("name");
        const disabled = (await select.getAttribute("disabled")) !== null;
        const readonly = (await select.getAttribute("readonly")) !== null;

        let textoSeleccionado = "";
        // Opcional: obtener opciones del select
        const opciones = [];
        const options = await select.findElements(By.css("option"));
        for (const option of options) {
          const value = await option.getAttribute("value");
          const texto = await option.getText();
          opciones.push({ value, texto });
          if (value == valor) {
            textoSeleccionado = texto;
          }
        }
        elementos.push({
          tag: "select",
          valor: { value: valor, texto: textoSeleccionado },
          id,
          name,
          disabled,
          readonly,
          opciones,
        });
      }

      filaInfo.push(elementos);
    }
    resultado.push(filaInfo);
  }
  resultado = transformarCoberturas(resultado);

  return resultado;
}
module.exports = {
  obtenerCoberturasBasicas,
  obtenerNombresCoberturasAccesorias,
  esperarElementoVisible,
  handleDescargarPDF,
  redireccionarCotizacionGuardada,
  obtenerFrecuenciasPago,
  descargarArchivoHipervinculo,
  esperarFilasTablaCotizaciones,
  buscarFilaCotizacionPorTexto,
};
