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

const {
  esperarDescargaArchivo,
  moverYRenombrarArchivo,
  obtenerPathArchivo,
  getPath,
  createNewPath,
  currentPath,
  filePathToPublicUrl,
} = require("../utils/filesHelper");

async function extraerNumeroCotizacion(mensaje) {
  const match = mensaje.match(/Número\s+(\d{10,})/);
  return match ? match[1] : null;
}

async function buscarCotizacion(driver, data) {
  // seleccionar la seccion de administrar cotizaciones
  await clickElement(driver, {
    locator: "divAdministrar",
    sleeptime: 100,
  });

  // esperar a que se cargue la seccion
  await waitForElement(driver, {
    locator: "divPolizas",
    timeout: 20000,
  });

  // seleccionar la opcion de buscar cotizacion
  await clickElement(driver, {
    locator:
      '//a[contains(@id, "select2") and contains(.,"Póliza y Certificado")]',
    by: "xpath",
    sleeptime: 300,
  });

  await clickElement(driver, {
    locator:
      '//li[contains(@class,"select2-result") and normalize-space(text())="Por Cotización"]',
    by: "xpath",
    sleeptime: 300,
  });

  // esperar a que se muestre el input de cotizacion
  await waitForElement(driver, {
    locator: "inpCotizacion",
    timeout: 10000,
  });

  // ingresar el numero de cotizacion
  await setInputValue(driver, {
    locator: "inpCotizacion",
    value: data.numeroCotizacion,
    sleeptime: 1000,
  });

  // dar clic boton de buscar
  await clickElement(driver, {
    locator: "btnBuscar",
    sleeptime: 100,
  });

  // esperar a que se cargue la tabla de cotizaciones
  await sleep(1000);

  await waitForTablaCotizacionesConFilas(driver);

  // buscar la cotizacion para darle clic
  await clickDetalleCotizacion(driver, data.numeroCotizacion);

  await waitForDivWithContent(driver, "divCargando", 15000);

  data.detalles.archivo = await handleDescargarArchivos(driver, data);

  return {
    numeroCotizacion: data.numeroCotizacion,
    esModificado: data.esModificado,
    detalles: {
      ...data.detalles,
    },
  };
}

async function handleDescargarArchivos(driver, data) {
  await scrollToBottom(driver);

  await clickElement(driver, {
    locator: "btnImprimirCotizacion",
    sleeptime: 1000,
    timeout: 20000,
  });

  await clickElement(driver, {
    locator: "btnGuardarImprimirCotizacion",
    sleeptime: 1000,
    timeout: 20000,
  });

  await clickElement(driver, {
    locator: "RptDownload",
    sleeptime: 1000,
    timeout: 20000,
  });

  const downloadDir = await getPath("Downloads");
  const patron = /^VisorPDF.*\.pdf$/; // Cambia el patrón según tu archivo
  const archivoDescargado = await esperarDescargaArchivo(
    downloadDir,
    patron,
    30000
  );

  const nuevoNombre = "cotizacion_" + data.numeroCotizacion + ".pdf";
  let nuevoPath = await currentPath();
  console.log("Nuevo path:", nuevoPath);
  nuevoPath = await createNewPath([
    nuevoPath,
    "../",
    "files",
    "cotizaciones",
    nuevoNombre,
  ]);
  console.log("Nuevo path:", nuevoPath);
  await moverYRenombrarArchivo(archivoDescargado, nuevoPath);

  console.log("Archivo final:", nuevoPath);

  let pathFinal = await filePathToPublicUrl(nuevoPath);

  await sleep(5000);

  return pathFinal;
}

async function generarCotizacion(driver, data) {
  await clickElement(driver, {
    locator: "divCotizar",
    sleeptime: 100,
  });

  await waitForDivWithContent(driver, "divCargando", 15000);

  await sleep(10000);

  await setInputValue(driver, {
    sleeptime: 1000,
    locator: "txtCodigoPostal",
    value: "39600",
  });

  await waitForDivWithContent(driver, "divCargando", 15000);

  // prettier-ignore
  await clickElement(driver, {
    locator:"btnTipoVehiculoGlm",
    sleeptime: 100
  });

  await waitForDivWithContent(driver, "divCargando", 15000);
  // prettier-ignore
  await clickElement(driver, {
    locator:'//a[@class="EstiloPopover" and normalize-space(text())="VEHICULOS RESIDENTES"]',
    by: "xpath",
  });

  await waitForDivWithContent(driver, "divCargando", 15000);
  // prettier-ignore
  await clickElement(driver, {
    locator: `//a[@class="EstiloPopover" and normalize-space(text())="${data.titular.marca}"]`,
    by: "xpath",
  });

  await waitForDivWithContent(driver, "divCargando", 15000);
  // prettier-ignore
  await clickElement(driver, {
    locator: `//a[@class="EstiloPopover" and normalize-space(text())="${data.titular.anio}"]`,
    by: "xpath",
  });

  await waitForDivWithContent(driver, "divCargando", 15000);
  // prettier-ignore
  await clickElement(driver, {
    locator: `//a[@class="EstiloPopover" and normalize-space(text())="${data.titular.modelo}"]`,
    by: "xpath",
  });

  await waitForDivWithContent(driver, "divCargando", 15000);
  // prettier-ignore
  await clickElement(driver, {
    locator: `//a[@class="EstiloPopover" and normalize-space(text())="${data.titular.version}"]`,
    by: "xpath",
  });

  await waitForDivWithContent(driver, "divCargando", 15000);

  await scrollToBottom(driver);

  await waitForElement(driver, {
    locator: "btnTarificar",
    timeout: 20000,
  });

  await clickElement(driver, {
    locator: "btnTarificar",
    sleeptime: 1000,
    timeout: 20000,
  });

  await waitForDivWithContent(driver, "divCargando", 15000);

  await waitForElement(driver, {
    locator: '//div[@id="tblTotales"]//div[@style="color:#000000;"]',
    by: "xpath",
    timeout: 20000,
  });

  const valores = await getValoresTotalesTable(driver);

  await clickElement(driver, {
    locator: "btnMostrarModalGuardarCotizacion",
    sleeptime: 1000,
  });

  await clickElement(driver, {
    locator: "btnGuardarCotizacion",
    sleeptime: 1000,
  });

  await waitForDivWithContent(driver, "divCargando", 15000);

  await waitForElement(driver, {
    locator: "DivMensaje",
    timeout: 20000,
  });

  await sleep(1000);
  let mensaje = await getElementText(driver, {
    locator: "DivMensaje",
  });

  const numeroCotizacion = await extraerNumeroCotizacion(mensaje);

  data.numeroCotizacion = numeroCotizacion;
  data.esModificado = false;
  data.detalles = valores;

  await clickElement(driver, {
    locator: '//button[contains(@class,"close") and @data-dismiss="modal"]',
    sleeptime: 300,
    by: "xpath",
  });

  data.detalles.archivo = await handleDescargarArchivos(driver, data);

  return {
    numeroCotizacion: data.numeroCotizacion,
    esModificado: data.esModificado,
    detalles: data.detalles,
  };
}

async function ejecutarCotizacionAutos(data) {
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

    if (data.numeroCotizacion) {
      dataResponse = await buscarCotizacion(driver, data);
    } else {
      dataResponse = await generarCotizacion(driver, data);
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
