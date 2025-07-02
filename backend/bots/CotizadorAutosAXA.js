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
} = require("./helpers/seleniumHelper");

const { By } = require("selenium-webdriver");

const { cerrarModalSiExiste } = require("./helpers/AxaHelper");

async function ejecutarCotizacion(data) {
  let driver;
  let dataResponse = {};
  try {
    // prettier-ignore
    driver = await openPage("https://distribuidores.axa.com.mx/", {
      headless: false,
    });

    await waitForElement(driver, { by: "id", locator: "user" });

    await setInputValue(driver, {
      locator: "user",
      value: "MXE00647937A",
    });

    await setInputValue(driver, {
      locator: "pwd",
      value: "m3.YHJ.zy3PK",
    });

    await clickElement(driver, {
      locator: "Ingresar",
      by: "name",
    });

    await waitForElement(driver, {
      locator:
        '//a[.//span[contains(normalize-space(.),"Cotizadores y Emisores")]]',
      timeout: 20000,
      by: "xpath",
    });

    await clickElement(driver, {
      locator:
        '//a[.//span[contains(normalize-space(.),"Cotizadores y Emisores")]]',
      timeout: 20000,
      by: "xpath",
    });

    await clickElement(driver, {
      locator: '//div[normalize-space(text())="Individual"]',
      timeout: 20000,
      by: "xpath",
    });

    await clickElement(driver, {
      locator:
        '//a[normalize-space(text())="Cotizador y emisor Auto Individual"]',
      timeout: 20000,
      by: "xpath",
    });

    await switchToWindow(driver);

    await cerrarModalSiExiste(driver);

    // Seleccionar para consultar una cotización
    // AA30853566;
    await clickElement(driver, {
      locator:
        '//div[contains(@class, "home-icon-menu-element") and contains(@class, "active")][.//div[contains(@class, "home-icon-menu-title") and normalize-space(text())="Cotización"]]',
      by: "xpath",
    });

    await clickElement(driver, {
      locator: "frmConsultas:lnkFiltroNumCot",
    });

    await setInputValue(driver, {
      locator: "frmConsultas:txtNumero",
      value: "AA30853566",
      sleeptime: 1000,
    });

    await clickElement(driver, {
      locator: "frmConsultas:btnBuscar",
      sleeptime: 1000,
    });

    // prettier-ignore
    dataResponse.primaNeta = await getElementText(driver, {
      locator: "frmCotizacionDetallada:subView_BannerPaquetePrima:otxtPrimaNeta",
    });
    // prettier-ignore
    dataResponse.recargo = await getElementText(driver, {
      locator: "frmCotizacionDetallada:subView_BannerPaquetePrima:otxtRecargo",
    });
    // prettier-ignore
    dataResponse.derechos = await getElementText(driver, {
      locator: "frmCotizacionDetallada:subView_BannerPaquetePrima:otxtDerechos",
    });
    // prettier-ignore
    dataResponse.iva = await getElementText(driver, {
      locator: "frmCotizacionDetallada:subView_BannerPaquetePrima:otxtIVA",
    });
    await forzarCierre(driver);
    return dataResponse;
    // Seleccionar para realizar una cotizacion
    // await clickElement(driver, {
    //   locator:
    //     '//div[contains(@class, "home-icon-menu-element") and contains(@class, "active")][.//div[contains(@class, "home-icon-menu-title") and normalize-space(text())="Residentes"]]',
    //   by: "xpath",
    // });

    // await selectOptionInSelect(driver, {
    //   locator: "frmDatosCotizacion:cmbSubramo",
    //   tipoValor: "numero",
    //   value: 1,
    // });

    // await selectOptionInSelect(driver, {
    //   locator: "frmDatosCotizacion:cmbMarca",
    //   tipoValor: "numero",
    //   sleeptime: 1000,
    //   value: 1,
    // });

    // await setInputValue(driver, {
    //   locator: "frmDatosCotizacion:txtModelo",
    //   sleeptime: 1000,
    //   value: "2020",
    // });

    // await selectOptionInSelect(driver, {
    //   locator: "frmDatosCotizacion:cmbVersion",
    //   tipoValor: "numero",
    //   esperarHabilitado: true,
    //   value: 1,
    // });

    // await selectOptionInSelect(driver, {
    //   locator: "frmDatosCotizacion:cmbDescVehiculo",
    //   tipoValor: "numero",
    //   esperarHabilitado: true,
    //   value: 1,
    // });

    // Selecciona el tipo de persona
    // await clickInElementNotClickeable(driver, {
    //   locator: "frmDatosCotizacion:lnkFicoI",
    //   by: "id",
    // });

    // // await clickInElementNotClickeable(driver, {
    // //   locator: "frmDatosCotizacion:lnkFicoO",
    // //   by: "id",
    // // });

    // await setInputValue(driver, {
    //   locator: "frmDatosCotizacion:txtCodPostalContFico",
    //   value: "39600",
    // });

    // await clickInElementNotClickeable(driver, {
    //   locator: "frmDatosCotizacion:lnkAddCPSexoM",
    //   by: "id",
    // });

    // await setInputValue(driver, {
    //   locator: "frmDatosCotizacion:txtDiaCondPrin",
    //   sleeptime: 1000,
    //   value: "10",
    // });

    // await setInputValue(driver, {
    //   locator: "frmDatosCotizacion:txtMesCondPrin",
    //   value: "06",
    // });

    // await setInputValue(driver, {
    //   locator: "frmDatosCotizacion:txtAnioCondPrin",
    //   value: "1994",
    // });

    // await clickElement(driver, {
    //   locator: "frmDatosCotizacion:btnCotizar",
    //   sleeptime: 100,
    // });
    // const numCotizacion = await getElementText(driver, {
    //   locator: "frmRegresar:otxtNumCotizacion",
    //   by: "id",
    // });
    // console.log("Número de cotización:", numCotizacion);
  } catch (error) {
    console.error("Error general en la cotización:", error);
  } finally {
    // await sleep(200000);
    // if (driver) await driver.quit();
  }
}

module.exports = { ejecutarCotizacion };
