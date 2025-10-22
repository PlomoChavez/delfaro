const {
  existeArchivo,
  eliminarArchivo,
  descomprimirArchivo,
} = require("../../utils/filesHelper");

// prettier-ignore
async function eliminarDocumentosNoDeseados(carpetaPath, options = {}) {
  const {
    verbose = true,
    patronesEliminar = ["Acuse-Poliza", "Carta de Bienvenida Poliza"],
    rutaPortadaCustom = null,
    generarReporte = true,
  } = options;

  if (verbose) {
    console.log(`🚀 Iniciando procesamiento completo de documentos`);
    console.log(`📁 Carpeta: ${carpetaPath}`);
  }

  try {
    // Extraer número de póliza del path
    const numeroPoliza = path.basename(carpetaPath).replace("poliza_", "");

    // Definir ruta de portada
    const rutaPortada =
      rutaPortadaCustom ||
      path.join(process.cwd(), "backend", "files", "plantillas", "Portada.pdf");

    if (verbose) {
      console.log(`🏷️ Número de póliza: ${numeroPoliza}`);
      console.log(`🎭 Portada: ${rutaPortada}`);
    }

    // PASO 1: Eliminar archivos no deseados
    if (verbose) {
      console.log(`\n📝 PASO 1: Eliminando archivos no deseados...`);
    }

    const resultadoEliminacion = await eliminarArchivosPorPatrones(
      carpetaPath,
      patronesEliminar,
      { verbose }
    );

    if (!resultadoEliminacion.result) {
      if (verbose) {
        console.log("❌ Error en la eliminación de archivos");
      }
      return {
        result: false,
        files: [],
        paso: "eliminacion",
        error: "Error eliminando archivos no deseados",
      };
    }

    // PASO 2: Procesar archivos restantes con portada
    if (verbose) {
      console.log(`\n📄 PASO 2: Procesando archivos con portada...`);
    }

    const resultadoProcesamiento = await procesarArchivosConPortada(
      carpetaPath,
      rutaPortada,
      patronesEliminar,
      { verbose }
    );

    if (!resultadoProcesamiento.result) {
      if (verbose) {
        console.log("❌ Error en el procesamiento con portada");
      }
      return {
        result: false,
        files: [],
        paso: "procesamiento",
        eliminacion: resultadoEliminacion,
        error: "Error procesando archivos con portada",
      };
    }

    // PASO 3: Guardar información de la póliza
    if (verbose) {
      console.log(`\n💾 PASO 3: Guardando información de póliza...`);
    }

    const resultadoGuardado = await guardarInformacionPoliza(
      numeroPoliza,
      resultadoEliminacion,
      resultadoProcesamiento,
      { verbose, generarReporte }
    );

    if (!resultadoGuardado.result) {
      if (verbose) {
        console.log("❌ Error guardando información de póliza");
      }
      return {
        result: false,
        files: [],
        paso: "guardado",
        eliminacion: resultadoEliminacion,
        procesamiento: resultadoProcesamiento,
        error: "Error guardando información de póliza",
      };
    }

    // RESULTADO FINAL EXITOSO
    if (verbose) {
      console.log(`\n🎉 ¡PROCESAMIENTO COMPLETADO EXITOSAMENTE!`);
    }

    return {
      result: true,
      files: resultadoGuardado.files,
      numeroPoliza,
      carpetaPath,
      eliminacion: resultadoEliminacion,
      procesamiento: resultadoProcesamiento,
      guardado: resultadoGuardado,
      resumen: resultadoGuardado.resumen,
    };
  } catch (error) {
    if (verbose) {
      console.log("❌ Error general en procesamiento:", error.message);
    }

    return {
      result: false,
      files: [],
      error: error.message,
      carpetaPath,
    };
  }
}

// prettier-ignore
async function descomprimirArchivoPoliza(rutaArchivoZip, numeroPoliza) {
  console.log("📦 Iniciando descompresión del archivo ZIP...");
  console.log("📁 Archivo origen:", rutaArchivoZip);

  try {
    // Verificar que el archivo ZIP existe usando filesHelper
    if (!existeArchivo(rutaArchivoZip, { logs: true })) {
      console.log(`❌ El archivo ZIP no existe: ${rutaArchivoZip}`);
      return false;
    }

    // Crear la ruta de destino
    const carpetaBase = path.join(process.cwd(), "backend", "files", "polizas");
    const carpetaPoliza = path.join(carpetaBase, `poliza_${numeroPoliza}`);

    console.log("📂 Carpeta destino:", carpetaPoliza);

    // Usar la función genérica de descompresión de filesHelper
    const resultadoDescompresion = descomprimirArchivo(
      rutaArchivoZip, 
      carpetaPoliza, 
      true // logs = true
    );

    if (!resultadoDescompresion.success) {
      console.log("❌ Error en la descompresión:", resultadoDescompresion.error);
      return false;
    }

    // Eliminar el archivo ZIP original usando filesHelper
    const resultadoEliminacion = eliminarArchivo(rutaArchivoZip, { logs: true });
    
    if (!resultadoEliminacion.success) {
      console.log("⚠️ No se pudo eliminar el archivo ZIP original:", resultadoEliminacion.error);
    }

    console.log("✅ Descompresión completada exitosamente");
    return true;

  } catch (error) {
    console.log("❌ Error descomprimiendo archivo:", error.message);
    return false;
  }
}

module.exports = {
  eliminarDocumentosNoDeseados,
  descomprimirArchivoPoliza,
};
