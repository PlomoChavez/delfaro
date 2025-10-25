function sumarFechas(fecha, options = {}) {
  // Destructurar options con valores por defecto
  const {
    meses = 0,
    dias = 0,
    años = 0,
    operacion = "sumar",
    formatoSalida = null,
  } = options;

  // Si fecha es null o undefined, usar la fecha actual
  let fechaObj;
  if (!fecha) {
    fechaObj = new Date(); // Fecha actual
  } else if (typeof fecha === "string") {
    // Intentar parsear diferentes formatos de fecha
    fechaObj = parsearFechaString(fecha);
  } else if (fecha instanceof Date) {
    fechaObj = new Date(fecha);
  } else {
    throw new Error("Formato de fecha no válido");
  }

  // Verificar que la fecha sea válida
  if (isNaN(fechaObj.getTime())) {
    throw new Error(`Fecha no válida: ${fecha}`);
  }

  // Determinar el multiplicador según la operación
  const multiplicador = operacion.toLowerCase() === "restar" ? -1 : 1;

  // Crear nueva fecha para no modificar la original
  const nuevaFecha = new Date(fechaObj);

  // Sumar/restar años
  if (años !== 0) {
    nuevaFecha.setFullYear(nuevaFecha.getFullYear() + años * multiplicador);
  }

  // Sumar/restar meses
  if (meses !== 0) {
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses * multiplicador);
  }

  // Sumar/restar días
  if (dias !== 0) {
    nuevaFecha.setDate(nuevaFecha.getDate() + dias * multiplicador);
  }

  // Si se especifica formato de salida, devolver string formateado
  if (formatoSalida) {
    return formatearFecha(nuevaFecha, formatoSalida);
  }

  // Por defecto devolver objeto Date
  return nuevaFecha;
}

// Nueva función para parsear diferentes formatos de fecha
function parsearFechaString(fechaStr) {
  // Intentar formato ISO primero (YYYY-MM-DD, etc.)
  let fecha = new Date(fechaStr);
  if (!isNaN(fecha.getTime())) {
    return fecha;
  }

  // Intentar formato DD/MM/YYYY
  const formatoDDMMYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const matchDDMM = fechaStr.match(formatoDDMMYYYY);
  if (matchDDMM) {
    const [, dia, mes, año] = matchDDMM;
    fecha = new Date(año, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
    if (!isNaN(fecha.getTime())) {
      return fecha;
    }
  }

  // Intentar formato DD-MM-YYYY
  const formatoDDMMYYYYGuion = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  const matchDDMMGuion = fechaStr.match(formatoDDMMYYYYGuion);
  if (matchDDMMGuion) {
    const [, dia, mes, año] = matchDDMMGuion;
    fecha = new Date(año, mes - 1, dia);
    if (!isNaN(fecha.getTime())) {
      return fecha;
    }
  }

  // Si ningún formato funciona, lanzar error
  throw new Error(`No se pudo parsear la fecha: ${fechaStr}`);
}

// Función auxiliar para formatear la fecha como string
function formatearFecha(fecha, formato = "YYYY-MM-DD") {
  if (!fecha || !(fecha instanceof Date)) {
    return null;
  }

  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  switch (formato.toLowerCase()) {
    case "yyyy-mm-dd":
      return `${año}-${mes}-${dia}`;
    case "dd/mm/yyyy":
      return `${dia}/${mes}/${año}`;
    case "mm/dd/yyyy":
      return `${mes}/${dia}/${año}`;
    case "dd-mm-yyyy":
      return `${dia}-${mes}-${año}`;
    default:
      return `${año}-${mes}-${dia}`;
  }
}

// Función para obtener la fecha y hora actual
function now(formatoSalida = null) {
  const fechaActual = new Date();

  // Si se especifica formato de salida, devolver string formateado
  if (formatoSalida) {
    // Si es formato de fecha simple, usar formatearFecha existente
    if (
      ["yyyy-mm-dd", "dd/mm/yyyy", "mm/dd/yyyy", "dd-mm-yyyy"].includes(
        formatoSalida.toLowerCase()
      )
    ) {
      return formatearFecha(fechaActual, formatoSalida);
    }

    // Para formatos con hora
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaActual.getDate()).padStart(2, "0");
    const horas = String(fechaActual.getHours()).padStart(2, "0");
    const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
    const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

    switch (formatoSalida.toLowerCase()) {
      case "yyyy-mm-dd hh:mm:ss":
        return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
      case "yyyy-mm-dd hh:mm":
        return `${año}-${mes}-${dia} ${horas}:${minutos}`;
      case "dd/mm/yyyy hh:mm:ss":
        return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
      case "dd/mm/yyyy hh:mm":
        return `${dia}/${mes}/${año} ${horas}:${minutos}`;
      case "iso":
        return fechaActual.toISOString();
      case "timestamp":
        return fechaActual.getTime().toString();
      default:
        return formatearFecha(fechaActual, formatoSalida);
    }
  }

  // Por defecto devolver objeto Date
  return fechaActual;
}

module.exports = {
  sumarFechas,
  formatearFecha,
  now,
  parsearFechaString,
};
