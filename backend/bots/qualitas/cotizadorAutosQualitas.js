const { until, By } = require("selenium-webdriver");

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
  selectOptionInSelect,
  clickInElementNotClickeable,
  getSelectOptions,
  getAutocompleteOptions,
  forzarCierre,
  enableFirstDisabledOption,
  selectInUL,
  scrollToTop,
  obtenerCantidadFilasTablaCotizaciones,
  acercarHaElemento,
  guardarEnArchivo,
} = require("../helpers/seleniumHelper");

const {
  esperarElementoVisible,
  handleDescargarPDF,
  esperarFilasTablaCotizaciones,
  descargarArchivoHipervinculo,
  obtenerFrecuenciasPago,
  buscarFilaCotizacionPorTexto,
  redireccionarCotizacionGuardada,
  obtenerNombresCoberturasAccesorias,
  obtenerCoberturasBasicas,
  esperarQueNoExistaModalError,
} = require("./qualitasHelper");

const { filePathToPublicUrl } = require("../../utils/filesHelper");
const { deepPrint } = require("../../utils/helper");

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

  console.log("Direcciones encontradas:", direcciones);

  await selectInUL(driver, {
    locator: "ui-id-2",
  });
  await sleep(1000);

  await scrollToBottom(driver);

  await sleep(1000);
  await clickElement(driver, {
    locator: '//*[@id="formDatosDeVehiculo"]/button',
    sleeptime: 1000,
    by: "xpath",
  });

  await waitForElement(driver, {
    locator: '//*[@id="formDatosDeCotizacion"]/button',
    by: "xpath",
  });

  await sleep(1000);
  await scrollToBottom(driver);
  await sleep(1000);

  await clickElement(driver, {
    locator: '//*[@id="formDatosDeCotizacion"]/button',
    sleeptime: 1000,
    by: "xpath",
  });

  await sleep(1000);
  await scrollToBottom(driver, { locator: "coberturasAccesorias", by: "id" });
  await sleep(1000);
  await scrollToBottom(driver);
  await sleep(1000);

  console.log("Esperando ...");
  await scrollToBottom(driver);
  console.log("Esperando a que se cargue el botón de siguiente...");
  await clickElement(driver, {
    locator: "button.btn.btn-primary.next[type='submit']",
    by: "css",
  });
  console.log("Esperando a que se genere la cotización...");
  await sleep(1000);

  await waitForElement(driver, {
    locator: "resumenNumCotizacion",
  });

  await sleep(1000);
  let detalles = {};

  let numeroCotizacion = await getElementText(driver, {
    locator: "resumenNumCotizacion",
    by: "id",
  });

  await sleep(1000);
  numeroCotizacion = numeroCotizacion.trim();
  console.log("Número de cotización:", numeroCotizacion);

  await sleep(1000);
  await scrollToBottom(driver);
  await sleep(1000);
  await scrollToBottom(driver);

  let tmp = await obtenerValoresPorId(driver, campos);

  detalles = {
    ...detalles,
    ...tmp,
  };

  detalles.direcciones = direcciones;
  detalles.versiones = versiones;

  let btnDownload = await getElement(driver, { locator: "descargarPDF" });
  let href = await btnDownload.getAttribute("href");

  // prettier-ignore
  let responseFile = await descargarArchivoHipervinculo( driver,href,"cotizacion_" + numeroCotizacion);
  let archivo = null;

  if (responseFile.status) {
    let pathFinal = await filePathToPublicUrl(responseFile.path);
    archivo = pathFinal;
  }

  await clickElement(driver, {
    locator:
      '//span[contains(@class, "edit") and @data-target="#collapseCoberturas" and normalize-space(text())="Editar"]',
    by: "xpath",
  });

  data = {
    ...data,
    numeroCotizacion,
    detalles: detalles,
    archivo: archivo,
  };

  data = await await getDetallesCotizacion(driver, data);

  // deepPrint(data);

  return data;
}

async function buscarCotizacion(driver, data) {
  delete data.msgError;

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
  let row = await buscarFilaCotizacionPorTexto(driver, data.numeroCotizacion);

  await redireccionarCotizacionGuardada(driver, row);
  await sleep(1000); // opcional, pero no necesario si usas esperarElementoVisible

  await esperarElementoVisible(driver, "#coberturasAccesorias", 30000);
  if (data.cambios.version || data.cambios.direccion) {
    if (data.cambios.version) {
      console.log("Esperando a editar");
      await waitForElement(driver, {
        locator: "paymentTypeArrangement",
        timeout: 10000,
      });
      await sleep(3000);
      console.log("Hay cambios de direccion y/o version");
      await clickElement(driver, {
        locator:
          "//span[@class='edit collapsed' and @data-target='#collapseDatosDeVehiculo' and text()='Editar']",
        timeout: 1000,
        by: "xpath",
      });

      await waitForElement(driver, {
        locator: "selectVersion",
        timeout: 10000,
        by: "id",
      });

      // Aquí puedes comparar manualmente el texto que buscas
      console.log("Buscando opción:", data.cambios.version.label);

      // Luego selecciona
      await selectOptionInSelect(driver, {
        esperarHabilitado: true,
        locator: "selectVersion",
        tipoValor: "label",
        sleeptime: 1000,
        value: data.cambios.version.label,
        by: "id",
      });
    }

    if (data.cambios.direccion) {
      await sleep(1000);
      let inputCP = await getElement(driver, {
        locator: "postalCode",
      });
      await inputCP.clear();

      const cp = data.titular?.codigoPostal ?? "39600"; // Default postal code if not provided
      await sleep(1000);
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

      // prettier-ignore
      let direccionEncontrada = direcciones.findIndex((direccion) => direccion.value === data.cambios.direccion.label );
      await selectInUL(driver, {
        locator: "ui-id-2",
        value: direccionEncontrada,
      });
    }

    await scrollToBottom(driver);

    await sleep(1000);
    await clickElement(driver, {
      locator: '//*[@id="formDatosDeVehiculo"]/button',
      sleeptime: 1000,
      by: "xpath",
    });

    await waitForElement(driver, {
      locator: '//*[@id="formDatosDeCotizacion"]/button',
      by: "xpath",
    });

    await sleep(1000);
    await scrollToBottom(driver);
    await sleep(1000);

    await clickElement(driver, {
      locator: '//*[@id="formDatosDeCotizacion"]/button',
      sleeptime: 1000,
      by: "xpath",
    });
  }

  if (data.cambios.frecuenciaPago) {
    let frecuenciaPago = data.cambios.frecuenciaPago.tipo;
    frecuenciaPago = "Contado"; // Forzar a mensual por ahora

    // prettier-ignore
    await waitForElement(driver, {
      locator: "//p[contains(@class, 'text-muted') and contains(@class, 'c5') and contains(@class, 'mt-1') and normalize-space(text())='" + frecuenciaPago + "']",
      by: "xpath",
    });

    // prettier-ignore
    await acercarHaElemento(driver, {
      locator: "//p[contains(@class, 'text-muted') and contains(@class, 'c5') and contains(@class, 'mt-1') and normalize-space(text())='" + frecuenciaPago + "']",
      by: "xpath",
    });
    // prettier-ignore
    await clickElement(driver, {
      locator: "//p[contains(@class, 'text-muted') and contains(@class, 'c5') and contains(@class, 'mt-1') and normalize-space(text())='" + frecuenciaPago + "']",
      sleeptime: 1000,
      by: "xpath",
    });
  }

  if (data.cambios.accesorios && data.cambios.accesorios.length > 0) {
    await scrollToBottom(driver);
    await sleep(1000);
    await scrollToBottom(driver);
    await sleep(1000);
    const labels = await getElement(driver, {
      locator: "#coberturasAccesoriasItems label",
      multiple: true,
      by: "css",
    });

    for (const label of labels) {
      const idLabel = await label.getAttribute("for");
      let accesorio = data.cambios.accesorios.find(
        (accesorio) => accesorio.label_id === idLabel
      );
      if (accesorio) {
        await driver.executeScript("arguments[0].scrollIntoView(true);", label);
        await driver.sleep(500);
        await driver.executeScript("arguments[0].click();", label);
        await driver.sleep(300);
        for (const hijo of accesorio.hijos) {
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
                locator: hijo.name,
                sleeptime: 1000,
                by: "name",
              });
              break;
          }
        }
      }
    }
  }

  if (data.cambios && data.cambios.coberturas) {
    for (const cobertura of data.cambios.coberturas) {
      await changeInputsCobertura(driver, cobertura.sumaSegura);
      await changeInputsCobertura(driver, cobertura.deducible);
      await changeInputsCobertura(driver, cobertura.prima);
    }
  }

  await scrollToBottom(driver);
  await clickElement(driver, {
    locator: "button.btn.btn-primary.saveChanges[type='submit']",
    by: "css",
  });

  const mensajeError = await esperarQueNoExistaModalError(driver, 15000, 1000);
  if (mensajeError) {
    let tmp = { ...data, msgError: mensajeError };
    return tmp;
  }
  console.log("Esperando detalles de la cotización...");
  data = await await getDetallesCotizacion(driver, data, false);
  await guardarEnArchivo(data, "mi_cotizacion.json");
  await sleep(1000000);

  // prettier-ignore
  let tmp = await handleDescargarPDF(driver, data.numeroCotizacion);

  if (tmp.status) {
    let pathFinal = await filePathToPublicUrl(tmp.path);
    data.detalles.archivo = pathFinal;
  }

  return data;
}
async function changeInputsCobertura(driver, cobertura) {
  let coberturas = Array.isArray(cobertura) ? cobertura : [cobertura];
  for (const cobertura of coberturas) {
    if (!cobertura.tag) continue;
    switch (cobertura.tag) {
      case "input":
        if (cobertura.tipo && cobertura.disabled == false) {
          await acercarHaElemento(driver, {
            locator: cobertura.id,
            by: "id",
          });

          await setInputValue(driver, {
            locator: cobertura.id,
            clearInput: true,
            value: cobertura.valor,
            sleeptime: 1000,
            by: "id",
          });
        }
        break;
      case "select":
        await acercarHaElemento(driver, {
          locator: cobertura.name,
          by: "name",
        });

        await selectOptionInSelect(driver, {
          esperarHabilitado: true,
          value: cobertura.valor.texto,
          tipoValor: "label",
          locator: cobertura.name,
          sleeptime: 1000,
          by: "name",
        });
        break;
    }
  }
}

async function getDetallesCotizacion(driver, data, darClick = true) {
  if (!data.detalles) {
    data.detalles = {};
  }

  await sleep(1000);

  console.log("Obteniendo frecuencia de pago...");
  let frecuenciasPago = await obtenerFrecuenciasPago(driver);
  data.detalles.frecuenciasPago = frecuenciasPago;
  // deepPrint(frecuenciasPago);

  console.log("Obteniendo coberturas de accesorios ...");
  let accesorios = await obtenerNombresCoberturasAccesorias(driver, darClick);
  data.detalles.accesorios = accesorios;
  // deepPrint(accesorios);

  console.log("Obteniendo coberturas básicas ...");
  let coberturasBasicas = await obtenerCoberturasBasicas(driver);
  data.detalles.coberturasBasicas = coberturasBasicas;
  deepPrint(coberturasBasicas);

  return data;
}

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
    console.error("Error general en la cotización:", error.message);
  } finally {
    // await sleep(200000);
    if (driver) await driver.quit();
  }
}
module.exports = { ejecutarCotizacionAutos };
