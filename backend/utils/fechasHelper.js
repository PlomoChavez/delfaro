const moment = require("moment"); // Asegúrate de usar moment.js o una librería similar
function sumarFechas(
  fecha,
  { formatoSalida, años = 0, meses = 0, dias = 0, operacion = "sumar" }
) {
  // Convertir la fecha a un objeto moment con el formato explícito
  let fechaMoment = moment(fecha, "DD/MM/YYYY", true);

  if (!fechaMoment.isValid()) {
    throw new Error(`La fecha proporcionada no es válida: ${fecha}`);
  }

  // Realizar la operación (sumar o restar)
  if (operacion === "sumar") {
    fechaMoment = fechaMoment
      .add(años, "years")
      .add(meses, "months")
      .add(dias, "days");
  } else if (operacion === "restar") {
    fechaMoment = fechaMoment
      .subtract(años, "years")
      .subtract(meses, "months")
      .subtract(dias, "days");
  } else {
    throw new Error(
      `Operación no válida: ${operacion}. Usa "sumar" o "restar".`
    );
  }

  // Retornar la fecha en el formato deseado
  return formatoSalida
    ? fechaMoment.format(formatoSalida)
    : fechaMoment.toISOString();
}

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();

  // Ajustar la edad si el cumpleaños aún no ha ocurrido este año
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  return edad;
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
  calcularEdad,
  parsearFechaString,
};
