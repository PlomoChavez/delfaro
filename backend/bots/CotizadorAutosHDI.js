const {
  openPage,
  waitForElement,
  sleep,
  setInputValue,
  clickElement,
  selectMatOption,
  switchToWindow,
  getElement,
  getElementText,
  clickInElementNotClickeable,
  selectOptionInSelect,
  forzarCierre,
  demo,
  setHover,
  scrollToBottom,
} = require("./helpers/seleniumHelper");

const { cerrarModalSiExiste } = require("./helpers/AxaHelper");
const {
  getValoresTotales,
  waitForDivWithContent,
  getValoresTotalesTable,
  clickDetalleCotizacion,
  waitForTablaCotizacionesConFilas,
} = require("./helpers/HDIHelper");

async function ejecutarCotizacionAutos(data) {
  let numeroCotizacion = data.numeroCotizacion || "0000027693";
  let driver;
  let dataResponse = {};
  try {
    // prettier-ignore
    driver = await openPage("https://portalagentes.hdi.com.mx/Login.aspx", {
      headless: false,
    });

    let user = 113034;
    let password = "HDIchih25&";

    await waitForElement(driver, {
      locator: "ctl00_DefaultContent_lgnacceso_UserName",
      timeout: 10000,
    });

    await setInputValue(driver, {
      locator: "ctl00_DefaultContent_lgnacceso_UserName",
      value: user,
    });

    await setInputValue(driver, {
      locator: "ctl00_DefaultContent_lgnacceso_Password",
      value: password,
    });

    await clickElement(driver, {
      locator: "ctl00_DefaultContent_lgnacceso_LoginButton",
      sleeptime: 100,
    });

    // prettier-ignore
    await setHover(driver, {
      locator: "//a[contains(@class, 'seguro-link') and .//span[normalize-space(text())='Ir a Cotizar']]",
      timeout: 10000,
      by: "xpath",
    });

    // prettier-ignore
    await clickElement(driver, {
      locator:"//a[contains(@class, 'seguro-link') and .//span[normalize-space(text())='Ir a Cotizar']]",
      sleeptime: 100,
      by: "xpath",
    });

    await switchToWindow(driver);

    await clickElement(driver, {
      locator: "divAdministrar",
      sleeptime: 100,
    });
    console.log("Esperando a que se cargue la página de cotización...");
    await waitForElement(driver, {
      locator: "divPolizas",
      timeout: 20000,
    });

    console.log("Página de cotización cargada.");
    await clickElement(driver, {
      locator: "btnBuscar",
      sleeptime: 100,
    });

    console.log("Tabla de cotizaciones cargada.");
    await sleep(1000);

    await waitForTablaCotizacionesConFilas(driver);

    console.log("Buscando cotización:", numeroCotizacion);
    await clickDetalleCotizacion(driver, numeroCotizacion);

    // await clickElement(driver, {
    //   locator: "divCotizar",
    //   sleeptime: 100,
    // });

    // await waitForDivWithContent(driver, "divCargando", 15000);

    // await sleep(10000);

    // await setInputValue(driver, {
    //   sleeptime: 1000,
    //   locator: "txtCodigoPostal",
    //   value: "39600",
    // });

    // await waitForDivWithContent(driver, "divCargando", 15000);

    // // prettier-ignore
    // await clickElement(driver, {
    //   locator:"btnTipoVehiculoGlm",
    //   sleeptime: 100
    // });

    // // prettier-ignore
    // await clickElement(driver, {
    //   locator:'//a[@class="EstiloPopover" and normalize-space(text())="VEHICULOS RESIDENTES"]',
    //   sleeptime: 1000,
    //   by: "xpath",
    // });

    // // prettier-ignore
    // await clickElement(driver, {
    //   locator:'//a[@class="EstiloPopover" and normalize-space(text())="HONDA"]',
    //   sleeptime: 1000,
    //   by: "xpath",
    // });

    // // prettier-ignore
    // await clickElement(driver, {
    //   locator:'//a[@class="EstiloPopover" and normalize-space(text())="2020"]',
    //   sleeptime: 1000,
    //   by: "xpath",
    // });
    // // prettier-ignore
    // await clickElement(driver, {
    //   locator:'//a[@class="EstiloPopover" and normalize-space(text())="CR-V"]',
    //   sleeptime: 1000,
    //   by: "xpath",
    // });
    // // prettier-ignore
    // await clickElement(driver, {
    //   locator: '//a[@class="EstiloPopover" and normalize-space(text())="TOURING L4 1.5T 188 CP 5 PUERTAS AUT PIEL BA AA QC\\AUTOMATICA CVT"]',
    //   sleeptime: 1000,
    //   by: "xpath",
    // });

    // await waitForDivWithContent(driver, "divCargando", 15000);

    // await scrollToBottom(driver);

    // await waitForElement(driver, {
    //   locator: "btnTarificar",
    //   timeout: 20000,
    // });

    // await clickElement(driver, {
    //   locator: "btnTarificar",
    //   sleeptime: 1000,
    //   timeout: 20000,
    // });

    // await waitForDivWithContent(driver, "divCargando", 15000);

    // await waitForElement(driver, {
    //   locator: '//div[@id="tblTotales"]//div[@style="color:#000000;"]',
    //   by: "xpath",
    //   timeout: 20000,
    // });

    // const valores = await getValoresTotalesTable(driver);

    // console.log(valores);

    // await clickElement(driver, {
    //   locator: "btnMostrarModalGuardarCotizacion",
    //   sleeptime: 1000,
    // });
    // await clickElement(driver, {
    //   locator: "btnGuardarCotizacion",
    //   sleeptime: 1000,
    // });

    // await waitForDivWithContent(driver, "divCargando", 15000);

    // await waitForElement(driver, {
    //   locator: "DivMensaje",
    //   by: "id",
    //   timeout: 20000,
    // });

    // let mensaje = await getElementText(driver, {
    //   locator: "DivMensaje",
    //   by: "id",
    // });

    // console.log("Mensaje de guardado:", mensaje);
  } catch (error) {
    console.error("Error general en la cotización:", error);
  } finally {
    await sleep(200000);
    if (driver) await driver.quit();
  }
}

module.exports = { ejecutarCotizacionAutos };
