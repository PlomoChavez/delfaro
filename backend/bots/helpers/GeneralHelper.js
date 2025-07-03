function convertirFechaHora(fechaHoraStr) {
  // Ejemplo de entrada: "01-07-2025 / 02:47:31 pm"
  const [fecha, hora, ampm] = fechaHoraStr.replace(" / ", " ").split(/[\s:]+/);

  const [dia, mes, anio] = fecha.split("-").map(Number);

  let horas = Number(hora);
  let minutos = Number(arguments[2]);
  let segundos = Number(arguments[3]);
  let periodo = arguments[4] || ampm;

  // Extrae hora, minutos, segundos y am/pm
  const match = fechaHoraStr.match(
    /(\d{2})-(\d{2})-(\d{4}) \/ (\d{2}):(\d{2}):(\d{2}) (am|pm)/i
  );
  if (!match) throw new Error("Formato de fecha/hora inválido");

  const [, d, m, y, h, min, s, ap] = match;
  let hour = Number(h);
  if (ap.toLowerCase() === "pm" && hour !== 12) hour += 12;
  if (ap.toLowerCase() === "am" && hour === 12) hour = 0;

  // Formato ISO con zona horaria -06:00
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${String(
    hour
  ).padStart(2, "0")}:${min}:${s}-06:00`;
}

function normalizarKey(key) {
  return key
    .normalize("NFD") // Quita acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\.\(\)%]/g, "") // Quita espacios, puntos, paréntesis y %
    .replace(/[^a-zA-Z0-9]/g, "") // Quita cualquier otro caracter especial
    .toLowerCase();
}

module.exports = {
  normalizarKey,
  convertirFechaHora,
};
