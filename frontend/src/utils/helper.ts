import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { isRef, toRaw } from "vue";

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

export function deepToRaw(obj: any): any {
  if (isRef(obj)) {
    return deepToRaw(obj.value);
  }
  if (Array.isArray(obj)) {
    return obj.map(deepToRaw);
  }
  if (obj !== null && typeof obj === "object") {
    const raw = toRaw(obj);
    const result: { [key: string]: any } = {};
    for (const key in raw) {
      result[key] = deepToRaw(raw[key]);
    }
    return result;
  }
  return obj;
}

/**
 * Valida si los elementos de un arreglo cumplen con reglas de existencia, tipo, igualdad, diferencia o no existencia de propiedades.
 *
 * Cada regla puede ser:
 *  - { key: string, tipoValidacion?: "existe" | "notExiste" | "tipo" | "igual" | "diferente", valor?: any }
 *    - tipoValidacion por defecto: "existe"
 *    - Si tipoValidacion es "tipo", valor debe ser el tipo esperado ("string", "number", etc.)
 *    - Si tipoValidacion es "igual" o "diferente", valor es el valor a comparar
 *    - Si tipoValidacion es "notExiste", valida que la propiedad NO exista
 *
 * @param arr - El arreglo a validar.
 * @param reglas - Array de reglas de validación.
 * @param estricto - Si es true, todos los elementos deben cumplir; si es false, basta con que uno cumpla.
 */

// prettier-ignore
export async function searchKeysInArray(
  arr: any[],
  reglas: {
    key: string;
    tipoValidacion?: "existe" | "notExiste" | "tipo" | "igual" | "diferente";
    valor?: any;
  }[],
  estricto: boolean = true
): Promise<boolean> {
  if (!Array.isArray(arr)) return false;

  const cumpleReglas = (item: any) =>
    reglas.every(regla => {
      const tipo = regla.tipoValidacion ?? "existe";
      switch (tipo) {
        case "existe":
          return Object.prototype.hasOwnProperty.call(item, regla.key);
        case "notExiste":
          return !Object.prototype.hasOwnProperty.call(item, regla.key);
        case "tipo":
          return Object.prototype.hasOwnProperty.call(item, regla.key) &&
            typeof item[regla.key] === regla.valor;
        case "igual":
          return Object.prototype.hasOwnProperty.call(item, regla.key) &&
            item[regla.key] === regla.valor;
        case "diferente":
          return Object.prototype.hasOwnProperty.call(item, regla.key) &&
            item[regla.key] !== regla.valor;
        default:
          // Autocompletado inteligente:
          if (regla.valor === undefined) {
            return Object.prototype.hasOwnProperty.call(item, regla.key);
          }
          if (typeof regla.valor === "string" || typeof regla.valor === "number" || typeof regla.valor === "boolean") {
            return Object.prototype.hasOwnProperty.call(item, regla.key) &&
              item[regla.key] === regla.valor;
          }
          return false;
      }
    });

  return estricto ? arr.every(cumpleReglas) : arr.some(cumpleReglas);
}

export function isEqual(obj1: any, obj2: any): boolean {
  // Compara objetos simples y anidados (shallow + deep)
  try {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  } catch {
    return false;
  }
}

export function diffObjects(obj1: any, obj2: any): any {
  obj1 = deepToRaw(obj1);
  obj2 = deepToRaw(obj2);

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    // Si son arrays, compara elemento por elemento y devuelve solo los nuevos valores
    const maxLength = Math.max(obj1.length, obj2.length);
    const nuevos: any[] = [];
    for (let i = 0; i < maxLength; i++) {
      if (!isEqual(obj1[i], obj2[i])) {
        nuevos.push(obj1[i]);
      }
    }
    return nuevos;
  } else if (
    typeof obj1 === "object" &&
    typeof obj2 === "object" &&
    obj1 &&
    obj2
  ) {
    const nuevos: Record<string, any> = {};
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    keys.forEach((key) => {
      if (!isEqual(obj1[key], obj2[key])) {
        nuevos[key] = obj1[key];
      }
    });
    return nuevos;
  } else {
    // Si son primitivos
    return isEqual(obj1, obj2) ? null : obj1;
  }
}
