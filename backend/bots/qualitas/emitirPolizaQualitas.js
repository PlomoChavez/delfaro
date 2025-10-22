const path = require("path");
const os = require("os");
const archivosNoPermitidos = ["Acuse-Poliza", "Carta de Bienvenida"];
const showLogs = true;

// prettier-ignore
const { 
  until, 
  By 
} = require("selenium-webdriver");

const {
  filePathToPublicUrl,
  getPath,
  existeCarpeta,
  descomprimirArchivo,
  eliminarArchivo,
  mergePDFs,
  obtenerRutaBackendFiles,
  obtenerArchivosEnCarpeta,
  mergePDFConPortada,
  archivoExiste,
} = require("../../utils/filesHelper");

const {
  esperarArchivoDescargado,
  openPage,
  waitForElement,
  sleep,
  scrollToBottom,
  setInputValue,
  clickElement,
  esperarCargaCompleta,
  getElement,
  getElementText,
  selectOptionInSelect,
  clickButtonInContenedor,
  validarExisteOption,
  redireccionarPagina,
  closeModal,
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

// prettier-ignore
const { 
  formatearData, 
  traducirError
} = require("../../utils/helper");

function showConsoleLog(message, logs = showLogs) {
  if (logs) {
    console.log(message);
  }
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

async function buscarPoliza(driver, data) {
  await setInputValue(driver, {
    locator: "numcotizacion",
    esperarHabilitado: true,
    value: "1032833958",
    // value: data.cotizacion.detalles.numeroCotizacion,
    sleeptime: 1000,
  });

  await clickElement(driver, {
    locator: "buscar",
    sleeptime: 1000,
  });
  await buscarCotizacionEnTabla(driver, data);
}

async function buscarCotizacionEnTabla(driver, data) {
  const tablaId = "tableCotizaciones";
  await sleep(2000);
  await waitForElement(driver, {
    locator: `#${tablaId}`,
    by: "css",
  });

  // prettier-ignore
  const filas = await driver.findElements(By.css("#tableCotizaciones tbody tr"));

  const numeroCotizacionHaBuscar = data.cotizacion.detalles.numeroCotizacion;

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];

    try {
      const numeroCotizacion = await fila
        .findElement(By.css("td:first-child u"))
        .getText();

      if (numeroCotizacion === numeroCotizacionHaBuscar) {
        // prettier-ignore
        const enlaceEmision = await fila.findElement(By.css("td:last-child a"));
        const urlEmision = await enlaceEmision.getAttribute("href");
        await redireccionarPagina(driver, { urlEmision, esperarCarga: true });
        return;
      }
    } catch (error) {
      console.log(`Error en fila ${i + 1}:`, error.message);
    }
  }

  // Si llegamos aquí, no se encontró la cotización
  throw new Error(
    `Cotización ${numeroCotizacionHaBuscar} no encontrada en la tabla`
  );
}

async function insertarDatos(driver, data) {
  console.log("Insertando datos del cliente...");
  let tmpIsCliente = !data.isCliente;
  let labelNuevo = tmpIsCliente ? "Nuevo" : "nuevo-contratante";
  let labelNuevoTipo = tmpIsCliente
    ? "persona_fisica"
    : "persona_fisica_contratante";

  console.log("tmpIsCliente", tmpIsCliente);
  console.log("labelNuevo", labelNuevo);
  console.log("labelNuevoTipo", labelNuevoTipo);
  // Seleccionar nuevo cliente
  await clickElement(driver, {
    locator: `label[for='${labelNuevo}']`, // Selector del label
    sleeptime: 1000,
    by: "css",
  });

  // Seleccionar nuevo cliente
  await clickElement(driver, {
    locator: `label[for='${labelNuevoTipo}']`, // Selector del label
    sleeptime: 1000,
    by: "css",
  });
  if (!tmpIsCliente) {
    await sleep(100000);
  }

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectNationality",
    tipoValor: "label",
    sleeptime: 1000,
    value: data.nacionalidad,
    by: "id",
  });

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectState",
    tipoValor: "label",
    sleeptime: 1000,
    value: data.estado.label.toUpperCase(),
    by: "id",
  });

  // prettier-ignore
  await setInputValue(driver, {
    locator: "name",
    esperarHabilitado: true,
    value:data.nombre + " " + data.segundoNombre,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "lastName",
    esperarHabilitado: true,
    value: data.apellidoPaterno,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "motherLastName",
    esperarHabilitado: true,
    value: data.apellidoMaterno,
    sleeptime: 1000,
  });

  // prettier-ignore
  const [year, month, day] = data.fechaNacimiento.split("-");
  let fechaNacimiento = `${day}/${month}/${year}`;

  await setInputValue(driver, {
    locator: "dateOfBirth",
    esperarHabilitado: true,
    value: fechaNacimiento,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "CURP",
    esperarHabilitado: true,
    value: data.curp,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "idNumber",
    esperarHabilitado: true,
    value: data.referenciaIdentificacion,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "RFC",
    esperarHabilitado: true,
    value: data.rfc,
    sleeptime: 1000,
  });

  const existeColonia = await validarExisteOption(driver, {
    locator: "selectSuburb",
    valueOption: data.colonia.toUpperCase(),
    tipoValor: "label",
    formatoComparacion: "mayusculas",
  });

  console.log("existeColonia", existeColonia);
  if (existeColonia) {
    // Insertando la colonia
    await selectOptionInSelect(driver, {
      esperarHabilitado: true,
      locator: "selectSuburb",
      tipoValor: "label",
      sleeptime: 1000,
      value: data.colonia.toUpperCase(),
      by: "id",
    });
  }

  await setInputValue(driver, {
    locator: "street",
    esperarHabilitado: true,
    value: data.calle,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "outdoorNumber",
    esperarHabilitado: true,
    value: data.numeroExterior,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "Landline",
    esperarHabilitado: true,
    value: data.telefonoFijo,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "cellPhone",
    esperarHabilitado: true,
    value: data.celular,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "email",
    esperarHabilitado: true,
    value: data.correo,
    sleeptime: 1000,
  });

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectProfession",
    tipoValor: "label",
    sleeptime: 1000,
    value: "OTRO",
    by: "id",
  });

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectOccupation",
    tipoValor: "label",
    sleeptime: 1000,
    value: "OTRO",
    by: "id",
  });

  await setInputValue(driver, {
    locator: "otherOcupation",
    esperarHabilitado: true,
    value: data.ocupacion,
    sleeptime: 1000,
  });

  await sleep(2000);
  console.log("Guardando asegurado...");

  await scrollToBottom(driver);

  await clickElement(driver, {
    locator: "saveButton_AseguradoFisica", // Selector del label
    sleeptime: 1000,
  });
  await sleep(2000);

  const resultadoModal = await validarModalAbierto(driver);
  console.log("resultadoModal", resultadoModal);
  if (!resultadoModal.continue) {
    return await formatearData({
      mssgError: resultadoModal.mensaje,
      result: false,
    });
  }

  await clickElement(driver, {
    locator: "nextButton_AseguradoFisica", // Selector del label
    sleeptime: 1000,
  });
}

async function insertarDatos2(driver, data) {
  console.log("Insertando datos del cliente...");
  let tmpIsCliente = !data.isCliente;
  let labelNuevo = tmpIsCliente ? "Nuevo" : "nuevo-contratante";
  let labelNuevoTipo = tmpIsCliente
    ? "persona_fisica"
    : "persona_fisica_contratante";

  console.log("tmpIsCliente", tmpIsCliente);
  console.log("labelNuevo", labelNuevo);
  console.log("labelNuevoTipo", labelNuevoTipo);
  // Seleccionar nuevo cliente
  await clickElement(driver, {
    locator: `label[for='${labelNuevo}']`, // Selector del label
    sleeptime: 1000,
    by: "css",
  });

  // Seleccionar nuevo cliente
  await clickElement(driver, {
    locator: `label[for='${labelNuevoTipo}']`, // Selector del label
    sleeptime: 1000,
    by: "css",
  });

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectNationality_contratanteFisica",
    tipoValor: "label",
    sleeptime: 1000,
    value: data.nacionalidad,
    by: "id",
  });

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectState_contratanteFisica",
    tipoValor: "label",
    sleeptime: 1000,
    value: data.estado.label.toUpperCase(),
    by: "id",
  });

  // prettier-ignore
  await setInputValue(driver, {
    locator: "name_contratanteFisica",
    esperarHabilitado: true,
    value:data.nombre + " " + data.segundoNombre,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "lastName_contratanteFisica",
    esperarHabilitado: true,
    value: data.apellidoPaterno,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "motherLastName_contratanteFisica",
    esperarHabilitado: true,
    value: data.apellidoMaterno,
    sleeptime: 1000,
  });

  // prettier-ignore
  const [year, month, day] = data.fechaNacimiento.split("-");
  let fechaNacimiento = `${day}/${month}/${year}`;

  await setInputValue(driver, {
    locator: "dateOfBirth_contratanteFisica",
    esperarHabilitado: true,
    value: fechaNacimiento,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "CURP_contratanteFisica",
    esperarHabilitado: true,
    value: data.curp,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "idNumber_contratanteFisica",
    esperarHabilitado: true,
    value: data.referenciaIdentificacion,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "RFC_contratanteFisica",
    esperarHabilitado: true,
    value: data.rfc,
    sleeptime: 1000,
  });

  const existeColonia = await validarExisteOption(driver, {
    locator: "selectSuburb_contratanteFisica",
    valueOption: data.colonia.toUpperCase(),
    tipoValor: "label",
    formatoComparacion: "mayusculas",
  });

  console.log("existeColonia", existeColonia);
  if (existeColonia) {
    // Insertando la colonia
    await selectOptionInSelect(driver, {
      esperarHabilitado: true,
      locator: "selectSuburb_contratanteFisica",
      tipoValor: "label",
      sleeptime: 1000,
      value: data.colonia.toUpperCase(),
      by: "id",
    });
  }

  await setInputValue(driver, {
    locator: "street_contratanteFisica",
    esperarHabilitado: true,
    value: data.calle,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "outdoorNumber_contratanteFisica",
    esperarHabilitado: true,
    value: data.numeroExterior,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "Landline_contratanteFisica",
    esperarHabilitado: true,
    value: data.telefonoFijo,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "cellPhone_contratanteFisica",
    esperarHabilitado: true,
    value: data.celular,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "email_contratanteFisica",
    esperarHabilitado: true,
    value: data.correo,
    sleeptime: 1000,
  });

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectProfession_contratanteFisica",
    tipoValor: "label",
    sleeptime: 1000,
    value: "OTRO",
    by: "id",
  });

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: "selectOccupation_contratanteFisica",
    tipoValor: "label",
    sleeptime: 1000,
    value: "OTRO",
    by: "id",
  });

  await setInputValue(driver, {
    locator: "otherOcupationContratante",
    esperarHabilitado: true,
    value: data.ocupacion,
    sleeptime: 1000,
  });

  await sleep(2000);
  console.log("Guardando asegurado...");

  await scrollToBottom(driver);

  await clickElement(driver, {
    locator: "saveButton_contratanteFisica", // Selector del label
    sleeptime: 1000,
  });
  await sleep(2000);

  const resultadoModal = await validarModalAbierto(driver);
  console.log("resultadoModal", resultadoModal);
  if (!resultadoModal.continue) {
    return await formatearData({
      mssgError: resultadoModal.mensaje,
      result: false,
    });
  }

  await clickElement(driver, {
    locator: "nextButton_contratanteFisica", // Selector del label
    sleeptime: 1000,
  });
}

async function insertandoDatosCarro(driver, data) {
  console.log("Insertando datos del carro ...");
  await sleep(500);
  await setInputValue(driver, {
    locator: "placa",
    esperarHabilitado: true,
    value: data.placas,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "noSerie",
    esperarHabilitado: true,
    value: data.numeroSerie,
    sleeptime: 1000,
  });

  await clickElement(driver, {
    locator: "img[alt='Buscar']",
    by: "css",
    sleeptime: 1000,
  });

  const resultadoModal = await validarModalAbierto(driver);
  console.log("resultadoModal", resultadoModal);
  if (!resultadoModal.continue) {
    return await formatearData({
      mssgError: resultadoModal.mensaje,
      result: false,
    });
  }

  await setInputValue(driver, {
    locator: "noMotor",
    esperarHabilitado: true,
    value: data.numeroMotor,
    sleeptime: 1000,
  });

  const existeColor = await validarExisteOption(driver, {
    locator: "selectColor",
    valueOption: data.color.toUpperCase(),
    tipoValor: "label",
    formatoComparacion: "mayusculas",
  });

  console.log("existeColor", existeColor);
  if (existeColor) {
    // Insertando el color
    await selectOptionInSelect(driver, {
      esperarHabilitado: true,
      locator: "selectColor",
      tipoValor: "label",
      sleeptime: 1000,
      value: data.color.toUpperCase(),
      by: "id",
    });
  }

  await setInputValue(driver, {
    locator: "regularDriver",
    esperarHabilitado: true,
    value: data.conductorHabitual,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "repuve",
    esperarHabilitado: true,
    value: data.repuve,
    sleeptime: 1000,
  });

  await setInputValue(driver, {
    locator: "numeroEconomico",
    esperarHabilitado: true,
    value: data.numeroEconomico,
    sleeptime: 1000,
  });

  await scrollToBottom(driver);

  await sleep(1000);
  console.log("Guardando carro...");
  // Estrategia 1: JavaScript puro con búsqueda múltiple
  const clickButton = await clickButtonInContenedor(driver, {
    contenedor: "formPlacas",
    labelButton: "Siguiente",
  });

  console.log("Resultado del click JavaScript:", clickButton);
}

async function consultaPoliza(driver, data) {
  // Redireccionando el consultador de polizas
  // prettier-ignore
  await driver.get("https://agentes360.qualitas.com.mx/group/guest/consulta-de-polizas/");
  await esperarCargaCompleta(driver);

  // insertar el numero de poliza
  await setInputValue(driver, {
    locator: "numberPolicy",
    value: "0810326356",
    sleeptime: 1000,
  });

  // Hacer click en buscar
  await clickElement(driver, {
    locator: "img[alt='Consulta poliza']",
    by: "css",
  });

  // Validar el resultado de la poliza
  let tmp = await validarTablaPoliza(driver);

  // Si hay error, retornar
  if (tmp.hasError) {
    return await formatearData({
      mssgError: tmp.message,
      result: false,
    });
  }
}

async function validarModalAbierto(driver, options = {}) {
  const {
    timeout = 10000, // Aumentar timeout
    autoClose = true, // Cambiar a true por defecto
    closeAction = "Aceptar",
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
    console.log("🔍 Esperando que aparezca un modal...");
    let modalEncontrado = null;
    let intentos = 0;
    const maxIntentos = 10; // 10 intentos = 20 segundos

    // BUCLE DE ESPERA - Intentar hasta que aparezca un modal
    while (!modalEncontrado && intentos < maxIntentos) {
      console.log(
        `🔎 Intento ${intentos + 1}/${maxIntentos} - Buscando modales...`
      );

      // Buscar cada tipo de modal EN EL ORDEN ESPECÍFICO
      for (const modalConfig of modalesConfig) {
        try {
          console.log(`   📋 Verificando: ${modalConfig.id}`);

          // USAR SELECTOR DIRECTO POR ID PRIMERO
          const modal = await driver.findElement(By.id(modalConfig.id));
          const isVisible = await modal.isDisplayed();

          if (isVisible) {
            console.log(
              `✅ ¡Modal encontrado!: ${modalConfig.tipo} (${modalConfig.id})`
            );

            let mensaje = "";
            try {
              mensaje = await getElementText(driver, {
                locator: modalConfig.messageSelector,
                by: "css",
              });
              console.log(`💬 Mensaje: "${mensaje}"`);
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
              console.log(
                `🔄 Cerrando modal con botón: "${modalConfig.buttonText}"`
              );

              try {
                const resultadoCierre = await closeModal(driver, {
                  locator: modalConfig.id,
                  by: "id",
                  btnLabel: modalConfig.buttonText,
                  message: modalConfig.messageSelector.replace("#", ""), // Quitar el # del selector
                  autoClose: true,
                  sleepAfter: 1000,
                });

                console.log(`✅ Modal cerrado exitosamente`);
                modalEncontrado.cerrado = resultadoCierre.result;
              } catch (closeError) {
                console.log("❌ Error cerrando modal:", closeError.message);
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
        console.log(
          `   ❌ No se encontraron modales visibles - esperando 2s...`
        );
        await sleep(2000);
        intentos++;
      }
    }

    // Si después de todos los intentos no se encontró modal
    if (!modalEncontrado) {
      console.log(
        "⚠️ ADVERTENCIA: Se esperaba un modal pero no se encontró ninguno después de todos los intentos"
      );

      // Debug: Verificar qué modales existen en el DOM
      console.log("🔍 Verificando modales en el DOM...");
      for (const modalConfig of modalesConfig) {
        try {
          const modal = await driver.findElement(By.id(modalConfig.id));
          const isDisplayed = await modal.isDisplayed();
          const style = await modal.getAttribute("style");
          const className = await modal.getAttribute("class");
          console.log(
            `   📋 ${
              modalConfig.id
            }: existe=${true}, visible=${isDisplayed}, style="${style}", class="${className}"`
          );
        } catch (e) {
          console.log(`   📋 ${modalConfig.id}: existe=${false}`);
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

async function validarTablaPoliza(driver) {
  await sleep(1500);
  console.log("Validando tabla de póliza...");

  // Esperar tablaPrincipal
  await waitForElement(driver, {
    locator: "tablaPrincipal",
    timeout: 3000,
    by: "id",
  });
  console.log("tablaPrincipal encontrada");
  // Verificar tabla
  try {
    await waitForElement(driver, {
      locator: "#info-consulta-poliza table",
      by: "css",
      timeout: 3000,
    });

    return { hasTable: true, hasError: false, message: "Tabla encontrada" };
  } catch (e) {
    // No hay tabla, verificar error
    try {
      const mensaje = await getElementText(driver, {
        locator: "#info-consulta-poliza .portlet-msg-error",
        by: "css",
      });

      return { hasTable: false, hasError: true, message: mensaje };
    } catch (e2) {
      return { hasTable: false, hasError: false, message: "Sin contenido" };
    }
  }
}

// prettier-ignore
async function iniciarDescargaDocumentos(driver, options = {}) {
  const { logs = false } = options;
  
  if (logs) {
    console.log("📥 Iniciando descarga de documentos...");
  }

  try {
    // Obtener la carpeta de descargas del usuario
    const downloadPath = await getPath();

    // Buscar el botón "Descargar todo"
    const botonDescargarTodo = await getElement(driver, {
      locator: "a[onclick*='downloadZipAllFiles']",
      by: "css",
      timeout: 5000,
    });

    if (!botonDescargarTodo) {
      return {
        result: false,
        error: "Botón de descarga no encontrado",
      };
    }

    if (logs) {
      console.log("📦 Botón 'Descargar todo' encontrado");
    }

    // Obtener el onclick completo del botón
    const onclickCompleto = await botonDescargarTodo.getAttribute("onclick");
    
    if (logs) {
      console.log("🔍 Onclick completo:", onclickCompleto);
      console.log("⚡ Ejecutando función JavaScript de descarga...");
    }

    // Ejecutar directamente la función JavaScript del onclick
    await driver.executeScript(onclickCompleto);

    if (logs) {
      console.log("✅ Función de descarga ejecutada");
    }

    return {
      result: true,
      downloadPath: downloadPath,
      message: "Descarga iniciada exitosamente",
    };
  } catch (error) {
      console.log("❌ Error iniciando descarga:", error.message);
    return {
      result: false,
      error: error.message,
    };
  }
}

// prettier-ignore
async function eliminarArchivosInnecesarios(options = {}) {
  const { archivos, detallado = false, logs = false } = options; // ✅ Cambiar logs por defecto a true

  if (logs) {
    console.log("🗑️ Iniciando eliminación de archivos innecesarios...");
    console.log("📦 Archivos recibidos:", archivos?.length || 0);
  }

  if (!archivos || !Array.isArray(archivos)) {
    const error = "No se proporcionaron archivos válidos para procesar";
    if (logs) console.log(`❌ ${error}`);
    return {
      result: false,
      error: error,
    };
  }

  if (archivos.length === 0) {
    const mensaje = "No hay archivos para procesar";
    if (logs) console.log(`⚠️ ${mensaje}`);
    return {
      result: true,
      totalProcesados: 0,
      archivosConservados: [],
      message: mensaje
    };
  }

  try {
    if (logs) {
      console.log(`📄 Total de archivos encontrados: ${archivos.length}`);
      console.log(`🚫 Archivos a eliminar que contengan: [${archivosNoPermitidos.join(', ')}]`);
    }

    const archivosEliminados = [];
    const archivosConservados = [];
    const errores = [];

    // Procesar cada archivo
    for (const archivo of archivos) {
      const nombreArchivo = archivo.nombreOriginal;

      if (logs) {
        console.log(`\n📄 Procesando: ${nombreArchivo}`);
      }

      // Verificar si el archivo contiene alguna palabra NO permitida
      const esPermitido = archivosNoPermitidos.some(palabraProhibida => 
        nombreArchivo.toLowerCase().includes(palabraProhibida.toLowerCase())
      );

      if (!esPermitido) {
        // Conservar el archivo
        archivosConservados.push({
          nombre: nombreArchivo,
          ruta: archivo.rutaCompleta,
        });

        if (logs) {
          console.log(`   ✅ CONSERVANDO: ${nombreArchivo}`);
        }
      } else {
        // Eliminar el archivo
        if (logs) {
          console.log(`   🗑️ ELIMINANDO: ${nombreArchivo}`);
          console.log(`   📁 Ruta: ${archivo.rutaCompleta}`);
        }

        const resultadoEliminacion = await eliminarArchivo(archivo.rutaCompleta, { logs: false });

        if (resultadoEliminacion.result) {
          archivosEliminados.push({
            nombre: nombreArchivo,
            ruta: archivo.rutaCompleta,
          });

          if (logs) {
            console.log(`   ✅ Eliminado exitosamente`);
          }
        } else {
          errores.push({
            nombre: nombreArchivo,
            ruta: archivo.rutaCompleta,
            error: resultadoEliminacion.error,
          });

          if (logs) {
            console.log(`   ❌ Error eliminando: ${resultadoEliminacion.error}`);
          }
        }
      }
    }

    if (logs && detallado) {
      // Resumen final SIEMPRE visible
      console.log("\n📊 RESUMEN DE ELIMINACIÓN:");
      console.log(`   📄 Archivos procesados: ${archivos.length}`);
      console.log(`   ✅ Archivos conservados: ${archivosConservados.length}`);
      console.log(`   🗑️ Archivos eliminados: ${archivosEliminados.length}`);
      console.log(`   ❌ Errores: ${errores.length}`);
    }


    // Determinar si el proceso fue exitoso
    const exitoso = errores.length === 0;
    
    if (logs) {
      if (exitoso) {
        console.log("🎉 Eliminación completada exitosamente");
      } else {
        console.log("⚠️ Eliminación completada con errores");
      }
    }

    let returnTmp = {
      result: exitoso,
      totalProcesados: archivos.length,
      archivosConservados,
      message: exitoso 
        ? `Eliminación exitosa: ${archivosEliminados.length} eliminados, ${archivosConservados.length} conservados`
        : `Eliminación con errores: ${errores.length} errores de ${archivos.length} archivos`
    };

    if (detallado) {
      returnTmp.archivosEliminados = archivosEliminados;
      returnTmp.errores = errores;
    }

    return returnTmp;
  } catch (error) {
    const errorMsg = `Error en eliminación de archivos: ${error.message}`;
    console.log(`❌ ${errorMsg}`);

    return {
      result: false,
      error: errorMsg,
      totalProcesados: 0,
    };
  }
}

// prettier-ignore
async function procesarArchivosConPortada(options = {}) {
  const { archivos = [], logs = false } = options;
  
  if (logs) {
    console.log(`🚀 Iniciando procesamiento de ${archivos.length} archivos`);
  }
  
  const rutaPlantilla = obtenerRutaBackendFiles("plantillas","Portada.pdf");
  const archivosExitosos = [];
  const archivoConError = null;

  for (let i = 0; i < archivos.length; i++) {
    const archivo = archivos[i];
    
    if (logs) {
      console.log(`📄 [${i + 1}/${archivos.length}] Procesando: ${archivo.nombreOriginal}`);
    }

    try {
      const resultadoMerge = await mergePDFs({
        archivoOriginal: archivo.ruta,
        archivosMerge: rutaPlantilla,
      });

      // 🚨 VERIFICAR ERROR EN MERGE
      if (!resultadoMerge.result) {
        if (logs) {
          console.log(`❌ Error en merge: ${resultadoMerge.error}`);
          console.log(`🛑 Cancelando procesamiento (${archivos.length - i - 1} archivos restantes)`);
        }
        
        return {
          result: false,
          error: `Error haciendo merge del archivo ${archivo.nombreOriginal}: ${resultadoMerge.error}`,
          archivoConError: archivo.nombreOriginal,
          indiceError: i,
          archivosExitosos: archivosExitosos.length,
          archivosRestantes: archivos.length - i - 1,
          detalleError: resultadoMerge
        };
      }

      // ✅ MERGE EXITOSO
      archivosExitosos.push({
        nombreOriginal: archivo.nombreOriginal,
        ruta: archivo.ruta,
        archivoSalida: resultadoMerge.archivoSalida,
        totalPaginas: resultadoMerge.totalPaginas
      });

      if (logs) {
        console.log(`   ✅ Completado: ${resultadoMerge.totalPaginas} páginas totales`);
      }

    } catch (error) {
      // 🚨 ERROR INESPERADO
      if (logs) {
        console.log(`❌ Error inesperado: ${error.message}`);
        console.log(`🛑 Cancelando procesamiento`);
      }
      
      return {
        result: false,
        error: `Error inesperado procesando ${archivo.nombreOriginal}: ${error.message}`,
        archivoConError: archivo.nombreOriginal,
        indiceError: i,
        archivosExitosos: archivosExitosos.length,
        tipoError: "inesperado"
      };
    }
  }

  // 🎉 TODOS LOS ARCHIVOS PROCESADOS EXITOSAMENTE
  if (logs) {
    console.log(`🎉 Procesamiento completado: ${archivosExitosos.length} archivos exitosos`);
  }

  return {
    result: true,
    message: "Todos los merges completados exitosamente",
    totalArchivos: archivos.length,
    archivosExitosos,
    resumen: {
      procesados: archivosExitosos.length,
      errores: 0
    }
  };
}

async function descargarTodosLosDocumentos(driver, options = {}) {
  const { numeroPoliza, logs = false } = options;
  // 1. Iniciar la descarga
  // prettier-ignore
  const resultadoInicio = await iniciarDescargaDocumentos(driver, { logs });

  if (!resultadoInicio.result) {
    return resultadoInicio;
  }

  // 2. Esperar a que se complete la descarga
  const resultadoEspera = await esperarArchivoDescargado({
    archivosAntes: resultadoInicio.archivosAntes,
    downloadPath: resultadoInicio.downloadPath,
    extensiones: [".zip", ".pdf"],
    palabrasClave: ["download", "files", "poliza", "policy"],
    maxIntentos: 45, // 90 segundos
    intervalo: 2000,
    nuevoNombre: `Poliza_${numeroPoliza}_Documentos`,
  });

  if (resultadoEspera.result) {
    // 3. Descomprimir el archivo si es un ZIP
    let resultadoDescompresion = null;

    if (resultadoEspera.nombreArchivo.toLowerCase().endsWith(".zip")) {
      // prettier-ignore
      const rutaCarpetaPolizas = obtenerRutaBackendFiles( "polizas", numeroPoliza );

      // prettier-ignore
      await existeCarpeta(rutaCarpetaPolizas, { crearSiNoExiste: true });

      let procesoDescompresion = await descomprimirArchivo(
        resultadoEspera.rutaCompleta,
        rutaCarpetaPolizas
      );

      if (logs) {
        console.log("Descompresión completada:", procesoDescompresion);
      }
    }

    return {
      result: true,
      tipo: "Documentos_Poliza",
      nombreArchivo: resultadoEspera.nombreArchivo,
      rutaCompleta: resultadoEspera.rutaCompleta,
      tamaño: resultadoEspera.tamaño,
      descompresion: resultadoDescompresion,
      message: "Descarga y descompresión completadas exitosamente",
    };
  } else {
    return {
      result: false,
      error: resultadoEspera.error,
    };
  }
}

async function handleEmitirPoliza(data) {
  let driver;

  try {
    // prettier-ignore
    driver = await openPage("https://agentes360.qualitas.com.mx/", {
      headless: false,
    });

    await iniciarSesion(driver, data);

    await sleep(2000);

    // // Redireccionar al buscador de cotiizaciones
    // // prettier-ignore
    // await driver.get("https://agentes360.qualitas.com.mx/group/guest/lista-de-cotizaciones");

    // await buscarPoliza(driver, data);

    // // Insertando datos del asegurado
    // await insertarDatos(driver, data.asegurado);

    // // Insertando datos del carro
    // await insertandoDatosCarro(driver, data.carro);

    // // Insertando datos del cliente
    // await insertarDatos2(driver, data.cliente);

    // await clickElement(driver, {
    //   locator: "btnVigencia",
    //   sleeptime: 100,
    // });

    // await clickElement(driver, {
    //   locator: "btnEmision",
    //   sleeptime: 1000,
    // });
    // *****************************************************

    await consultaPoliza(driver, data);

    // Si hay tabla, obtener la informacion de la poliza
    // prettier-ignore
    const numeroPoliza = await getElementText(driver, { locator: "nPol" });
    // const numeroPoliza = "0810326356";

    console.log("numeroPoliza", numeroPoliza);

    // prettier - ignore;
    let resultadoDescarga = await descargarTodosLosDocumentos(driver, {
      numeroPoliza,
    });

    if (!resultadoDescarga.result) {
      return await formatearData(resultadoDescarga);
    }

    // prettier-ignore
    const rutaCarpetaPolizas = obtenerRutaBackendFiles( "polizas", numeroPoliza );
    // prettier-ignore
    const rutaCompleta = resultadoDescarga.rutaCompleta;
    // const rutaCompleta = "/Users/plomochavez/Downloads/Poliza_0810326356_Documentos.zip";

    await existeCarpeta(rutaCarpetaPolizas, {
      crearSiNoExiste: true,
    });

    showConsoleLog("Descomprimiento archivo ZIP de la poliza");
    let procesoDescompresion = await descomprimirArchivo(
      rutaCompleta,
      rutaCarpetaPolizas
    );

    if (!procesoDescompresion.result) {
      return await formatearData(procesoDescompresion);
    }

    // Eliminar archivos innecesarios
    showConsoleLog("Eliminando archivos innecesarios");

    let procesoEliminacion = await eliminarArchivosInnecesarios({
      archivos: procesoDescompresion.archivosExtraidos,
    });

    if (!procesoEliminacion.result) {
      return await formatearData(procesoEliminacion);
    }

    showConsoleLog("Procesando archivos con portada");
    // Eliminar el archivo ZIP descargado
    let procesadaMerge = await procesarArchivosConPortada({
      archivos: procesoEliminacion.archivosConservados,
    });

    // showConsoleLog("✅ procesadaMerge:", procesadaMerge);

    if (!procesadaMerge.result) {
      return await formatearData(procesadaMerge);
    }

    await eliminarArchivo(rutaCompleta);
    console.log("✅ procesadaMerge:", data);
    showConsoleLog("🎉 Proceso completado exitosamente.");
    // // prettier-ignore
    // dataResponse = await generadorCotizacion(driver, data);
    // // let tmp = await formatearData(dataResponse);

    // dataResponse.estimar = false;
    return await formatearData({});
  } catch (error) {
    error = traducirError(error, "Error general en la emitir la poliza: ");
    console.log(error);
    return await formatearData({
      mssgError: error,
      result: false,
    });
  } finally {
    if (driver) await driver.quit();
  }
}
module.exports = { handleEmitirPoliza };
