// Funciones de utilidad generales reutilizables en cualquier componente.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS resolviendo conflictos de Tailwind mediante twMerge
 * y gestionando clases condicionales mediante clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
