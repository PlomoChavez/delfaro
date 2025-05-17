import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Función para formatear la fecha en un formato legible
export function formatearFechaHumana(fecha: string): string {
  const fechaObjeto = new Date(fecha);
  return format(fechaObjeto, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
}

// Función para calcular la diferencia de tiempo desde la fecha hasta ahora
export function calcularDiferenciaTiempo(fecha: string): string {
  const fechaObjeto = new Date(fecha);
  return formatDistanceToNow(fechaObjeto, { addSuffix: true, locale: es });
}
