const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

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
async function setInputValue(driver, { locator, value, by = "id" }) {
  const input = await driver.wait( until.elementLocated(getBy(by, locator)), 10000 );
  await input.sendKeys(value);
}

async function getElement(driver, { locator, by = "id", multiple = false }) {
  if (multiple) {
    return driver.findElements(getBy(by, locator));
  }
  return driver.findElement(getBy(by, locator));
}

// prettier-ignore
async function clickElement(driver, { locator, by = "id", timeout = 10000 }) {
  try {
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
  // Encuentra el select por name
  const select = await driver.findElement(
    By.name("emergenciaExtranjeroFactor")
  );
  // Haz click para desplegar las opciones (si es un mat-select)
  await driver.executeScript("arguments[0].click();", select);
  await sleep(1000);

  // Espera y obtiene todas las opciones desplegadas (ajusta el selector si es necesario)
  const options = await driver.findElements(
    By.css(".mat-select-panel .mat-option-text")
  );
  console.log("Opciones disponibles para emergenciaExtranjeroFactor:");
  for (const option of options) {
    const text = await option.getText();
    console.log(` - '${text}'`);
  }

  // Cierra el panel (opcional)
  await driver.executeScript("arguments[0].click();", select);
  await sleep(500);
}

module.exports = {
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
};
