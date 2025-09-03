const { until, By } = require("selenium-webdriver");
const { descargarConCookies } = require("../helpers/GeneralHelper");
const { getPathFolderCotizaciones } = require("../../utils/filesHelper");
const { deepPrint } = require("../../utils/helper");
const {
  sleep,
  selectOptionInSelect,
  setInputValue,
  setCheckboxValue,
} = require("../helpers/seleniumHelper");

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

// ...existing code...
// prettier-ignore
async function obtenerNombresCoberturasAccesorias(driver, dataExtra = {
  darClick: true,
  darSegundoClick: false
}) {
  const darClick = dataExtra.darClick !== undefined ? dataExtra.darClick : true;
  const darSegundoClick = dataExtra.darSegundoClick !== undefined ? dataExtra.darSegundoClick : false;
  const accesorios = dataExtra.accesorios !== undefined ? dataExtra.accesorios : [];
  console.log("Obteniendo coberturas accesorias...");

  try {
    const labels = await driver.findElements(By.css("#coberturasAccesoriasItems label"));

    if (labels.length === 0) {
      return [];
    }

    const nombres = [];

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];

      try {
        // Scroll al elemento
        await driver.executeScript("arguments[0].scrollIntoView(true);", label);
        await driver.sleep(500);

        // Obtener ID del label antes de hacer click
        const idLabel = await label.getAttribute("for");

        if (!idLabel || idLabel.trim() === "") {
          continue;
        }

        if (darClick) {
          try {
            const checkbox = await driver.findElement(By.id(idLabel));
            const isChecked = await checkbox.isSelected();

            if (!isChecked) {
              await driver.executeScript("arguments[0].click();", label);
              await driver.sleep(300);
            }
          } catch (checkboxError) {
            continue;
          }
        }

        // Buscar información del nombre y prima
        let nombre = null;
        let prima = null;
        let rowMb4;

        try {
          rowMb4 = await label.findElement(By.css("div.shadow .row.mb-4"));
        } catch (e) {
          continue;
        }
        let ps = [];
        try {
          ps = await rowMb4.findElements(By.css("p.c2"));

          if (ps.length > 0) {
            nombre = await ps[0].getText();
            nombre = nombre && typeof nombre === "string" ? nombre.trim() : "";
          }
        } catch (textError) {
          continue;
        }
        
        if (!nombre || nombre === "") {
          continue;
        }

        let existeAccersori = accesorios.find((item)=> item.nombre === nombre);
        let selectedAccesorio = existeAccersori ? (existeAccersori.selected  ?? false): false;

        if(selectedAccesorio){
          for (const hijo of existeAccersori.hijos) {
            if (!hijo.tag) continue;
            switch (hijo.tag) {
              case "input":
                await setInputValue(driver, {
                  locator: hijo.id,
                  clearInput: true,
                  value: hijo.valor,
                  sleeptime: 1000,
                  by: "id",
                });
                break;
              case "select":
                await selectOptionInSelect(driver, {
                  esperarHabilitado: true,
                  value: hijo.valor.texto,
                  tipoValor: "label",
                  locator: hijo.id, // Cambié de hijo.name a hijo.id para consistencia
                  sleeptime: 1000,
                  by: "id", // Cambié de "name" a "id" para consistencia
                });
                break;
            }
          }
        }

        ps = await rowMb4.findElements(By.css("p.c2"));
        if (ps.length > 0) {
          if (ps.length > 1) {
            prima = await ps[1].getText();
            prima = prima && typeof prima === "string" ? prima.trim() : "";
          }
        }

        // Buscar información de los hijos
        let hijosInfo = [];
        try {
          const rows = await label.findElements(By.css("div.shadow .row"));

          if (rows.length > 1) {
            const hijosRow = rows[1];
            const grupos = await hijosRow.findElements(
              By.css("div[class*='col-']")
            );

            for (let j = 0; j < grupos.length; j++) {
              const grupo = grupos[j];

              try {
                let info = {};

                // Buscar labels
                let labelsTexto = [];
                try {
                  const labelElems = await grupo.findElements(By.css("label"));
                  for (const labelElem of labelElems) {
                    const txt = await labelElem.getText();
                    const textoLimpio =
                      txt && typeof txt === "string" ? txt.trim() : "";
                    if (textoLimpio) {
                      labelsTexto.push(textoLimpio);
                    }
                  }
                } catch (labelError) {
                  // No hay labels
                }

                // Buscar input
                try {
                  const input = await grupo.findElement(By.css("input"));
                  const tipo = await input.getAttribute("type");
                  const valor = await input.getAttribute("value");
                  const id = await input.getAttribute("id");
                  const name = await input.getAttribute("name"); // Agregué name también

                  info.tag = "input";
                  info.tipo = tipo || "";
                  info.valor = valor || "";
                  info.id = id || "";
                  info.name = name || ""; // Agregué name para tener ambas opciones
                } catch (inputError) {
                  // No hay input, no es error
                }

                // Buscar select
                try {
                  const select = await grupo.findElement(By.css("select"));
                  const valor = await select.getAttribute("value");
                  const id = await select.getAttribute("id");
                  const name = await select.getAttribute("name"); // Agregué name también

                  info.tag = "select";
                  info.valor = valor || "";
                  info.id = id || "";
                  info.name = name || ""; // Agregué name para tener ambas opciones
                  info.opciones = [];

                  try {
                    const opcionesElems = await select.findElements(
                      By.css("option")
                    );
                    for (const opcionElem of opcionesElems) {
                      const value = await opcionElem.getAttribute("value");
                      const texto = await opcionElem.getText();
                      info.opciones.push({
                        value: value || "",
                        texto: texto || "",
                      });
                    }
                  } catch (opcionesError) {
                    // Error al obtener opciones
                  }
                } catch (selectError) {
                  // No hay select, no es error
                }

                // Buscar párrafo
                try {
                  const p = await grupo.findElement(By.css("p"));
                  const texto = await p.getText();
                  info.tag = "p";
                  info.valor =
                    texto && typeof texto === "string" ? texto.trim() : "";
                } catch (pError) {
                  // No hay párrafo, no es error
                }

                // Transformación de labels
                if (labelsTexto.length === 1) {
                  info.label = labelsTexto[0];
                } else if (labelsTexto.length === 2) {
                  info.valor = labelsTexto[0];
                  info.label = labelsTexto[1];
                } else if (labelsTexto.length === 0) {
                  info.label = null;
                  info.valor = info.valor || null;
                }

                // Solo agregar si tiene información relevante
                if (info.tag || info.label || info.valor) {
                  hijosInfo.push(info);
                }
              } catch (grupoError) {
                // Error procesando grupo
              }
            }
          }
        } catch (hijosError) {
          // hijosInfo queda vacío, no es fatal
        }

        // Agregar la información recopilada
        const cobertura = {
          label_id: idLabel,
          nombre: nombre,
          prima: prima,
          hijos: hijosInfo,
          selected: selectedAccesorio,
        };

        nombres.push(cobertura);
        if(selectedAccesorio){
          console.log("cobertura")
          console.log(cobertura)
        }

        // Dar segundo click si está habilitado y se cumplen las condiciones
        if (!selectedAccesorio) {
          try {
            await driver.executeScript("arguments[0].click();", label);
            await driver.sleep(300);
          } catch (segundoClickError) {
            // Error en segundo click, no es fatal
          }
        }

      } catch (labelError) {
        // Continúa con el siguiente label
      }
    }

    return nombres;
  } catch (mainError) {
    throw mainError;
  }
}
// ...existing code...

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

// Función recursiva para extraer tags aunque estén anidados
function extractByTag(obj, result) {
  if (!obj) return;

  if (Array.isArray(obj)) {
    obj.forEach((item) => extractByTag(item, result));
  } else if (typeof obj === "object") {
    if (obj.tag) {
      switch (obj.tag) {
        case "input":
          if (obj.tipo === "checkbox") {
            result.checks.push(obj);
          } else {
            result.text.push(obj);
          }
          break;
        case "select":
          result.select.push(obj);
          break;
        case "p":
          result.p.push(obj);
          break;
      }
    }

    // Seguir recorriendo propiedades
    Object.values(obj).forEach((val) => extractByTag(val, result));
  }
}

function groupByTags(coberturas) {
  const result = {
    select: [],
    checks: [],
    text: [],
    p: [],
  };

  coberturas.forEach((cob) => {
    extractByTag(cob, result);
  });

  return result;
}

async function obtenerCoberturasBasicas(driver, coberturasBasicas) {
  const grouped = groupByTags(coberturasBasicas);

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
          const id = await input.getAttribute("id");
          const name = await input.getAttribute("name");

          const coberturaCheck = grouped.checks.find((c) => c.id === id);

          // prettier-ignore
          if (coberturaCheck && !coberturaCheck.disabled && !coberturaCheck.readonly) {
            await setCheckboxValue(driver, {
              locator: coberturaCheck.id,
              value: coberturaCheck.checked, // true o false
              by: "id",
              sleeptime: 500
            });
          }

          const checked = (await input.getAttribute("checked")) !== null;
          const valor = await input.getAttribute("value");

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
      setCheckboxValue;
      for (const select of selects) {
        const name = await select.getAttribute("name");
        const disabled = (await select.getAttribute("disabled")) !== null;
        const readonly = (await select.getAttribute("readonly")) !== null;

        const coberturaSelect = grouped.select.find((s) => s.name === name);

        // prettier-ignore
        if (coberturaSelect && coberturaSelect.valor && !disabled && !readonly) {
          await selectOptionInSelect(driver, {
            value: coberturaSelect.valor.texto,
            esperarHabilitado: true,
            tipoValor: "label",
            sleeptime: 1000,
            locator: name,
            by: "name",
          });
        }

        const id = await select.getAttribute("id");
        const valor = await select.getAttribute("value");
        let textoSeleccionado = "";

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

async function esperarQueNoExistaModalError(
  driver,
  timeoutMs = 60000,
  intervaloMs = 1000
) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      // Busca el modal por id
      const modal = await driver.findElement(By.id("modalError01"));
      const isDisplayed = await modal.isDisplayed();
      if (isDisplayed) {
        // Si existe, obtiene el mensaje y lo retorna
        const mensajeElem = await driver.findElement(By.id("msjMGErr"));
        const mensaje = await mensajeElem.getText();
        return mensaje;
      }
    } catch (e) {
      // Si no existe el modal, Selenium lanza error y seguimos esperando
    }
    await sleep(intervaloMs);
  }
  // Si nunca apareció el modal, retorna null
  return null;
}

async function actualizacionAccesosrio(driver, accesorios) {
  console.log("Obteniendo nombres y primas de coberturas accesorias...");
  try {
    const labels = await driver.findElements(
      By.css("#coberturasAccesoriasItems label")
    );
    if (labels.length === 0) {
      return [];
    }
    const coberturas = [];
    for (const label of labels) {
      try {
        await driver.executeScript("arguments[0].scrollIntoView(true);", label);
        await driver.sleep(200);

        const label_id = await label.getAttribute("for");
        if (!label_id || label_id.trim() === "") continue;

        let nombre = null;
        let prima = null;
        try {
          const rowMb4 = await label.findElement(
            By.css("div.shadow .row.mb-4")
          );
          const ps = await rowMb4.findElements(By.css("p.c2"));
          if (ps.length > 0) {
            nombre = await ps[0].getText();
            nombre = nombre && typeof nombre === "string" ? nombre.trim() : "";
            if (ps.length > 1) {
              prima = await ps[1].getText();
              prima = prima && typeof prima === "string" ? prima.trim() : "";
            }
          }
        } catch (e) {
          continue;
        }
        if (!nombre || nombre === "") continue;

        coberturas.push({ label_id, nombre, prima });
      } catch (e) {
        // Continúa con el siguiente label
      }
    }
    return coberturas;
  } catch (mainError) {
    throw mainError;
  }
}
module.exports = {
  esperarQueNoExistaModalError,
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
