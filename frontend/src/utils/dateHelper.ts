export async function getFechaAMPM() {
  const ahora = new Date();
  let horas = ahora.getHours();
  const minutos = ahora.getMinutes().toString().padStart(2, "0");
  const segundos = ahora.getSeconds().toString().padStart(2, "0");
  const ampm = horas >= 12 ? "PM" : "AM";
  horas = horas % 12;
  horas = horas ? horas : 12; // El 0 se muestra como 12

  const dia = ahora.getDate().toString().padStart(2, "0");
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
  const anio = ahora.getFullYear();

  return `${dia}-${mes}-${anio} / ${horas}:${minutos}:${segundos} ${ampm}`;
}
