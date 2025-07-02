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

// prettier-ignore
export function isItemSelected(array: any[], item: any, key: string | null = null): boolean {
  if (!Array.isArray(array) || array.length === 0) return false;
  if (key === null) {
    return array.some(element => element === item);
  } else {
    return array.some(element => element && element[key] === item[key]);
  }
}

// prettier-ignore
export function toggleItemInArray(array: any[] = [], item: any, key: string | null = null) {
  array = Array.isArray(array) ? array : [];
  const index = key === null
    ? array.findIndex(element => element === item)
    : array.findIndex(element => element && element[key] === item[key]);

  if (index === -1) {
    array.push(item); // Agrega si no existe
  } else {
    array.splice(index, 1); // Elimina si existe
  }
  return array;
}
