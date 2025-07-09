const { Builder, By, until, Actions } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs").promises;

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
async function setInputValue(driver, { 
    locator, 
    value, 
    by = "id", 
    sleeptime = 0, 
    changeFocus = true
  }) {
  if (sleeptime > 0) await sleep(sleeptime);
  const input = await driver.wait( until.elementLocated(getBy(by, locator)), 10000 );
  await input.sendKeys(value);
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
    console.log(`No se encontró el elemento para hacer click: ${by} -> ${locator}`);
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

async function getSelectOptions(driver, { locator, by = "id" }) {
  const select = await driver.findElement(getBy(by, locator));
  const options = await select.findElements(By.tagName("option"));
  const result = [];
  for (const option of options) {
    const value = await option.getAttribute("value");
    const label = await option.getText();
    const selected = await option.isSelected();
    result.push({ value, label, selected });
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

async function getAutocompleteOptions(driver, { locator, by = "id" }) {
  const ul = await driver.findElement(getBy(by, locator));
  const divs = await ul.findElements(By.css("li > div.ui-menu-item-wrapper"));
  const result = [];
  for (const div of divs) {
    const value = await div.getText();
    const id = await div.getAttribute("id");
    result.push({ value, id });
  }
  return result;
}

// prettier-ignore
async function selectInUL(
  driver,
  { locator, by = "id", tipo = "numero", value = 1 }
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
module.exports = {
  obtenerCantidadFilasTablaCotizaciones,
  selectInUL,
  getAutocompleteOptions,
  openPage,
  waitForElement,
  sleep,
  setInputValue,
  selectMatOption,
  switchToWindow,
  getElement,
  clickElement,
  clickInElementNotClickeable,
  demo,
  saveCurrentHtmlToTxt,
  printWindowTitles,
  printCurrentWindowTitle,
  selectOptionInSelect,
  getElementText,
  forzarCierre,
  setHover,
  scrollToBottom,
  enableFirstDisabledOption,
  getSelectOptions,
};
