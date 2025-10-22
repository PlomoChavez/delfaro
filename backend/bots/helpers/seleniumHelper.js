const { Builder, By, until, Actions } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const os = require("os");

function getBy(by, locator) {
  switch (by) {
    case "id":
      return By.id(locator);
    case "name":
      return By.name(locator);
    case "css":
      return By.css(locator);
    case "xpath":
      return By.xpath(locator);
    case "linkText":
      return By.linkText(locator);
    default:
      throw new Error(`Tipo de búsqueda no soportado: ${by}`);
  }
}

async function esperarCargaCompleta(driver, timeout = 10000) {
  try {
    // Esperar a que document.readyState sea 'complete'
    // prettier-ignore
    await driver.wait(async () => {
      const readyState = await driver.executeScript("return document.readyState");
      return readyState === "complete";
    }, timeout);

    // Esperar a que no haya requests AJAX pendientes (si usa jQuery)
    // prettier-ignore
    await driver.wait(async () => {
      try {
        const ajaxActive = await driver.executeScript('return typeof jQuery !== "undefined" ? jQuery.active : 0');
        return ajaxActive === 0;
      } catch (e) {
        return true; // Si no hay jQuery, continuar
      }
    }, 3000);

    return true;
  } catch (error) {
    console.log("⚠️ Timeout esperando carga completa:", error.message);
    return false;
  }
}

async function openPage(url, optionsConfig = {}) {
  const options = new chrome.Options();
  if (optionsConfig.headless) options.addArguments("--headless=new");
  if (optionsConfig.noSandbox) options.addArguments("--no-sandbox");
  if (optionsConfig.disableDevShm)
    options.addArguments("--disable-dev-shm-usage");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  await driver.get(url);
  return driver;
}

/**
 * Espera un elemento por id, name o selector CSS.
 * @param {WebDriver} driver
 * @param {Object} options { id, name, css, timeout }
 * @returns {Promise<WebElement>}
 */
async function waitForElement(driver, { locator, by = "id", timeout = 10000 }) {
  const seleniumBy = getBy(by, locator);
  return driver.wait(until.elementLocated(seleniumBy), timeout);
}

// prettier-ignore
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// prettier-ignore
async function setCheckboxValue(driver, {
  locator,
  value, // true o false
  by = "id",
  sleeptime = 0
}) {
  if (sleeptime > 0) await sleep(sleeptime);

  const checkbox = await driver.wait(until.elementLocated(getBy(by, locator)), 10000);
  const isChecked = await checkbox.isSelected();

  // Si el estado actual no coincide con el deseado, haz click
  if (Boolean(value) !== isChecked) {
    await checkbox.click();
  }
}

// prettier-ignore
async function setInputValue(driver, { 
    locator, 
    value, 
    by = "id", 
    sleeptime = 0, 
    changeFocus = true,
    clearInput = false
  }) {
  if (sleeptime > 0) await sleep(sleeptime);
  const input = await driver.wait(until.elementLocated(getBy(by, locator)), 10000);

  // Validar el tipo de input
  const inputType = await input.getAttribute("type");
  let valueToSend = value;
  if (inputType === "number") {
    valueToSend = Number(value);
  }

  if (clearInput) {
    await input.clear();
  }
  await input.sendKeys(valueToSend);
  if (changeFocus) {
    await input.sendKeys('\uE004'); // '\uE004' es la tecla TAB en WebDriver
  }
}

async function getElement(driver, { locator, by = "id", multiple = false }) {
  if (multiple) {
    return driver.findElements(getBy(by, locator));
  }
  return driver.findElement(getBy(by, locator));
}

// prettier-ignore
async function acercarHaElemento(driver, { 
  locator, 
  by = "id", 
  timeout = 10000 
}) {
  const seleniumBy = getBy(by, locator);
  const element = await driver.wait(until.elementLocated(seleniumBy), timeout);
  await driver.executeScript("arguments[0].scrollIntoView(true);", element);
}

// prettier-ignore
async function clickElement(driver, { 
  locator, 
  by = "id", 
  sleeptime= 0, 
  timeout = 10000 
}) {
  try {
    if (sleeptime > 0) await sleep(sleeptime);
    const element = await driver.wait(until.elementLocated(getBy(by, locator)), timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    await driver.wait(until.elementIsEnabled(element), timeout);
    await element.click();
  } catch (error) {
    await sleep(100000); // Espera un segundo antes de lanzar el error
  }
}

async function selectMatOption(driver, { locator, optionText, by = "id" }) {
  try {
    console.log("Seleccionando opción en mat-select:", locator, optionText);
    // Selecciona el mat-select usando getBy
    const matSelect = await driver.findElement(getBy(by, locator));
    await matSelect.click();
    await sleep(200); // Opcional: mejora estabilidad en animaciones

    // Espera a que aparezca la opción y haz click en el <span>
    const optionXpath = `//mat-option[.//span[normalize-space(text())='${optionText}']]//span[@class='mat-option-text' and normalize-space(text())='${optionText}']`;
    await driver.wait(until.elementLocated(By.xpath(optionXpath)), 10000);

    const optionSpan = await driver.findElement(By.xpath(optionXpath));
    await optionSpan.click();
  } catch (e) {
    console.log(
      `No se encontró la opción '${optionText.trim()}' para el select '${locator}'.`
    );
  }
}

async function enableFirstDisabledOption(driver, selectId) {
  await driver.executeScript(`
    var opt = document.querySelector("#${selectId} option[disabled]");
    if(opt) opt.removeAttribute("disabled");
  `);
}

async function getSelectOptions(driver, { locator, by = "id", sleeptime = 0 }) {
  if (sleeptime > 0) await sleep(sleeptime);
  const select = await driver.findElement(getBy(by, locator));
  const options = await select.findElements(By.tagName("option"));
  const result = [];
  for (const option of options) {
    const value = await option.getAttribute("value");
    const label = await option.getText();
    const selected = await option.isSelected();
    if (value !== "") {
      result.push({ value, label, selected });
    }
  }
  return result;
}

async function selectOptionInSelect(
  driver,
  {
    locator,
    by = "id",
    value,
    tipoValor = "value",
    timeout = 10000,
    sleeptime = 0,
    esperarHabilitado = false,
  }
) {
  if (sleeptime > 0) await sleep(sleeptime);
  const selectBy = getBy(by, locator);

  // Espera a que el select esté presente
  await driver.wait(until.elementLocated(selectBy), timeout);

  // Espera a que el select NO esté disabled si se solicita
  if (esperarHabilitado) {
    await driver.wait(async () => {
      const select = await driver.findElement(selectBy);
      const disabled = await select.getAttribute("disabled");
      return !disabled;
    }, timeout);
  }

  // Siempre vuelve a buscar el select después de cualquier espera
  const select = await driver.findElement(selectBy);

  // Selecciona la opción según el tipo de valor
  let opcion;
  if (tipoValor === "value") {
    opcion = await select.findElement(By.css(`option[value="${value}"]`));
  } else if (tipoValor === "label") {
    opcion = await select.findElement(
      By.xpath(`.//option[normalize-space(text())="${value}"]`)
    );
  } else if (tipoValor === "numero") {
    const opciones = await select.findElements(By.tagName("option"));
    if (value < 0 || value >= opciones.length) {
      throw new Error("Índice de opción fuera de rango");
    }
    // Vuelve a buscar la opción por value para evitar stale element
    const optionValue = await opciones[value].getAttribute("value");
    opcion = await select.findElement(By.css(`option[value="${optionValue}"]`));
  } else {
    throw new Error("tipoValor no soportado: " + tipoValor);
  }

  await opcion.click();
}

async function switchToWindow(driver, index = 1, waitMs = 1000) {
  const handles = await driver.getAllWindowHandles();
  if (handles.length <= index)
    throw new Error(`No existe la ventana con índice ${index}`);
  await driver.switchTo().window(handles[index]);
  if (waitMs > 0) await sleep(waitMs);
}

// prettier-ignore
async function clickInElementNotClickeable(driver,{ locator, by = "css", timeout = 10000 }) {
  try {
    const seleniumBy = getBy(by, locator);
    const element = await driver.wait(
      until.elementLocated(seleniumBy),
      timeout
    );
    await driver.executeScript("arguments[0].click();", element);
    await sleep(500);
  } catch (error) {
    console.log(
      `No se pudo hacer click forzado en el elemento: ${by} -> ${locator}`
    );
    throw error;
  }
}

async function demo(driver) {
  // Espera a que el elemento esté presente
  const link = await driver.wait(
    until.elementLocated(
      By.xpath(
        "//a[contains(@class, 'seguro-link') and .//span[normalize-space(text())='Ir a Cotizar']]"
      )
    ),
    10000
  );

  // Realiza hover sobre el elemento
  await driver.actions({ bridge: true }).move({ origin: link }).perform();
}

async function printWindowTitles(driver) {
  const handles = await driver.getAllWindowHandles();
  for (let i = 0; i < handles.length; i++) {
    await driver.switchTo().window(handles[i]);
    const title = await driver.getTitle();
    console.log(`Ventana ${i}: ${title}`);
  }
}

async function printCurrentWindowTitle(driver) {
  const title = await driver.getTitle();
  console.log(`Ventana actual: ${title}`);
}

async function saveCurrentHtmlToTxt(driver, filename = "pagina.html.txt") {
  // 1. Guarda el body en un archivo
  const bodyHtml = await driver.executeScript(() => document.body.outerHTML);
  await fs.writeFile(filename, bodyHtml, "utf8");
  console.log(`Body guardado en ${filename}`);

  // 2. Busca el modal por id
  const modalExiste = await driver.executeScript(() => {
    return !!document.getElementById("frmHeader:popUpMensajeAlerta");
  });

  if (modalExiste) {
    console.log(
      "Modal encontrado, intentando hacer clic en el botón Aceptar..."
    );
    // 3. Haz clic en el input del modal
    try {
      const boton = await driver.findElement({
        id: "frmHeader:btnAceptarAlerta",
      });
      await boton.click();
      console.log("Botón Aceptar clickeado.");
    } catch (err) {
      console.log("No se pudo hacer clic en el botón Aceptar:", err.message);
    }
  } else {
    console.log("No se encontró el modal.");
  }
}

async function getElementText(driver, { locator, by = "id", timeout = 10000 }) {
  const elementBy = getBy(by, locator);
  const element = await driver.wait(until.elementLocated(elementBy), timeout);
  return await element.getText();
}

async function forzarCierre(driver) {
  await driver.quit();
}

async function setHover(driver, { locator, by = "id", timeout = 10000 }) {
  const seleniumBy = getBy(by, locator);
  const element = await driver.wait(until.elementLocated(seleniumBy), timeout);
  await driver.actions({ bridge: true }).move({ origin: element }).perform();
}

async function scrollToBottom(driver, options = null) {
  if (!options) {
    // Scroll al final de la ventana
    await driver.executeScript(
      "window.scrollTo(0, document.body.scrollHeight);"
    );
  } else {
    const { locator, by = "id" } = options;
    let script;
    if (by === "id") {
      script = `
        var el = document.getElementById('${locator}');
        if (el) el.scrollTop = el.scrollHeight;
      `;
    } else if (by === "name") {
      script = `
        var el = document.getElementsByName('${locator}')[0];
        if (el) el.scrollTop = el.scrollHeight;
      `;
    } else if (by === "css") {
      script = `
        var el = document.querySelector('${locator}');
        if (el) el.scrollTop = el.scrollHeight;
      `;
    } else if (by === "xpath") {
      script = `
        var el = document.evaluate("${locator}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (el) el.scrollTop = el.scrollHeight;
      `;
    } else {
      throw new Error("Tipo de búsqueda no soportado en scrollToBottom: " + by);
    }
    await driver.executeScript(script);
  }
}

async function scrollToTop(driver, options = null) {
  if (!options) {
    // Scroll al inicio de la ventana
    await driver.executeScript("window.scrollTo(0, 0);");
  } else {
    const { locator, by = "id" } = options;
    let script;
    if (by === "id") {
      script = `
        var el = document.getElementById('${locator}');
        if (el) el.scrollTop = 0;
      `;
    } else if (by === "name") {
      script = `
        var el = document.getElementsByName('${locator}')[0];
        if (el) el.scrollTop = 0;
      `;
    } else if (by === "css") {
      script = `
        var el = document.querySelector('${locator}');
        if (el) el.scrollTop = 0;
      `;
    } else if (by === "xpath") {
      script = `
        var el = document.evaluate("${locator}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (el) el.scrollTop = 0;
      `;
    } else {
      throw new Error("Tipo de búsqueda no soportado en scrollToTop: " + by);
    }
    await driver.executeScript(script);
  }
}

// prettier-ignore
async function getAutocompleteOptions(driver,{ 
  locator, 
  sleeptime = 0, 
  by = "id" 
}) {
  if (sleeptime > 0) await sleep(sleeptime);
  const ul = await driver.findElement(getBy(by, locator));
  const divs = await ul.findElements(By.css("li > div.ui-menu-item-wrapper"));
  const result = [];
  for (const div of divs) {
    const value = await div.getText();
    const id = await div.getAttribute("id");
    // Solo agregar si el value no es string vacío
    if (value !== "") {
      result.push({ value, id });
    }
  }
  return result;
}

// prettier-ignore
async function selectInUL(
  driver,
  { locator, by = "id", tipo = "numero", value = 0 }
) {
  const ul = await driver.findElement(getBy(by, locator));
  const divs = await ul.findElements(By.css("li > div.ui-menu-item-wrapper"));

  let targetDiv = null;

  if (tipo === "numero") {
    if (typeof value !== "number" || value < 0 || value >= divs.length) {
      throw new Error("Índice fuera de rango para selectLIInUL");
    }
    targetDiv = divs[value];
  } else if (tipo === "valor") {
    for (const div of divs) {
      const text = await div.getText();
      if (text.trim() === String(value).trim()) {
        targetDiv = div;
        break;
      }
    }
  } else if (tipo === "id") {
    for (const div of divs) {
      const idAttr = await div.getAttribute("id");
      if (idAttr === value) {
        targetDiv = div;
        break;
      }
    }
  } else if (tipo === "name") {
    for (const div of divs) {
      const nameAttr = await div.getAttribute("name");
      if (nameAttr === value) {
        targetDiv = div;
        break;
      }
    }
  } else {
    throw new Error("Tipo de búsqueda no soportado en selectLIInUL: " + tipo);
  }

  if (!targetDiv) {
    throw new Error(
      `No se encontró el elemento <li> en el <ul> (${locator}) con ${tipo}: ${value}`
    );
  }

  await targetDiv.click();
}

async function obtenerCantidadFilasTablaCotizaciones(
  driver,
  idElemento = "tableCotizaciones_wrapper"
) {
  const tbody = await driver.findElement(By.css(`#${idElemento} tbody`));
  const filas = await tbody.findElements(By.css("tr"));
  return filas.length;
}

async function guardarEnArchivo(data, filename = null, directory = null) {
  try {
    // Directorio por defecto
    const defaultDirectory = path.join(__dirname, "../../logs/cotizaciones");
    const targetDirectory = directory || defaultDirectory;

    // Crear directorio si no existe
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory, { recursive: true });
    }

    // Generar nombre de archivo con timestamp si no se proporciona
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const defaultFilename = `cotizacion_${timestamp}.json`;
    const finalFilename = filename || defaultFilename;

    // Ruta completa del archivo
    const filePath = path.join(targetDirectory, finalFilename);

    // Preparar datos con metadata
    const dataToSave = {
      timestamp: new Date().toISOString(),
      data: data,
    };

    // Guardar archivo usando fs síncrono
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf8");

    console.log(`Archivo guardado exitosamente: ${filePath}`);
    return {
      status: true,
      path: filePath,
      filename: finalFilename,
    };
  } catch (error) {
    console.error("Error al guardar archivo:", error.message);
    return {
      status: false,
      error: error.message,
    };
  }
}

async function getElementValue(
  driver,
  { locator, by = "id", timeout = 10000, selectReturnType = "value" }
) {
  try {
    const elementBy = getBy(by, locator);
    const element = await driver.wait(until.elementLocated(elementBy), timeout);

    // Obtener el tipo de elemento para determinar cómo extraer el valor
    const tagName = await element.getTagName();
    const inputType = await element.getAttribute("type");

    let value;

    switch (tagName.toLowerCase()) {
      case "input":
        if (inputType === "checkbox" || inputType === "radio") {
          // Para checkboxes y radio buttons, devolver si están seleccionados
          value = await element.isSelected();
        } else {
          // Para otros tipos de input, devolver el valor
          value = await element.getAttribute("value");
        }
        break;

      case "select":
        try {
          const selectedOption = await element.findElement(
            By.css("option:checked")
          );

          switch (selectReturnType.toLowerCase()) {
            case "value":
              value = await selectedOption.getAttribute("value");
              break;
            case "text":
            case "label":
              value = await selectedOption.getText();
              break;
            case "index":
              // Obtener el índice de la opción seleccionada
              const allOptions = await element.findElements(
                By.tagName("option")
              );
              for (let i = 0; i < allOptions.length; i++) {
                const isSelected = await allOptions[i].isSelected();
                if (isSelected) {
                  value = i;
                  break;
                }
              }
              break;
            case "both":
              const optionValue = await selectedOption.getAttribute("value");
              const optionText = await selectedOption.getText();
              value = { value: optionValue, text: optionText };
              break;
            case "all":
              const optionValueAll = await selectedOption.getAttribute("value");
              const optionTextAll = await selectedOption.getText();
              const allOptionsAll = await element.findElements(
                By.tagName("option")
              );
              let optionIndex = -1;
              for (let i = 0; i < allOptionsAll.length; i++) {
                const isSelected = await allOptionsAll[i].isSelected();
                if (isSelected) {
                  optionIndex = i;
                  break;
                }
              }
              const selectName = await element.getAttribute("name");
              const selectId = await element.getAttribute("id");
              value = {
                value: optionValueAll,
                text: optionTextAll,
                index: optionIndex,
                name: selectName,
                id: selectId,
              };
              break;
            case "options":
              // Obtener todas las opciones disponibles
              const allOptionsArray = await element.findElements(
                By.tagName("option")
              );
              value = [];
              for (const opt of allOptionsArray) {
                const optVal = await opt.getAttribute("value");
                const optText = await opt.getText();
                const optSelected = await opt.isSelected();
                value.push({
                  value: optVal,
                  text: optText,
                  selected: optSelected,
                });
              }
              break;
            default:
              console.warn(
                `selectReturnType "${selectReturnType}" no reconocido para select, usando "value"`
              );
              value = await selectedOption.getAttribute("value");
          }
        } catch (selectError) {
          console.warn(
            `No se encontró opción seleccionada en select ${locator}:`,
            selectError.message
          );
          // Retornar valor por defecto según el tipo solicitado
          switch (selectReturnType.toLowerCase()) {
            case "both":
              value = { value: "", text: "" };
              break;
            case "all":
              value = { value: "", text: "", index: -1, name: "", id: "" };
              break;
            case "index":
              value = -1;
              break;
            case "options":
              value = [];
              break;
            default:
              value = "";
          }
        }
        break;

      case "textarea":
        // Para textareas, obtener el valor
        value = await element.getAttribute("value");
        break;

      default:
        // Para otros elementos, obtener el texto interno
        value = await element.getText();
        break;
    }

    return value || "";
  } catch (error) {
    console.error(
      `Error al obtener valor del elemento ${by}="${locator}":`,
      error.message
    );
    throw error;
  }
}

async function redireccionarPagina(driver, options = {}) {
  const { urlEmision = null, esperarCarga = false } = options;

  if (!urlEmision) {
    throw new Error("urlEmision es obligatorio para redireccionarPagina");
  }

  await driver.get(urlEmision);

  if (esperarCarga) {
    await esperarCargaCompleta(driver);
  }

  return true; // Tiempo de espera agotado sin encontrar elementos
}

async function esperarElementosAlternativosCustom(driver, options = {}) {
  const {
    errorSelector = "modalErrorWithQuoteInfo",
    successSelector = "coberturasAccesorias",
    errorBy = "id",
    successBy = "id",
    timeout = 120000,
    pollInterval = 500,
  } = options;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Verificar elemento de error
      const errorBy_ = getBy(errorBy, errorSelector);
      const errorElements = await driver.findElements(errorBy_);
      if (errorElements.length > 0) {
        const isVisible = await errorElements[0].isDisplayed();
        if (isVisible) {
          return false;
        }
      }

      // Verificar elemento de éxito
      const successBy_ = getBy(successBy, successSelector);
      const successElements = await driver.findElements(successBy_);
      if (successElements.length > 0) {
        const isVisible = await successElements[0].isDisplayed();
        if (isVisible) {
          return true;
        }
      }

      await sleep(pollInterval);
    } catch (error) {
      console.warn("⚠️ Error menor en la búsqueda:", error.message);
      await sleep(pollInterval);
    }
  }

  return false; // Tiempo de espera agotado sin encontrar elementos
}

async function validarExisteOption(driver, options = {}) {
  const {
    locator,
    by = "id",
    valueOption = null,
    tipoValor = "value", // value, label
    formatoComparacion = "original", // original, mayusculas, minusculas, capitalizar, camelCase, kebab-case, snake_case
  } = options;

  if (!locator || valueOption === null) {
    // prettier-ignore
    throw new Error("locator y valueOption son obligatorios en validarExisteOption");
  }

  // Validar formatoComparacion
  const formatosValidos = [
    "original",
    "mayusculas",
    "minusculas",
    "capitalizar",
    "camelCase",
    "kebab-case",
    "snake_case",
    "upper",
    "lower",
    "capitalize",
    "normal",
  ];

  if (!formatosValidos.includes(formatoComparacion)) {
    // prettier-ignore
    throw new Error(`formatoComparacion debe ser uno de: ${formatosValidos.join(", ")}. Recibido: "${formatoComparacion}"`);
  }

  let selectOptions = await getSelectOptions(driver, {
    sleeptime: 1000,
    locator,
    by,
  });

  if (selectOptions.length === 0) {
    throw new Error("No se encontraron opciones en el select");
  }

  // Normalizar opciones según el formato de comparación
  selectOptions.forEach((opt) => {
    opt.label = formatearTexto(opt.label, formatoComparacion);
    if (typeof opt.value === "string") {
      opt.value = formatearTexto(opt.value, formatoComparacion);
    }
  });

  // Normalizar valor a buscar usando la función genérica
  const valorParaComparar = formatearTexto(valueOption, formatoComparacion);

  let existe = false;

  if (tipoValor === "value") {
    existe = selectOptions.some((opt) => opt.value === valorParaComparar);
  } else if (tipoValor === "label") {
    existe = selectOptions.some((opt) => opt.label === valorParaComparar);
  }

  return existe;
}

function formatearTexto(texto, formato = "original") {
  const textoStr = String(texto);

  switch (formato) {
    case "mayusculas":
    case "upper":
      return textoStr.toUpperCase();

    case "minusculas":
    case "lower":
      return textoStr.toLowerCase();

    case "capitalizar":
    case "capitalize":
      return textoStr.charAt(0).toUpperCase() + textoStr.slice(1).toLowerCase();

    case "camelCase":
      return textoStr
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());

    case "kebab-case":
      return textoStr
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    case "snake_case":
      return textoStr
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    case "original":
    case "normal":
    default:
      return textoStr;
  }
}

async function closeModal(driver, options = {}) {
  const {
    locator,
    by = "id",
    btnLabel = "Aceptar",
    message,
    timeout = 10000,
    sleepBefore = 1000,
    sleepAfter = 1000,
    autoClose = true,
  } = options;

  if (!locator) {
    throw new Error("El parámetro 'locator' es obligatorio en closeModal");
  }

  try {
    // Esperar después de cerrar
    if (sleepBefore > 0) {
      await sleep(sleepBefore);
    }
    // Esperar a que aparezca el modal
    await waitForElement(driver, { locator, by, timeout });

    let mensajeTexto = "";
    let botonUsado = "";
    let modalCerrado = false;

    // Obtener el mensaje si se especifica el ID
    if (message) {
      try {
        mensajeTexto = await getElementText(driver, {
          locator: message,
          by: "id",
        });
      } catch (messageError) {
        // prettier-ignore
        console.log(`⚠️ No se pudo obtener el mensaje con ID '${message}':`,messageError.message);
      }
    }

    // Selectores más específicos para encontrar el botón solicitado
    const buttonSelectorsEspecificos = [
      // Buscar exactamente el texto del botón
      `//button[normalize-space(text())='${btnLabel}']`,
      `//button[normalize-space()='${btnLabel}']`,
      `//button[text()='${btnLabel}']`,

      // Buscar que contenga el texto
      `//button[contains(normalize-space(text()), '${btnLabel}')]`,
      `//button[contains(text(), '${btnLabel}')]`,

      // Buscar en inputs
      `//input[@type='button' and normalize-space(@value)='${btnLabel}']`,
      `//input[@type='submit' and normalize-space(@value)='${btnLabel}']`,

      // Buscar en enlaces
      `//a[normalize-space(text())='${btnLabel}']`,
      `//a[contains(text(), '${btnLabel}')]`,

      // Buscar con data-dismiss y que contenga el texto
      `//button[@data-dismiss='modal' and contains(text(), '${btnLabel}')]`,

      // Buscar dentro del modal específico
      `//*[@id='${locator}']//button[contains(text(), '${btnLabel}')]`,
      `//*[@id='${locator}']//button[normalize-space(text())='${btnLabel}']`,
    ];

    // Intentar encontrar el botón específico solicitado
    for (const selector of buttonSelectorsEspecificos) {
      try {
        const elements = await driver.findElements(getBy("xpath", selector));

        if (elements.length > 0) {
          for (const button of elements) {
            try {
              const isVisible = await button.isDisplayed();
              const isEnabled = await button.isEnabled();

              if (isVisible && isEnabled) {
                await button.click();
                botonUsado = btnLabel;
                modalCerrado = true;
                break;
              }
            } catch (buttonClickError) {
              continue;
            }
          }

          if (modalCerrado) break;
        }
      } catch (selectorError) {
        continue;
      }
    }

    // Si no se encontró el botón específico y autoClose es true
    if (!modalCerrado && autoClose) {
      // Selectores para cerrar automáticamente
      const autoCloseSelectors = [
        // Botones "Close"
        { xpath: `//button[normalize-space(text())='Close']`, tipo: "Close" },
        { xpath: `//button[contains(text(), 'Close')]`, tipo: "Close" },
        { xpath: `//button[@aria-label='Close']`, tipo: "Close" },

        // Botones con data-dismiss
        { css: `button[data-dismiss='modal']`, tipo: "Close" },
        { css: `.btn[data-dismiss='modal']`, tipo: "Close" },

        // Botones de cerrar genéricos
        { css: `.close`, tipo: "Close" },
        { css: `.btn-close`, tipo: "Close" },
        { xpath: `//button[contains(@class, 'close')]`, tipo: "Close" },

        // Cualquier botón dentro del modal
        { css: `.modal-footer .btn`, tipo: "Generic" },
        { css: `.modal-content .btn`, tipo: "Generic" },
      ];

      for (const selectorObj of autoCloseSelectors) {
        try {
          const { xpath, css, tipo } = selectorObj;
          const selector = xpath || css;
          const byType = xpath ? "xpath" : "css";

          const elements = await driver.findElements(getBy(byType, selector));

          if (elements.length > 0) {
            const button = elements[0];
            const isVisible = await button.isDisplayed();
            const isEnabled = await button.isEnabled();

            if (isVisible && isEnabled) {
              await button.click();

              botonUsado = tipo;
              modalCerrado = true;
              break;
            }
          }
        } catch (autoCloseError) {
          continue;
        }
      }

      // Si aún no se pudo cerrar, usar tecla ESC
      if (!modalCerrado) {
        try {
          await driver.actions().sendKeys("\uE00C").perform(); // ESC key
          botonUsado = "ESC";
          modalCerrado = true;
        } catch (escError) {
          // prettier-ignore
          throw new Error("No se pudo cerrar el modal con ningún método disponible");
        }
      }
    }

    // Si autoClose es false y no se encontró el botón, no cerrar
    if (!modalCerrado && !autoClose) {
      return {
        result: false,
        mensaje: mensajeTexto,
        cerradoCon: null,
        modalEncontrado: true,
        error: `No se encontró el botón "${btnLabel}" y autoClose está deshabilitado`,
      };
    }

    // Esperar después de cerrar
    if (modalCerrado && sleepAfter > 0) {
      await sleep(sleepAfter);
    }

    return {
      result: modalCerrado,
      mensaje: mensajeTexto,
      cerradoCon: botonUsado,
      modalEncontrado: true,
    };
  } catch (error) {
    if (error.name === "TimeoutError") {
      // prettier-ignore
      console.log(`⚠️ Timeout: No se encontró el modal con locator '${locator}' en ${timeout}ms`);
      return {
        result: false,
        mensaje: "",
        cerradoCon: null,
        modalEncontrado: false,
        error: "Timeout esperando modal",
      };
    } else {
      console.log("❌ Error en closeModal:", error.message);
      throw error;
    }
  }
}

// Función específica para tu formulario
async function clickButtonInContenedor(driver, options = {}) {
  const { contenedor = null, labelButton = null } = options;

  if (!contenedor) {
    throw new Error("El parámetro 'contenedor' es obligatorio");
  }
  if (!labelButton) {
    throw new Error("El parámetro 'labelButton' es obligatorio");
  }
  const resultado = await driver.executeScript(`
    const boton = document.querySelector('#${contenedor} button[type="submit"]') ||
                  [...document.querySelectorAll('button')].find(btn => 
                    btn.textContent.includes('${labelButton}'));

    if (boton) {
      boton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 500));
      boton.click();
      return { result: true, text: boton.textContent.trim() };
    }
    return { result: false, error: 'Botón   no encontrado' };
  `);

  if (!resultado.result) {
    throw new Error(resultado.error);
  }

  return resultado;
}

async function esperarArchivoDescargado(options = {}) {
  const {
    archivosAntes = [],
    downloadPath = path.join(os.homedir(), "Downloads"),
    extensiones = [".zip", ".pdf"],
    palabrasClave = ["download", "files"],
    maxIntentos = 30,
    intervalo = 2000,
    nuevoNombre = null,
    logs = false,
  } = options;

  if (logs) {
    console.log("⏳ Esperando archivo descargado...");
    console.log("📁 Carpeta de descarga:", downloadPath);
  }

  let archivoDescargado = null;
  let intentos = 0;

  while (!archivoDescargado && intentos < maxIntentos) {
    await sleep(intervalo);
    intentos++;

    try {
      // Obtener archivos actuales
      const archivosActuales = fs.existsSync(downloadPath)
        ? fs.readdirSync(downloadPath)
        : [];

      // Buscar archivos nuevos
      const archivosNuevos = archivosActuales.filter(
        (archivo) => !archivosAntes.includes(archivo)
      );

      if (logs) {
        console.log(
          `🔍 Intento ${intentos}/${maxIntentos} - Archivos nuevos:`,
          archivosNuevos.length
        );
      }

      if (archivosNuevos.length > 0 && logs) {
        console.log("📁 Archivos nuevos encontrados:", archivosNuevos);
      }

      // Buscar archivo que coincida con los criterios
      const archivoEncontrado = archivosNuevos.find((archivo) => {
        const archivoLower = archivo.toLowerCase();

        // Verificar extensión
        const tieneExtensionCorrecta = extensiones.some((ext) =>
          archivoLower.endsWith(ext.toLowerCase())
        );

        // Verificar palabras clave (si se especifican)
        const tienePalabraClave =
          palabrasClave.length === 0 ||
          palabrasClave.some((palabra) =>
            archivoLower.includes(palabra.toLowerCase())
          );

        return tieneExtensionCorrecta || tienePalabraClave;
      });

      if (archivoEncontrado) {
        const rutaCompleta = path.join(downloadPath, archivoEncontrado);

        // Verificar que el archivo existe y tiene contenido
        if (fs.existsSync(rutaCompleta)) {
          const stats = fs.statSync(rutaCompleta);

          if (stats.size > 0) {
            // Esperar para asegurar que la descarga terminó
            await sleep(2000);
            const statsNuevos = fs.statSync(rutaCompleta);

            if (stats.size === statsNuevos.size) {
              archivoDescargado = {
                nombreOriginal: archivoEncontrado,
                rutaCompleta: rutaCompleta,
                tamaño: stats.size,
              };

              if (logs) {
                console.log(
                  `✅ Archivo descargado: ${archivoEncontrado} (${stats.size} bytes)`
                );
              }
            } else if (logs) {
              console.log(
                `⏳ Descarga en progreso: ${archivoEncontrado} (${stats.size} -> ${statsNuevos.size} bytes)`
              );
            }
          }
        }
      }
    } catch (error) {
      if (logs) {
        console.log(`⚠️ Error verificando descarga: ${error.message}`);
      }
    }
  }

  if (archivoDescargado) {
    // Renombrar el archivo si se especifica
    if (nuevoNombre && archivoDescargado.nombreOriginal !== nuevoNombre) {
      try {
        const extension = path.extname(archivoDescargado.nombreOriginal);
        const nombreCompleto = nuevoNombre.endsWith(extension)
          ? nuevoNombre
          : nuevoNombre + extension;
        const nuevaRuta = path.join(downloadPath, nombreCompleto);

        fs.renameSync(archivoDescargado.rutaCompleta, nuevaRuta);

        if (logs) {
          console.log(`📝 Archivo renombrado a: ${nombreCompleto}`);
        }

        archivoDescargado.rutaCompleta = nuevaRuta;
        archivoDescargado.nombreFinal = nombreCompleto;
      } catch (renameError) {
        if (logs) {
          console.log(`⚠️ No se pudo renombrar: ${renameError.message}`);
        }
        archivoDescargado.nombreFinal = archivoDescargado.nombreOriginal;
      }
    } else {
      archivoDescargado.nombreFinal = archivoDescargado.nombreOriginal;
    }

    return {
      result: true,
      nombreArchivo: archivoDescargado.nombreFinal,
      rutaCompleta: archivoDescargado.rutaCompleta,
      tamaño: archivoDescargado.tamaño,
      message: "Descarga completada exitosamente",
    };
  } else {
    if (logs) {
      console.log("❌ La descarga no se completó en el tiempo esperado");

      // Debug: mostrar archivos actuales
      const archivosFinales = fs.existsSync(downloadPath)
        ? fs.readdirSync(downloadPath)
        : [];
      console.log(
        "📁 Archivos actuales en Downloads:",
        archivosFinales.slice(0, 10)
      );
    }

    return {
      result: false,
      error: `Timeout: La descarga no se completó en ${
        (maxIntentos * intervalo) / 1000
      } segundos`,
    };
  }
}
module.exports = {
  closeModal,
  esperarArchivoDescargado,
  clickButtonInContenedor,
  validarExisteOption,
  redireccionarPagina,
  esperarCargaCompleta,
  acercarHaElemento,
  openPage,
  switchToWindow,
  waitForElement,
  esperarElementosAlternativosCustom,
  sleep,
  setInputValue,
  setCheckboxValue,
  selectInUL,
  selectMatOption,
  selectOptionInSelect,
  getElementText,
  getSelectOptions,
  getElement,
  getElementValue,
  getAutocompleteOptions,
  clickElement,
  clickInElementNotClickeable,
  demo,
  printWindowTitles,
  printCurrentWindowTitle,
  forzarCierre,
  setHover,
  scrollToBottom,
  scrollToTop,
  enableFirstDisabledOption,
  obtenerCantidadFilasTablaCotizaciones,
  guardarEnArchivo,
  saveCurrentHtmlToTxt,
  getBy,
};
