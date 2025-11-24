const path = require("path");
const os = require("os");
const archivosNoPermitidos = ["Acuse-Poliza", "Carta de Bienvenida"];
const showLogs = true;

const {
  findOne,
  getAllFrom,
  deleteById,
  createOrUpdate,
} = require("../../db/functionsSQL");

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
  printDeep,
  extraerNumeroFlotante,
  formatearData, 
  deepClone,
  traducirError
} = require("../../utils/helper");
const { calcularEdad, sumarFechas, now } = require("../../utils/fechasHelper");

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
    value: data.cotizacion.detalles.numeroCotizacion,
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

// prettier-ignore
async function insertarDatos(driver, data, esContratante = false) {
  console.log(`Insertando datos del ${esContratante ? 'contratante' : 'asegurado'}...`);
  
  let tmpIsCliente = !data.isCliente;
  let labelNuevo = tmpIsCliente ? "Nuevo" : "nuevo-contratante";
  let labelNuevoTipo = tmpIsCliente
    ? "persona_fisica"
    : "persona_fisica_contratante";

  // Definir sufijos según el tipo
  const sufijo = esContratante ? "_contratanteFisica" : "";
  
  console.log("tmpIsCliente", tmpIsCliente);
  console.log("labelNuevo", labelNuevo);
  console.log("labelNuevoTipo", labelNuevoTipo);
  
  // Seleccionar nuevo cliente
  await clickElement(driver, {
    locator: `label[for='${labelNuevo}']`,
    sleeptime: 1000,
    by: "css",
  });

  // Seleccionar tipo de persona
  await clickElement(driver, {
    locator: `label[for='${labelNuevoTipo}']`,
    sleeptime: 1000,
    by: "css",
  });
  
  // Solo para asegurado (comportamiento original)
  if (!tmpIsCliente && !esContratante) {
    await sleep(100000);
  }

  // Insertando la nacionalidad
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: `selectNationality${sufijo}`,
    tipoValor: "label",
    sleeptime: 1000,
    value: data.nacionalidad ?? "Mexicana",
    by: "id",
  });

  // Insertando el estado
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: `selectState${sufijo}`,
    tipoValor: "label",
    sleeptime: 1000,
    value: data.estado.label.toUpperCase(),
    by: "id",
  });

  // Nombre
  await setInputValue(driver, {
    locator: `name${sufijo}`,
    esperarHabilitado: true,
    value: data.nombre + " " + data.segundoNombre,
    sleeptime: 1000,
  });

  // Apellido paterno
  await setInputValue(driver, {
    locator: `lastName${sufijo}`,
    esperarHabilitado: true,
    value: data.apellidoPaterno,
    sleeptime: 1000,
  });

  // Apellido materno
  await setInputValue(driver, {
    locator: `motherLastName${sufijo}`,
    esperarHabilitado: true,
    value: data.apellidoMaterno,
    sleeptime: 1000,
  });

  // Fecha de nacimiento
  const [year, month, day] = data.fechaNacimiento.split("-");
  let fechaNacimiento = `${day}/${month}/${year}`;

  await setInputValue(driver, {
    locator: `dateOfBirth${sufijo}`,
    esperarHabilitado: true,
    value: fechaNacimiento,
    sleeptime: 1000,
  });

  // CURP
  await setInputValue(driver, {
    locator: `CURP${sufijo}`,
    esperarHabilitado: true,
    value: data.curp,
    sleeptime: 1000,
  });

  // Número de identificación
  await setInputValue(driver, {
    locator: `idNumber${sufijo}`,
    esperarHabilitado: true,
    value: data.referenciaIdentificacion,
    sleeptime: 1000,
  });

  // RFC
  await setInputValue(driver, {
    locator: `RFC${sufijo}`,
    esperarHabilitado: true,
    value: data.rfc,
    sleeptime: 1000,
  });

  // Validar y seleccionar colonia
  const existeColonia = await validarExisteOption(driver, {
    locator: `selectSuburb${sufijo}`,
    valueOption: data.colonia.toUpperCase(),
    tipoValor: "label",
    formatoComparacion: "mayusculas",
  });

  console.log("existeColonia", existeColonia);
  if (existeColonia) {
    await selectOptionInSelect(driver, {
      esperarHabilitado: true,
      locator: `selectSuburb${sufijo}`,
      tipoValor: "label",
      sleeptime: 1000,
      value: data.colonia.toUpperCase(),
      by: "id",
    });
  }

  // Calle
  await setInputValue(driver, {
    locator: `street${sufijo}`,
    esperarHabilitado: true,
    value: data.calle,
    sleeptime: 1000,
  });

  // Número exterior
  await setInputValue(driver, {
    locator: `outdoorNumber${sufijo}`,
    esperarHabilitado: true,
    value: data.numeroExterior,
    sleeptime: 1000,
  });

  // Teléfono fijo
  await setInputValue(driver, {
    locator: `Landline${sufijo}`,
    esperarHabilitado: true,
    value: data.telefonoFijo,
    sleeptime: 1000,
  });

  // Celular
  await setInputValue(driver, {
    locator: `cellPhone${sufijo}`,
    esperarHabilitado: true,
    value: data.celular,
    sleeptime: 1000,
  });

  // Email
  await setInputValue(driver, {
    locator: `email${sufijo}`,
    esperarHabilitado: true,
    value: data.correo,
    sleeptime: 1000,
  });

  // Profesión
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: `selectProfession${sufijo}`,
    tipoValor: "label",
    sleeptime: 1000,
    value: "OTRO",
    by: "id",
  });

  // Ocupación
  await selectOptionInSelect(driver, {
    esperarHabilitado: true,
    locator: `selectOccupation${sufijo}`,
    tipoValor: "label",
    sleeptime: 1000,
    value: "OTRO",
    by: "id",
  });

  // Otra ocupación (campo específico según el tipo)
  const campoOtraOcupacion = esContratante ? "otherOcupationContratante" : "otherOcupation";
  await setInputValue(driver, {
    locator: campoOtraOcupacion,
    esperarHabilitado: true,
    value: data.ocupacion,
    sleeptime: 1000,
  });

  await sleep(2000);
  console.log(`Guardando ${esContratante ? 'contratante' : 'asegurado'}...`);

  await scrollToBottom(driver);

  // Botón de guardar específico según el tipo
  const botonGuardar = esContratante ? "saveButton_contratanteFisica" : "saveButton_AseguradoFisica";
  await clickElement(driver, {
    locator: botonGuardar,
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

  // Botón siguiente específico según el tipo
  const botonSiguiente = esContratante ? "nextButton_contratanteFisica" : "nextButton_AseguradoFisica";
  await clickElement(driver, {
    locator: botonSiguiente,
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
  // await setInputValue(driver, {
  //   locator: "detailSpecialEquip",
  //   esperarHabilitado: true,
  //   value: data.detallesEquipoEspecial ?? "Ninguno",
  //   sleeptime: 1000,
  // });
  // await setInputValue(driver, {
  //   locator: "detailAdaptaciones",
  //   esperarHabilitado: true,
  //   value: data.detallesAdaptaciones ?? "Ninguno",
  //   sleeptime: 1000,
  // });

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
    value: "0810329938",
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
    let modalEncontrado = null;
    let intentos = 0;
    const maxIntentos = 10; // 10 intentos = 20 segundos

    // BUCLE DE ESPERA - Intentar hasta que aparezca un modal
    while (!modalEncontrado && intentos < maxIntentos) {
      // Buscar cada tipo de modal EN EL ORDEN ESPECÍFICO
      for (const modalConfig of modalesConfig) {
        try {
          // USAR SELECTOR DIRECTO POR ID PRIMERO
          const modal = await driver.findElement(By.id(modalConfig.id));
          const isVisible = await modal.isDisplayed();

          if (isVisible) {
            let mensaje = "";
            try {
              mensaje = await getElementText(driver, {
                locator: modalConfig.messageSelector,
                by: "css",
              });
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
              try {
                const resultadoCierre = await closeModal(driver, {
                  locator: modalConfig.id,
                  by: "id",
                  btnLabel: modalConfig.buttonText,
                  message: modalConfig.messageSelector.replace("#", ""), // Quitar el # del selector
                  autoClose: true,
                  sleepAfter: 1000,
                });

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

async function handleProcesarArchivosPoliza(driver, data, options = {}) {
  await sleep(5000);

  await esperarCargaCompleta(driver);

  await waitForElement(driver, {
    locator: "nPol",
    by: "id",
  });

  await waitForElement(driver, {
    locator: "info-consulta-poliza",
    by: "id",
  });

  await sleep(5000);
  // // Si hay tabla, obtener la informacion de la poliza
  // // prettier-ignore
  const numeroPoliza = await getElementText(driver, { locator: "nPol" });

  // prettier - ignore;
  let resultadoDescarga = await descargarTodosLosDocumentos(driver, {
    numeroPoliza,
  });

  if (!resultadoDescarga.result) {
    return await formatearData(resultadoDescarga);
  }

  // prettier-ignore
  const rutaCarpetaPolizas = obtenerRutaBackendFiles( "polizas","qualitas", numeroPoliza );
  // prettier-ignore
  const rutaCompleta = resultadoDescarga.rutaCompleta;

  await existeCarpeta(rutaCarpetaPolizas, {
    crearSiNoExiste: true,
  });

  let procesoDescompresion = await descomprimirArchivo(
    rutaCompleta,
    rutaCarpetaPolizas
  );

  if (!procesoDescompresion.result) {
    return await formatearData(procesoDescompresion);
  }

  // Eliminar archivos innecesarios

  let procesoEliminacion = await eliminarArchivosInnecesarios({
    archivos: procesoDescompresion.archivosExtraidos,
  });

  if (!procesoEliminacion.result) {
    return await formatearData(procesoEliminacion);
  }

  // Eliminar el archivo ZIP descargado
  let procesadaMerge = await procesarArchivosConPortada({
    archivos: procesoEliminacion.archivosConservados,
  });

  // await eliminarArchivo(rutaCompleta);

  if (!procesadaMerge.result) {
    return await formatearData(procesadaMerge);
  }
  let archivos = [];

  for (const archivo of procesadaMerge.archivosExitosos) {
    archivos.push({
      nombreOriginal: archivo.nombreOriginal,
      nombre: archivo.nombreFormateado,
      ruta: archivo.archivoSalida,
    });
  }

  let procesoURL = await publicURLToFiles(archivos);

  if (!procesoURL.result) {
    return await formatearData(procesoURL);
  }

  data.archivos = procesoURL.data;
  data.numeroPoliza = numeroPoliza;

  let registroPoliza = await formatearRegistroPoliza(data);

  return {
    result: true,
    data: registroPoliza,
  };
}

async function validarTablaPoliza(driver) {
  await sleep(1500);

  // Esperar tablaPrincipal
  await waitForElement(driver, {
    locator: "tablaPrincipal",
    timeout: 3000,
    by: "id",
  });

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

async function publicURLToFiles(data = []) {
  if (data.length === 0) {
    return {
      result: false,
      error: "No se proporcionaron datos para procesar",
    };
  }
  const files = {};
  for (const item of data) {
    try {
      let tmpURL = await filePathToPublicUrl(item.ruta);
      item.url = tmpURL;
    } catch (error) {
      return {
        result: false,
        error: `Error descargando archivo ${item.nombre}: ${error.message}`,
      };
    }
  }
  return {
    result: true,
    data,
  };
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
      let nombreArchivo = archivo.nombre;
      
      // Formatear nombre para URLs públicas seguras
      nombreArchivo = nombreArchivo
        .replace(/\s+/g, '_')           // Reemplazar espacios con guiones bajos
        .replace(/[^\w\-_.]/g, '')      // Quitar caracteres especiales excepto guiones, puntos y guiones bajos
        .replace(/_{2,}/g, '_')         // Reemplazar múltiples guiones bajos con uno solo
        .replace(/^_+|_+$/g, '')        // Quitar guiones bajos al inicio y final
        .toLowerCase();                 // Convertir a minúsculas      

      const resultadoMerge = await mergePDFs({
        archivoOriginal: archivo.ruta,
        archivosMerge: rutaPlantilla,
        eliminarOriginal : true,
        newName : nombreArchivo
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
          archivoConError: archivo.nombre,
          indiceError: i,
          archivosExitosos: archivosExitosos.length,
          archivosRestantes: archivos.length - i - 1,
          detalleError: resultadoMerge
        };
      }

      // ✅ MERGE EXITOSO
      archivosExitosos.push({
        nombreOriginal: archivo.nombre,
        nombreFormateado: nombreArchivo,
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

async function handleCreateAsegurado(data) {
  let tmpAsegurado = {
    poliza_id: data.poliza_id,
    cliente_id: data.asegurado.id,
    rfc: data.asegurado.rfc,
    edad: calcularEdad(data.asegurado.fechaNacimiento),
    genero: data.asegurado.genero ? "Hombre" : "Mujer",
    nombre: data.asegurado.nombreCompleto,
    fechaNacimiento: data.asegurado.fechaNacimiento,
    direccion: data.asegurado.direccion,
    colonia: data.asegurado.colonia,
    codigoPostal: data.asegurado.codigoPostal,
    estado_id: data.asegurado.estado.id,
    ciudad: data.asegurado.municipio,
    correo: data.asegurado.correo,
    telefono: data.asegurado.telefono,
    celular: data.asegurado.celular,
    oficina: data.asegurado.celular,
  };

  const responseCotizacion = await createOrUpdate({
    tabla: "poliza_asegurados",
    data: tmpAsegurado,
  });
}

async function handleRegitroPoliza(data) {
  try {
    let registroPoliza = await formatearRegistroPoliza(data);

    const responsePoliza = await createOrUpdate({
      tabla: "polizas",
      data: { ...registroPoliza },
      returnResponse: true,
    });

    data.poliza_id = responsePoliza?.data?.id;

    const responseCotizacion = await createOrUpdate({
      tabla: "cotizaciones",
      data: { id: data.cotizacion.id, estatus: "Emitida" },
    });

    await createRecibos(data);

    await handleCreateAsegurado(data);

    return {
      result: true,
      message: "Póliza registrada exitosamente",
    };
  } catch (error) {
    console.error("Error en handleRegistroPoliza:", error);
    return {
      result: false,
      message: error.message,
    };
  }
}

async function formatearRegistroPoliza(data) {
  try {
    const frecuenciasPagoInBD = await getAllFrom("formas_de_pago", {
      label: data.cotizacion.detalles.frecuenciaPago,
    });

    // prettier-ignore
    let frecuenciaPagoId = frecuenciasPagoInBD.length == 1 ? frecuenciasPagoInBD[0].id : 1;

    let dataTmp = deepClone(data);

    dataTmp.detalles = dataTmp.cotizacion.detalles;
    dataTmp.carro = { ...dataTmp.carro, ...dataTmp.cotizacion.vehiculo };

    delete dataTmp.cliente;
    delete dataTmp.asegurado;
    delete dataTmp.carro.versiones;
    delete dataTmp.cotizacion;
    delete dataTmp.archivos;

    // prettier-ignore
    let tmp = {
    numeroPoliza:      data.numeroPoliza,
    frecuenciaPago_id: frecuenciaPagoId ?? '',
    cliente_id:        data.cliente.id,
    asegurado_id:      data.asegurado.id,
    subAgente_id:      data.agente_id,
    compania_id:       data.cotizacion.compania_id,
    cotizacion_id:     data.cotizacion.id,
    ramo_id:           data.cotizacion.ramo_id,
    producto_id:       data.cotizacion.companiaProducto_id,
    frecuencia:        data.cotizacion.detalles.frecuenciaPago,
    inicioVigencia:    data.cotizacion?.detalles?.inicioVigencia ?? '',
    finVigencia:       data.cotizacion?.detalles?.finVigencia ?? '',
    primaNeta:         extraerNumeroFlotante(data.cotizacion.detalles.primaNeta),
    primaTotal:        extraerNumeroFlotante(data.cotizacion.detalles.subtotal),
    pagoInicial:       extraerNumeroFlotante(data.cotizacion.detalles.primerPago),
    pagoSubsecuente:   extraerNumeroFlotante(data.cotizacion.detalles.pagoSubsecuente),
    financiamiento:    extraerNumeroFlotante(data.cotizacion.detalles.tasaFin),
    archivos:          JSON.stringify(data.archivos),
    subAgente_id:         data.agente_id,
    data:              JSON.stringify(dataTmp),
  };

    return tmp;
  } catch (error) {
    console.log("Error en formatearRegistroPoliza: ", error);
  }
}

async function createRecibos(data) {
  let frecuenciaPago = data.cotizacion.detalles.frecuenciaPago.toLowerCase();
  let fechaInicio = data.cotizacion.detalles.inicioVigencia ?? null;

  console.log("fechaInicio", fechaInicio);

  if (fechaInicio == null) {
    fechaInicio = now();

    fechaInicio = sumarFechas(fechaInicio, {
      operacion: "restar",
      dias: 1,
    });
  }

  let fechaFin = sumarFechas(fechaInicio, {
    formatoSalida: "DD/MM/YYYY",
    meses: 12,
  });
  console.log("fechaInicio", fechaInicio);
  console.log("fechaFin", fechaFin);

  let frecuencias = {
    anual: 1,
    contado: 1,
    semestral: 2,
    trimestral: 4,
    mensual: 12,
  };

  let aumentoFechas = {
    anual: 12,
    contado: 12,
    semestral: 6,
    trimestral: 3,
    mensual: 1,
  };

  let numeroRecibos = frecuencias[frecuenciaPago] || 1;

  let inicio = fechaInicio;
  for (let i = 0; i < numeroRecibos; i++) {
    // prettier-ignore
    let montoRecibo = i == 0 ? data.cotizacion.detalles.primerPago : data.cotizacion.detalles.pagoSubsecuente;

    montoRecibo = extraerNumeroFlotante(montoRecibo);

    let fechaInicioRecibo = inicio;

    let fechaFinRecibo = sumarFechas(fechaInicioRecibo, {
      formatoSalida: "DD/MM/YYYY",
      meses: aumentoFechas[frecuenciaPago],
    });

    let fechaVencimiento = sumarFechas(fechaInicioRecibo, {
      formatoSalida: "DD/MM/YYYY",
      dias: 14,
    });

    // prettier-ignore
    let reciboData = {
      poliza_id     : data.poliza_id,
      numeroRecibo  : (i + 1).toString().padStart(3, "0"),
      vencimiento   : fechaVencimiento,
      fechaInicio   : fechaInicioRecibo,
      fechaFin      : fechaFinRecibo,
      importe       : montoRecibo,
    };

    inicio = fechaFinRecibo;

    if (i == 0) {
      const responseCotizacion = await createOrUpdate({
        tabla: "polizas",
        data: {
          id: data.poliza_id,
          proximoPagoFecha: fechaInicio,
          proximoPagoMonto: montoRecibo,
        },
      });
    }

    const responseCotizacion = await createOrUpdate({
      tabla: "poliza_recibos",
      data: reciboData,
    });
  }
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
      const rutaCarpetaPolizas = obtenerRutaBackendFiles( "polizas","qualitas", numeroPoliza );

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

    // Redireccionar al buscador de cotiizaciones
    // prettier-ignore
    await driver.get("https://agentes360.qualitas.com.mx/group/guest/lista-de-cotizaciones");

    await buscarPoliza(driver, data);

    // Insertando datos del asegurado
    await insertarDatos(driver, data.asegurado, false);

    // Insertando datos del carro
    await insertandoDatosCarro(driver, data.carro);

    // Insertando datos del cliente
    await insertarDatos(driver, data.cliente, true);

    await sleep(2000);

    await clickElement(driver, {
      locator: "btnVigencia",
      sleeptime: 100,
    });

    await sleep(1000);
    await scrollToBottom(driver);

    await clickElement(driver, {
      locator: "btnEmision",
      sleeptime: 1000,
    });

    await handleProcesarArchivosPoliza(driver, data);

    await handleRegitroPoliza(data);

    return await formatearData(data);
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

async function handleReprocesarPoliza(data) {
  let driver;

  try {
    driver = await openPage("https://agentes360.qualitas.com.mx/", {
      headless: false,
    });

    await iniciarSesion(driver, data);

    await sleep(2000);

    await consultaPoliza(driver, data);

    await handleProcesarArchivosPoliza(driver, data);

    await handleRegitroPoliza(data);

    return await formatearData(data);
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
module.exports = { handleEmitirPoliza, handleReprocesarPoliza };
