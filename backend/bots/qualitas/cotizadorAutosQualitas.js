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
  esperarElementosAlternativosCustom,
  acercarHaElemento,
  guardarEnArchivo,
  getElementValue,
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
const {
  deepPrint,
  formatearData,
  traducirError,
} = require("../../utils/helper");

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

  let dataResponse = await preparacionData(data);

  try {
    // prettier-ignore
    driver = await openPage("https://agentes360.qualitas.com.mx/", {
      headless: false,
    });

    await iniciarSesion(driver, data);

    await redireccionarMenuCotizaciones(driver, data);

    // prettier-ignore
    dataResponse = await generadorCotizacion(driver, data);
    // let tmp = await formatearData(dataResponse);

    dataResponse.estimar = false;
    return await formatearData(dataResponse);
  } catch (error) {
    error = traducirError(error, "Error general en la cotización: ");
    console.log(error);
    data.msgError = error;
    data.estimar = false;
    return await formatearData(data);
  } finally {
    // await sleep(200000);
    if (driver) await driver.quit();
  }
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
  console.log("Esperando a que se cargue el formulario de cotización...");
  // prettier-ignore
  console.log(data.vehiculo.marca + " " + data.vehiculo.modelo + " " + data.vehiculo.anio);
  // prettier-ignore
  await setInputValue(driver, {
    value: data.vehiculo.marca + " " + data.vehiculo.modelo + " " + data.vehiculo.anio,
    locator: "queryVehiculo",
    esperarHabilitado: true,
    sleeptime: 1000,
  });

  const vehiculos = await getAutocompleteOptions(driver, {
    sleeptime: 1000,
    locator: "ui-id-1",
  });

  if (vehiculos.length == 0) {
    data.msgError = "No se encontraron vehículos con los datos proporcionados.";
    return data;
  }

  // Se selecciona el primer vehiculo en la lista
  await selectInUL(driver, {
    locator: "ui-id-1",
  });

  // Se obtiene las versiones de vehiculo seleccionado
  let versiones = await getSelectOptions(driver, {
    locator: "selectVersion",
    sleeptime: 1000,
  });

  // Se obtiene el anio del vehiculo seleccionado
  data.vehiculo.anio = await getElementValue(driver, {
    selectReturnType: "label",
    locator: "selectYear",
  });

  // Se obtiene la marca del vehiculo seleccionado
  data.vehiculo.marca = await getElementValue(driver, {
    selectReturnType: "label",
    locator: "selectBrand",
  });

  // Se obtiene el modelo del vehiculo seleccionado
  data.vehiculo.modelo = await getElementValue(driver, {
    selectReturnType: "label",
    locator: "selectType",
  });

  // Se obtiene la version del vehiculo seleccionado
  data.vehiculo.version = versiones[0].label;

  // Se selecciona la version del vehiculo
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectVersion",
    tipoValor: "numero",
    sleeptime: 1000,
    value: 1,
    by: "id",
  });

  await acercarHaElemento(driver, { locator: "postalCode" });

  const cp = data.titular.codigoPostal || null; // Default postal code if not provided

  if (cp == null) {
    // prettier-ignore
    data.msgError = "No se encontró un código postal válido.";
    return data;
  }

  // ingresar el código postal
  for (const digito of cp) {
    await setInputValue(driver, {
      locator: "postalCode",
      changeFocus: false,
      sleeptime: 10,
      value: digito,
    });
  }

  // Obteniendo direcciones disponibles
  const direcciones = await getAutocompleteOptions(driver, {
    locator: "ui-id-2",
    sleeptime: 1000,
  });

  if (direcciones.length == 0) {
    // prettier-ignore
    data.msgError = "No se encontraron direcciones con los datos proporcionados.";
    return data;
  }

  // Seleccionanando la primera direccion disponible
  await selectInUL(driver, { locator: "ui-id-2" });

  data.titular.direccion = direcciones[0].value;
  data.titular.direcciones = direcciones;

  // Continuando a la cotización
  await acercarHaElemento(driver, {
    locator: '//*[@id="formDatosDeVehiculo"]/button',
    by: "xpath",
  });

  await clickElement(driver, {
    locator: '//*[@id="formDatosDeVehiculo"]/button',
    sleeptime: 1000,
    by: "xpath",
  });

  // Saltando de formulario
  await waitForElement(driver, { locator: "selectPolicyRight" });
  await sleep(1000);
  await scrollToBottom(driver);
  await clickElement(driver, {
    locator: '//*[@id="formDatosDeCotizacion"]/button',
    sleeptime: 1000,
    by: "xpath",
  });

  let existeModalError = await esperarElementosAlternativosCustom(driver, {
    errorSelector: "modalErrorWithQuoteInfo",
    successSelector: "coberturasAccesorias",
    timeout: 60000,
    pollInterval: 300,
  });

  if (!existeModalError) {
    data.msgError = "No se pudo generar la cotización.";
    return data;
  }

  await waitForElement(driver, { locator: "coberturasAccesorias" });
  await scrollToBottom(driver, { locator: "coberturasAccesorias", by: "id" });
  await scrollToBottom(driver);
  await sleep(1000);
  await clickElement(driver, {
    locator: "button.btn.btn-primary.next[type='submit']",
    by: "css",
  });

  return data;
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
    numeroCotizacion,
    archivo: archivo,
    ...data,
    detalles: detalles,
  };

  data = await await getDetallesCotizacion(driver, data);

  // deepPrint(data);

  return data;
}

async function preparacionData(data) {
  if (!data.detalles) {
    data.detalles = {};
  }

  if (data.msgError) {
    delete data.msgError;
  }

  if (data.cambios) {
    delete data.cambios;
  }

  if (!data.hasOwnProperty("inicial")) {
    data.inicial = true;
  }

  if (!data.hasOwnProperty("vehiculo")) {
    data.vehiculo = {
      marca: data.titular.marca,
      modelo: data.titular.modelo,
      anio: data.titular.anio,
      version: data.titular.version,
    };

    delete data.titular.anio;
    delete data.titular.marca;
    delete data.titular.modelo;
    delete data.titular.version;
  }

  if (data.hasOwnProperty("companias_productos")) {
    if (data.companias_productos.length == 1) {
      let producto = data.companias_productos[0];
      data.companiaProducto_id = producto.id; // Asignar el primer ID de compania_producto
      data.companiaProducto = producto.nombre; // Asignar el primer ID de compania_producto
      delete data.companias_productos; // Eliminar la propiedad 'companias_productos' si existe
    }
  }
  return data;
}
module.exports = { ejecutarCotizacionAutos };
