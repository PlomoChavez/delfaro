const {
  openPage,
  waitForElement,
  sleep,
  scrollToBottom,
  setInputValue,
  clickElement,
  selectMatOption,
  switchToWindow,
  getElement,
  getElementText,
  clickInElementNotClickeable,
  selectOptionInSelect,
  getSelectOptions,
  getAutocompleteOptions,
  forzarCierre,
  enableFirstDisabledOption,
  selectInUL,
  obtenerCantidadFilasTablaCotizaciones,
} = require("../helpers/seleniumHelper");

const {
  descargarArchivoLinkPorTexto,
  esperarFilasTablaCotizaciones,
} = require("./qualitasHelper");

const { filePathToPublicUrl } = require("../../utils/filesHelper");

// prettier-ignore
async function obtenerValoresPorId(driver, campos) {
  const resultado = {};
  for (const campo of campos) {
    const valor = await getElementText(driver, { locator: campo.name, by: "id" });
    const key = campo.key.charAt(0).toLowerCase() + campo.key.slice(1);
    resultado[key] = valor;
  }
  return resultado;
}

async function iniciarSesion(driver, data) {
  await waitForElement(driver, {
    locator: "_com_liferay_login_web_portlet_LoginPortlet_login",
    by: "id",
  });

  await setInputValue(driver, {
    locator: "_com_liferay_login_web_portlet_LoginPortlet_login",
    value: "25050",
  });

  await setInputValue(driver, {
    locator: "_com_liferay_login_web_portlet_LoginPortlet_account",
    value: "MAESTRA",
  });

  await setInputValue(driver, {
    locator: "_com_liferay_login_web_portlet_LoginPortlet_password",
    value: "025050",
  });

  await clickElement(driver, {
    locator: "//button[span[contains(text(),'Acceder')]]",
    sleeptime: 300,
    by: "xpath",
  });
}

async function redireccionarMenuCotizaciones(driver, data) {
  await waitForElement(driver, {
    locator: "//div[@id='bg']",
    by: "xpath",
  });
  await clickElement(driver, {
    locator: "//div[@id='bg']",
    by: "xpath",
  });
  await clickElement(driver, {
    locator: "//a[span[normalize-space(text())='Cotizaciones']]",
    by: "xpath",
  });
}

async function generadorCotizacion(driver, data) {
  await clickElement(driver, {
    locator: '//*[@id="menu"]/div[3]/div[1]/a[1]',
    by: "xpath",
  });
  // prettier-ignore
  await clickElement(driver, {
      locator: "//div[contains(@class, 'col-4') and .//p[normalize-space(text())='Residentes']]",
      by: "xpath",
    });

  // prettier-ignore
  await clickElement(driver, {
      locator: "//div[contains(@class, 'col-4') and .//p[normalize-space(text())='Autos']]",
      by: "xpath",
    });

  await scrollToBottom(driver);

  await clickElement(driver, {
    locator: "buttonOrigenYUso",
    sleeptime: 1000,
  });

  await waitForElement(driver, {
    locator: "selectYear",
  });

  await enableFirstDisabledOption(driver, "selectYear");

  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectYear",
    sleeptime: 1000,
    value: "2020",
    by: "id",
  });

  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectBrand",
    tipoValor: "label",
    sleeptime: 1000,
    value: "HONDA",
    by: "id",
  });

  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectType",
    tipoValor: "label",
    sleeptime: 1000,
    value: "CR-V",
    by: "id",
  });

  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectVersion",
    tipoValor: "numero",
    sleeptime: 1000,
    value: 1,
    by: "id",
  });

  let versiones = await getSelectOptions(driver, {
    locator: "selectVersion",
  });
  console.log("Opciones de versiones:", versiones);

  await sleep(1000);

  const cp = "39600";
  for (const digito of cp) {
    await setInputValue(driver, {
      locator: "postalCode",
      changeFocus: false,
      sleeptime: 10,
      value: digito,
    });
  }

  await sleep(1000);
  const direcciones = await getAutocompleteOptions(driver, {
    locator: "ui-id-2",
  });
  console.log("direcciones de autocompletado:", direcciones);

  await selectInUL(driver, {
    locator: "ui-id-2",
  });

  await clickElement(driver, {
    locator: '//*[@id="formDatosDeVehiculo"]/button',
    sleeptime: 100,
    by: "xpath",
  });

  await waitForElement(driver, {
    locator: '//*[@id="formDatosDeCotizacion"]/button',
    by: "xpath",
  });

  await sleep(1000);
  await scrollToBottom(driver);

  await clickElement(driver, {
    locator: '//*[@id="formDatosDeCotizacion"]/button',
    sleeptime: 100,
    by: "xpath",
  });

  await sleep(1000);
  await scrollToBottom(driver, { locator: "coberturasAccesorias", by: "id" });
  await sleep(1000);
  await scrollToBottom(driver);

  await clickElement(driver, {
    locator:
      "//button[contains(@class, 'btn-primary') and contains(@class, 'next') and normalize-space(text())='Siguiente']",
    by: "xpath",
  });

  await sleep(1000);
  await waitForElement(driver, {
    locator: "resumenNumCotizacion",
  });

  let detalles = {};

  detalles.numeroCotizacion = await getElementText(driver, {
    locator: "resumenNumCotizacion",
    by: "id",
  });

  console.log("Valor del campo:", detalles);

  await sleep(1000);
  await scrollToBottom(driver);

  let tmp = await obtenerValoresPorId(driver, campos);
  detalles = {
    ...detalles,
    ...tmp,
  };
  detalles.direcciones = direcciones;
  detalles.versiones = versiones;
  //
  console.log("Detalles de la cotización:", detalles);
}

async function buscarCotizacion(driver, data) {
  await clickElement(driver, {
    locator: '//*[@id="menu"]/div[3]/div[1]/a[2]',
    by: "xpath",
  });

  await waitForElement(driver, {
    locator: "numcotizacion",
  });

  await setInputValue(driver, {
    value: data.numeroCotizacion,
    locator: "numcotizacion",
    sleeptime: 1000,
  });

  await clickElement(driver, {
    locator: "buscar",
    sleeptime: 1000,
  });

  await esperarFilasTablaCotizaciones(driver);

  await sleep(1000);

  let tmp = await descargarArchivoLinkPorTexto(driver, data.numeroCotizacion);

  if (tmp.status) {
    let pathFinal = await filePathToPublicUrl(tmp.path);
    data.detalles.archivo = pathFinal;
  }
  console.log("Respuesta de descarga:", tmp);

  return data;
}

// prettier-ignore
const campos = [
  { name: "resumenNumCotizacion",   key: "numeroCotizacion" },
  { name: "resumenPrimerPago",      key: "PrimerPago" },
  { name: "resumenPagoSubsecuente", key: "PagoSubsecuente" },
  { name: "resumenPrimaNeta",       key: "PrimaNeta" },
  { name: "resumenTasaFin",         key: "TasaFin" },
  { name: "resumenExpedicionPoliza",key: "ExpedicionPoliza" },
  { name: "resumenIVA",             key: "IVA" },
  { name: "resumenSubtotal",        key: "Subtotal" },
];

async function ejecutarCotizacionAutos(data) {
  let driver;
  let dataResponse = {};
  try {
    // prettier-ignore
    driver = await openPage("https://agentes360.qualitas.com.mx/", {
      headless: false,
    });
    await iniciarSesion(driver, data);

    await redireccionarMenuCotizaciones(driver, data);

    if (data.numeroCotizacion) {
      // prettier-ignore
      dataResponse = await buscarCotizacion(driver, data);
    } else {
      // prettier-ignore
      dataResponse = await generadorCotizacion(driver, data);
    }

    return dataResponse;
  } catch (error) {
    console.error("Error general en la cotización:", error);
  } finally {
    // await sleep(200000);
    if (driver) await driver.quit();
  }
}
module.exports = { ejecutarCotizacionAutos };
