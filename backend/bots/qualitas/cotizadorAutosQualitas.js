const { until, By } = require("selenium-webdriver");
const { filePathToPublicUrl } = require("../../utils/filesHelper");
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
async function validarModalAbierto(driver, options = {}) {
  const {
    timeout = 10000, // Aumentar timeout
    autoClose = true, // Cambiar a true por defecto
    closeAction = "Aceptar",
    maxIntentos = 10,
    showLogs = false,
  } = options;

  await sleep(2000); // Aumentar sleep para dar tiempo al modal

  // Modales en el orden específico solicitado - SELECTORES SIMPLIFICADOS
  const modalesConfig = [
    {
      id: "modalSuccessGe",
      continue: true,
      tipo: "result",
      titleSelector: "#titleSuccess",
      messageSelector: "#msjSuccess",
      buttonText: "Aceptar",
    },
    {
      id: "modalError01",
      continue: false,
      tipo: "error",
      titleSelector: "#titleMGErr",
      messageSelector: "#msjMGErr",
      buttonText: "Salir",
    },
    {
      id: "modalWarning",
      continue: "warning",
      tipo: "warning",
      titleSelector: "#titleWarning",
      messageSelector: "#msjWarning",
      buttonText: "Aceptar",
    },
    {
      id: "modalWarningWithOptions",
      continue: "warning_with_options",
      tipo: "warning_with_options",
      titleSelector: "#titleWarning",
      messageSelector: "#msjWarning",
      buttonText: closeAction,
    },
  ];

  try {
    let modalEncontrado = null;
    let intentos = 0;

    // BUCLE DE ESPERA - Intentar hasta que aparezca un modal
    while (!modalEncontrado && intentos < maxIntentos) {
      if(showLogs){
        console.log(`🔎 Intento ${intentos + 1}/${maxIntentos} - Buscando modales...`);
      }

      // Buscar cada tipo de modal EN EL ORDEN ESPECÍFICO
      for (const modalConfig of modalesConfig) {
        try {
          if(showLogs){
            console.log(`   📋 Verificando: ${modalConfig.id}`);
          }

          // USAR SELECTOR DIRECTO POR ID PRIMERO
          const modal = await driver.findElement(By.id(modalConfig.id));
          const isVisible = await modal.isDisplayed();

          if (isVisible) {
          if(showLogs){
            console.log(`✅ ¡Modal encontrado!: ${modalConfig.tipo} (${modalConfig.id})`);
          }

            let mensaje = "";
            try {
              mensaje = await getElementText(driver, {
                locator: modalConfig.messageSelector,
                by: "css",
              });
              if(showLogs){
                  console.log(`💬 Mensaje: "${mensaje}"`);
              }
            } catch (messageError) {
              console.log("⚠️ No se pudo obtener el mensaje del modal");
            }

            modalEncontrado = {
              id: modalConfig.id,
              tipo: modalConfig.tipo,
              mensaje: mensaje,
              buttonText: modalConfig.buttonText,
              continue: modalConfig.continue,
            };

            // CERRAR EL MODAL si se encuentra
            if (autoClose) {
              if(showLogs){
                console.log(`🔄 Cerrando modal con botón: "${modalConfig.buttonText}"`);
              }
              

              try {
                const resultadoCierre = await closeModal(driver, {
                  locator: modalConfig.id,
                  by: "id",
                  btnLabel: modalConfig.buttonText,
                  message: modalConfig.messageSelector.replace("#", ""), // Quitar el # del selector
                  autoClose: true,
                  sleepAfter: 1000,
                });

                if(showLogs){
                  console.log(`✅ Modal cerrado exitosamente`);
                }
                modalEncontrado.cerrado = resultadoCierre.result;
              } catch (closeError) {
                if(showLogs){
                  console.log("❌ Error cerrando modal:", closeError.message);
                }
                modalEncontrado.error = closeError.message;
                modalEncontrado.cerrado = false;
              }
            }

            // SALIR DEL BUCLE al encontrar el primer modal
            break;
          }
        } catch (modalError) {
          // El modal no existe o no es visible, continuar con el siguiente
          continue;
        }
      }

      // Si no se encontró modal en esta iteración, esperar y reintentar
      if (!modalEncontrado) {
        if(showLogs){
          console.log(`   ❌ No se encontraron modales visibles - esperando 2s...`);
        }
        await sleep(2000);
        intentos++;
      }
    }

    // Si después de todos los intentos no se encontró modal
    if (!modalEncontrado) {

      if(showLogs){
        console.log("⚠️ ADVERTENCIA: Se esperaba un modal pero no se encontró ninguno después de todos los intentos");
      }

      // Debug: Verificar qué modales existen en el DOM
      if(showLogs){
        console.log("🔍 Verificando modales en el DOM...");
      } 
      for (const modalConfig of modalesConfig) {
        try {
          const modal = await driver.findElement(By.id(modalConfig.id));
          const isDisplayed = await modal.isDisplayed();
          const style = await modal.getAttribute("style");
          const className = await modal.getAttribute("class");
          if(showLogs){
            console.log(`   📋 ${modalConfig.id}: existe=${true}, visible=${isDisplayed}, style="${style}", class="${className}"`);
          }
        } catch (e) {
          if(showLogs){
            console.log(`   📋 ${modalConfig.id}: existe=${false}`);
          }
        }
      }

      return {
        modalAbierto: false,
        tipo: null,
        mensaje: "No se detectó ningún modal después de la acción",
        continue: false, // Si se esperaba un modal y no apareció, algo salió mal
        error: "Modal esperado no encontrado",
      };
    }

    // Retornar información del modal encontrado
    return {
      modalAbierto: true,
      tipo: modalEncontrado.tipo,
      mensaje: modalEncontrado.mensaje,
      continue: modalEncontrado.continue,
      cerrado: modalEncontrado.cerrado || false,
    };
  } catch (error) {
    console.log("❌ Error validando modales:", error.message);
    return {
      modalAbierto: false,
      tipo: null,
      mensaje: error.message,
      error: error.message,
      continue: false,
    };
  }
}

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

async function getDetallesCotizacion(driver, data, darClick = true) {
  if (!data.detalles) {
    data.detalles = {};
  }

  await sleep(1000);
  if (data.detalles.frecuenciaPago) {
    const frecuenciaTexto = data.detalles.frecuenciaPago; // Ejemplo: "Trimestral

    // Acerca el elemento y haz clic
    await acercarHaElemento(driver, {
      locator: `//p[contains(@class, 'text-muted') and contains(@class, 'c5') and contains(@class, 'mt-1') and normalize-space(text())='${frecuenciaTexto}']`,
      by: "xpath",
    });

    await clickElement(driver, {
      locator: `//p[contains(@class, 'text-muted') and contains(@class, 'c5') and contains(@class, 'mt-1') and normalize-space(text())='${frecuenciaTexto}']`,
      sleeptime: 1000,
      by: "xpath",
    });
  } else {
    data.detalles.frecuenciaPago = "Contado";
  }

  let frecuenciasPago = await obtenerFrecuenciasPago(driver);
  data.detalles.frecuenciasPago = frecuenciasPago;

  let coberturasBasicas = await obtenerCoberturasBasicas(
    driver,
    data.detalles.coberturasBasicas
  );

  data.detalles.coberturasBasicas = coberturasBasicas;

  await scrollToBottom(driver);

  let accesorios = [];

  // prettier-ignore
  let obtenerDetallesAccesorios = data.titular.obtenerDetallesAccesorios || false;

  if (obtenerDetallesAccesorios) {
    // prettier-ignore
    accesorios = await obtenerNombresCoberturasAccesorias(driver, { 
      darClick: darClick,
      accesorios: data.detalles.accesorios || []
    });

    let accesoriosSeleccionados = accesorios.filter(
      (item) => item.selected === true
    );

    if (accesoriosSeleccionados.length > 0) {
      let mensajeError = await guardandoCambios(driver, data);

      if (mensajeError) {
        let tmp = { ...data, msgError: mensajeError };
        return tmp;
      }
      // prettier-ignore
      let actualizacionesAccesorios = await actualizarAccesorios(driver, accesoriosSeleccionados);
      // prettier-ignore
      for (const actualizacion of actualizacionesAccesorios) {
        const accesorio = accesorios.find(item => item.label_id === actualizacion.label_id);
        if (accesorio) {
          accesorio.prima = actualizacion.prima;
        }
      }
    }
  } else {
    console.log("No se solicitaron detalles de accesorios.");
  }

  data.detalles.accesorios = accesorios;
  // deepPrint(accesorios);

  return data;
}

async function guardandoCambios(driver, data) {
  await sleep(1000);
  await scrollToBottom(driver);

  await sleep(1000);
  await scrollToBottom(driver);
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

async function actualizarAccesorios(driver, accesoriosSolicitados) {
  // accesoriosSolicitados: [{ label_id: 'accesory8', ... }]
  const labels = await driver.findElements(
    By.css("#coberturasAccesoriasItems label")
  );
  if (labels.length === 0) return [];

  // Creamos un mapa para acceso rápido por label_id
  const accesoriosMap = {};
  for (const acc of accesoriosSolicitados) {
    accesoriosMap[acc.label_id] = acc;
  }

  for (const label of labels) {
    try {
      const label_id = await label.getAttribute("for");
      if (!label_id || !(label_id in accesoriosMap)) continue;

      // Solo actualizamos si está en el array solicitado
      const rowMb4 = await label.findElement(By.css("div.shadow .row.mb-4"));
      const ps = await rowMb4.findElements(By.css("p.c2"));
      let prima = null;
      if (ps.length > 1) {
        prima = await ps[1].getText();
        prima = prima && typeof prima === "string" ? prima.trim() : "";
      }
      accesoriosMap[label_id].prima = prima;
    } catch (e) {
      // Si no se puede obtener la prima, la deja igual
    }
  }
  return accesoriosSolicitados;
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

  // prettier-ignore
  let autoQuery = ((data.vehiculo?.marca ?? '') + ' ' + (data.vehiculo?.modelo ?? '') + ' ' + (data.vehiculo?.anio ?? '') + ' ' + (data.vehiculo?.version ?? '')).toUpperCase();
  // prettier-ignore
  await setInputValue(driver, {
    locator: "queryVehiculo",
    esperarHabilitado: true,
    value: autoQuery,
    sleeptime: 1000,
  });

  await sleep(1000);

  const vehiculos = await getAutocompleteOptions(driver, {
    sleeptime: 1000,
    locator: "ui-id-1",
  });

  await sleep(1000);

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

  if (data.vehiculo.anio == undefined) {
    // Se obtiene el anio del vehiculo seleccionado
    data.vehiculo.anio = await getElementValue(driver, {
      selectReturnType: "label",
      locator: "selectYear",
    });
  }

  if (data.vehiculo.marca == undefined) {
    // Se obtiene la marca del vehiculo seleccionado
    data.vehiculo.marca = await getElementValue(driver, {
      selectReturnType: "label",
      locator: "selectBrand",
    });
  }

  if (data.vehiculo.modelo == undefined) {
    // Se obtiene el modelo del vehiculo seleccionado
    data.vehiculo.modelo = await getElementValue(driver, {
      selectReturnType: "label",
      locator: "selectType",
    });
  }

  if (data.vehiculo.version == undefined) {
    data.vehiculo.version = versiones[0].label;
  }

  data.vehiculo.versiones = versiones;
  await sleep(1000);

  await acercarHaElemento(driver, { locator: "postalCode" });

  if (data.titular.direccion) {
    await setInputValue(driver, {
      locator: "postalCode",
      changeFocus: true,
      sleeptime: 10,
      value: data.titular.direccion,
    });
    await sleep(3000);
  } else {
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

  await selectInUL(driver, { locator: "ui-id-2" });

  if (!data.titular.direccion) {
    // Seleccionanando la primera direccion disponible

    data.titular.direccion = direcciones[0].value;
    data.titular.direcciones = direcciones;
  }

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

  let paqueteCobertura = (
    data?.titular?.paqueteCobertura?.label ?? "Basica"
  ).toUpperCase();

  await sleep(1000);

  await waitForElement(driver, {
    locator: "selectCoveragePackage",
    by: "id",
  });

  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: `selectCoveragePackage`,
    tipoValor: "label",
    sleeptime: 1000,
    value: paqueteCobertura,
    by: "id",
  });

  await sleep(1000);

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

  data = await getDetallesCotizacion(driver, data);
  let resultadoModal = await validarModalAbierto(driver, {
    maxIntentos: 5,
  });

  if (resultadoModal.continue) {
    return await formatearData({
      mssgError: resultadoModal.mensaje,
      result: false,
    });
  }

  await guardandoCambios(driver, data);

  await sleep(1000);

  await clickElement(driver, {
    locator: "button.btn.btn-primary.next[type='submit']",
    by: "css",
  });

  await waitForElement(driver, {
    locator: "resumenNumCotizacion",
  });

  await sleep(1000);
  await scrollToBottom(driver);
  await sleep(1000);
  await scrollToBottom(driver);

  let tmp = await obtenerValoresPorId(driver, campos);

  let btnDownload = await getElement(driver, { locator: "descargarPDF" });
  let href = await btnDownload.getAttribute("href");

  // prettier-ignore
  let responseFile = await descargarArchivoHipervinculo( driver,href,"cotizacion_" + tmp.numeroCotizacion);
  let archivo = null;

  if (responseFile.status) {
    let pathFinal = await filePathToPublicUrl(responseFile.path);
    archivo = pathFinal;
  }

  data.detalles = { ...data.detalles, ...tmp, archivo };

  data.inicial = false;

  // deepPrint(data);

  return data;
}
module.exports = { ejecutarCotizacionAutos };
