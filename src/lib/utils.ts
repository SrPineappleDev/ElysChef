// Utilidades generales de la aplicación.
// Contiene funciones de ayuda reutilizables en cualquier componente.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS de forma inteligente.
 * Usa clsx para manejar clases condicionales y twMerge para resolver
 * conflictos entre clases de Tailwind CSS.
 * Devuelve el string de clases resultante.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
