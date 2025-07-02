const {
  openPage,
  waitForElement,
  sleep,
  setInputValue,
  clickElement,
  selectMatOption,
  switchToWindow,
  getElement,
  clickInElementNotClickeable,
} = require("./helpers/seleniumHelper");

const { By } = require("selenium-webdriver");

const {
  cerrarModalSiExiste,
  handleStepsForm,
} = require("./helpers/planSeguroHelper");

async function ejecutarCotizacion(data) {
  let driver;
  try {
    driver = await openPage(
      "https://oficina.planseguro.com.mx/login?to=inicio",
      { headless: false }
    );

    await waitForElement(driver, { by: "id", locator: "username" });

    await sleep(1000);

    await setInputValue(driver, {
      locator: "username",
      value: "5_14076",
    });

    await setInputValue(driver, {
      locator: "password",
      value: "ACEBBBAAEDCCA",
    });

    await sleep(500);

    await clickElement(driver, {
      locator: "//button[text()='Continuar']",
      by: "xpath",
    });

    await sleep(500);

    await cerrarModalSiExiste(driver);

    await clickElement(driver, {
      locator: "//a[.//span[contains(text(),'Emisión Digital')]]",
      by: "xpath",
    });

    await clickElement(driver, {
      locator: "//a[.//p[contains(text(),'Cotizador')]]",
      by: "xpath",
    });

    await switchToWindow(driver);

    // Nombre
    await setInputValue(driver, {
      locator: "nombre",
      value: data.titular.nombre,
      by: "name",
    });

    // Sexo
    await selectMatOption(driver, {
      locator: "mat-select-0",
      optionText: data.titular.sexo.label,
      by: "id",
    });

    // Fecha de nacimiento
    const fecha = new Date(data.titular.fechaNacimiento);
    // prettier-ignore
    const fechaConvertida = `${String(fecha.getDate()).padStart(2,"0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;

    await setInputValue(driver, {
      locator: "mat-input-1",
      value: fechaConvertida,
      by: "id",
    });

    // Localidad
    await selectMatOption(driver, {
      locator: "mat-select-1",
      optionText: data.titular.localidad.label,
      by: "id",
    });

    await sleep(500);
    // Habilita el botón y haz click
    await driver.executeScript(
      "document.querySelector('button[type=\"submit\"]').removeAttribute('disabled')"
    );

    await sleep(500);
    await clickElement(driver, {
      locator: "button[type='submit']",
      by: "css",
    });

    await sleep(500);
    // Si no hay personas, haz click en el botón de cotizar
    if (!data.asegurados.length) {
      await clickElement(driver, {
        locator: "button.go-to-cotizar",
        by: "css",
      });
    }

    // Selecionando el plan de salud
    await waitForElement(driver, {
      locator: "h4.mt-10.mb-1.ng-star-inserted",
      by: "css",
      timeout: 20000, // ajusta el tiempo si lo necesitas
    });

    // Espera a que aparezca el elemento del nombre del plan
    await waitForElement(driver, {
      locator: "span.plan-name",
      by: "css",
      timeout: 20000,
    });

    // Obtiene todos los elementos del nombre del plan
    const planNameElements = await getElement(driver, {
      locator: "span.plan-name",
      by: "css",
      multiple: true,
    });

    let found = false;
    let selectedElement = null;

    for (const el of planNameElements) {
      const name = (await el.getText()).trim();

      if (name === data.plan.label) {
        found = true;
        selectedElement = el;
        break;
      }
    }

    if (!found) {
      console.error(
        `Error: No se encontró el plan solicitado ("${data.plan.label}"). Cerrando navegador...`
      );
      if (driver) await driver.quit();
      throw new Error("El plan seleccionado no coincide con los encontrados.");
    }

    // Busca el contenedor del plan (card)
    const planContainer = await selectedElement.findElement(
      By.xpath("./ancestor::div[contains(@class, 'card')]")
    );
    // Busca el botón de personalizar dentro del contenedor
    const personalizaButton = await planContainer.findElement(
      By.css("h6.borderless-button")
    );
    // Haz click en el botón de personalizar
    await personalizaButton.click();
    const steps = [
      // ["Parámetros flexibles", "parametrosFlexibles"],
      ["Protección con costo adicional", "proteccionAdicional"],
      // ["Reconocimiento de Antigüedad", ""],
    ];

    for (const step of steps) {
      await handleStepsForm(driver, step, data);
    }

    await clickElement(driver, {
      locator: "//button[normalize-space(text())='Ver Resumen']",
      by: "xpath",
    });

    await sleep(10000);
    console.log("Esperando a que se cargue el resumen...");
    await driver.executeScript(`
      const cont = document.querySelector('.mat-sidenav-content');
      if (cont) cont.scrollTop = cont.scrollHeight;
    `);
    console.log("Ya bajo el scroll...");
    await sleep(1000); // espera a que cargue el contenido

    // Obtén todos los íconos de descarga
    await clickInElementNotClickeable(driver, {
      locator:
        "//div[contains(@class,'toolbar-option') and .//small[text()='Descargar']]",
      by: "xpath",
    });

    await sleep(100);

    console.log("Descargando cotización...");

    await clickInElementNotClickeable(driver, {
      locator:
        "//div[contains(@class,'row') and .//span[contains(text(),'Carta propuesta')]]//img[@alt='descargar']",
      by: "xpath",
    });

    await clickInElementNotClickeable(driver, {
      locator:
        "//div[contains(@class,'row') and .//span[contains(text(),'Óptimo Plus')]]//img[@alt='descargar']",
      by: "xpath",
    });

    await clickInElementNotClickeable(driver, {
      locator:
        "//div[contains(@class,'edit-param')]//img[@src='assets/icons/plus.svg']",
      by: "xpath",
    });

    await sleep(200000);
  } catch (error) {
    console.error("Error general en la cotización:", error);
  } finally {
    if (driver) await driver.quit();
  }
}

module.exports = { ejecutarCotizacion };
