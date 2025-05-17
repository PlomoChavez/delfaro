const { Builder, By, until } = require("selenium-webdriver");

async function setInputValue(driver, locator, value, by = By.id) {
  const input = await driver.wait(until.elementLocated(by(locator)), 10000);
  await input.sendKeys(value);
}

async function clickElement(driver, locator, by = By.linkText) {
  const element = await driver.findElement(by(locator));
  await driver.sleep(1000);
  await element.click();
}

async function selectMatOption(driver, selectLocator, optionText, by = By.id) {
  try {
    const matSelect = await driver.findElement(by(selectLocator));
    await matSelect.click();
    await driver.wait(
      until.elementLocated(
        By.xpath(
          `//mat-option[.//span[normalize-space(text())='${optionText.trim()}']]`
        )
      ),
      10000
    );
    const option = await driver.findElement(
      By.xpath(
        `//mat-option[.//span[normalize-space(text())='${optionText.trim()}']]`
      )
    );
    await option.click();
  } catch (e) {
    console.log(`Error al seleccionar la opción '${optionText.trim()}'`);
  }
}

async function customParametrosFlexibles(driver, data) {
  await selectMatOption(
    driver,
    "sumaaseguradaId",
    data.parametrosFlexibles.sumaAsegurada.label,
    By.name
  );
  await driver.sleep(1000);
  await selectMatOption(
    driver,
    "deducibleId",
    data.parametrosFlexibles.deducible.label,
    By.name
  );
  await driver.sleep(1000);
  await selectMatOption(
    driver,
    "coaseguroId",
    data.parametrosFlexibles.coaseguro.label,
    By.name
  );
  await driver.sleep(1000);
  await selectMatOption(
    driver,
    "topeDropdown",
    data.parametrosFlexibles.topeMaximo.label,
    By.name
  );
  await driver.sleep(1000);
  await selectMatOption(
    driver,
    "basehospitalariaId",
    data.parametrosFlexibles.nivelHospitalario.label,
    By.name
  );
  await driver.sleep(1000);
  await selectMatOption(
    driver,
    "honorariosquirurgicosId",
    data.parametrosFlexibles.thq.label,
    By.name
  );
  await driver.sleep(1000);
  await selectMatOption(
    driver,
    "pago",
    data.parametrosFlexibles.frecuenciaPago.label,
    By.name
  );
  await driver.sleep(1000);
}

async function customParametrosProteccion(driver, data) {
  if (data.proteccionAdicional.emergenciaExtranjero) {
    await clickElement(driver, "emergenciaExtranjero", By.id);
    await driver.sleep(1000);
    await selectMatOption(
      driver,
      "emergenciaExtranjeroFactor",
      data.proteccionAdicional.sumaAsegurada.label,
      By.name
    );
    await driver.sleep(1000);
  }
  if (data.proteccionAdicional.coberturaExtranjero) {
    await clickElement(driver, "coberturaExtranjero", By.id);
    await driver.sleep(1000);
  }
  if (data.proteccionAdicional.atencionDental) {
    await clickElement(driver, "primaCoberturaDentalBool", By.id);
    await driver.sleep(1000);
    await selectMatOption(
      driver,
      "primaCoberturaDentalTarifa",
      data.proteccionAdicional.atencionDentalSelect.label,
      By.name
    );
    await driver.sleep(1000);
  }
  if (data.proteccionAdicional.indemnizacionDiaria) {
    await clickElement(driver, "indemnizacionDiariaHospitalizacion", By.name);
    await driver.sleep(1000);
    await selectMatOption(
      driver,
      "indemnizacionDiariaFactor",
      data.proteccionAdicional.indemnizacionDiariaSelect.label,
      By.name
    );
    await driver.sleep(1000);
  }
  if (data.proteccionAdicional.reduccionCoaseguro) {
    await clickElement(driver, "reduccionCoaseguroNarizAccidente", By.id);
    await driver.sleep(1000);
  }
  if (data.proteccionAdicional.eliminacionDeducible) {
    await clickElement(driver, "eliminacionDeducibleAccidente", By.id);
    await driver.sleep(1000);
  }
}

// Utilidad para extraer etiquetas y valores de un contenedor
async function extraerEtiquetasYValores(data) {
  const html = await data.getAttribute("outerHTML");
  const cheerio = require("cheerio");
  const $ = cheerio.load(html);
  const resultado = {};

  // Busca todos los div.row dentro del HTML, sin importar el contenedor raíz
  $("div.row").each((i, elem) => {
    const etiqueta = $(elem).find("span").first().text().trim();
    const numbersDiv = $(elem).find(".numbers").first();
    let valor = "";
    const h6s = numbersDiv.find("h6");
    if (h6s.length) {
      valor = h6s
        .map((i, el) => $(el).text().trim())
        .get()
        .join(" ");
    } else {
      valor = numbersDiv.text().trim();
    }
    if (etiqueta) resultado[etiqueta] = valor;
  });

  return resultado;
}
// Utilidad para extraer etiquetas y valores de un HTML (usando cheerio)
const cheerio = require("cheerio");
function extraerEtiquetasYValores2(html) {
  const $ = cheerio.load(html);
  const bloque = $(".params").first();
  const resultado = {};
  let seccionActual = null;
  let conceptos = [];

  bloque.children().each((i, elem) => {
    if (elem.tagName === "h5") {
      // Si ya hay una sección previa, guárdala
      if (seccionActual && conceptos.length) {
        resultado[seccionActual] = conceptos;
      }
      seccionActual = $(elem).text().trim();
      conceptos = [];
    } else if (elem.tagName === "div" && $(elem).hasClass("col-6")) {
      const span = $(elem).find("span");
      const h6 = $(elem).find("h6");
      let concepto = "";
      if (span.length) concepto += span.text().trim();
      if (h6.length) concepto += `: ${h6.text().trim()}`;
      if (concepto) conceptos.push(concepto);
    } else if (elem.tagName === "hr") {
      // Al llegar a un hr, guarda la sección actual
      if (seccionActual && conceptos.length) {
        resultado[seccionActual] = conceptos;
        conceptos = [];
      }
    }
  });
  // Guarda la última sección si existe
  if (seccionActual && conceptos.length) {
    resultado[seccionActual] = conceptos;
  }
  return resultado;
}

// Función principal
async function ejecutarCotizacion(data) {
  let driver;
  try {
    const chrome = require("selenium-webdriver/chrome");
    const options = new chrome.Options();
    // options.addArguments("--headless=new"); // Usa '--headless' o '--headless=new' según tu versión de Chrome
    // options.addArguments("--no-sandbox");
    // options.addArguments("--disable-dev-shm-usage");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    await driver.get("https://agentes.planseguro.com.mx/login");

    await driver.wait(until.elementLocated(By.id("numero")), 10000);

    await setInputValue(driver, "numero", "5_14076");
    await setInputValue(driver, "password", "ACEBBBAAEDCCA");
    await clickElement(
      driver,
      "input[type='submit'][value='Ingresar']",
      By.css
    );

    await driver.wait(
      until.elementLocated(By.linkText("Emisión digital")),
      10000
    );
    await clickElement(driver, "Emisión digital", By.linkText);
    await clickElement(driver, "Cotizador", By.linkText);

    const handles = await driver.getAllWindowHandles();
    await driver.switchTo().window(handles[1]);
    await driver.sleep(1000);

    await setInputValue(driver, "nombre", data.titular.nombre, By.name);
    await selectMatOption(
      driver,
      "mat-select-0",
      data.titular.sexo.label,
      By.id
    );

    // Formatea la fecha
    const fecha = new Date(data.titular.fechaNacimiento);
    const fechaConvertida = `${String(fecha.getDate()).padStart(
      2,
      "0"
    )}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
    await setInputValue(driver, "mat-input-1", fechaConvertida);

    await selectMatOption(
      driver,
      "mat-select-1",
      data.titular.localidad.label,
      By.id
    );

    await driver.executeScript(
      "document.querySelector('button[type=\"submit\"]').removeAttribute('disabled')"
    );
    await clickElement(driver, "button[type='submit']", By.css);

    if (!data.personas.length) {
      await clickElement(driver, "button.go-to-cotizar", By.css);
    }

    await driver.sleep(1000);
    const planNameElement = await driver.findElement(By.css("span.plan-name"));
    const planNameText = (await planNameElement.getText()).trim();

    if (planNameText === data.plan.label) {
      const planContainer = await planNameElement.findElement(
        By.xpath("./ancestor::div[contains(@class, 'card')]")
      );
      const personalizaButton = await planContainer.findElement(
        By.css("h6.borderless-button")
      );
      await personalizaButton.click();

      const steps = [
        "Parámetros flexibles",
        "Protección con costo adicional",
        "Reconocimiento de Antigüedad",
      ];
      for (let index = 0; index < steps.length; index++) {
        const step = steps[index];
        const section = await driver.wait(
          until.elementLocated(
            By.xpath(
              `//section[contains(@class, 'card') and .//h6[text()='${step}']]`
            )
          ),
          10000
        );
        await driver.sleep(2000);
        const editButton = await section.findElement(
          By.css("div.edit-param img")
        );
        await driver.executeScript("arguments[0].click();", editButton);

        if (index === 0) await customParametrosFlexibles(driver, data);
        if (index === 1) await customParametrosProteccion(driver, data);

        await clickElement(
          driver,
          "//button[normalize-space(text())='Actualizar costo']",
          By.xpath
        );
        await driver.wait(
          until.elementLocated(
            By.xpath("//button[normalize-space(text())='Ver Resumen']")
          ),
          50000
        );
      }
      await clickElement(
        driver,
        "//button[normalize-space(text())='Ver Resumen']",
        By.xpath
      );
    }

    // Extraer información
    const resumen = await driver.wait(
      until.elementLocated(By.className("payment")),
      50000
    );
    console.log("resumen_info");
    const resumen_info = await extraerEtiquetasYValores(resumen);
    const params_flex = await driver.findElement(
      By.xpath(
        "//div[contains(@class, 'basic-params') and .//h3[contains(text(),'Parámetros flexibles')]]//div[contains(@class, 'params')]"
      )
    );
    const params_costo = await driver.findElement(
      By.xpath(
        "//div[contains(@class, 'basic-params') and .//h3[contains(text(),'Protección con costo')]]//div[contains(@class, 'params')]"
      )
    );
    console.log("params_flex_info");
    const params_flex_info = await extraerEtiquetasYValores(params_flex);
    const params_costo_html = await params_costo.getAttribute("outerHTML");
    const params_costo_info = extraerEtiquetasYValores2(params_costo_html);

    return {
      resumen: resumen_info,
      parametros_flexibles: params_flex_info,
      proteccion_con_costo: params_costo_info,
    };
  } finally {
    if (driver) await driver.quit();
  }
}

module.exports = { ejecutarCotizacion };
