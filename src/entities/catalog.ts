// Tipos de catálogo: subconjuntos de columnas de las tablas countries, categories y diets.
// Cada tipo selecciona solo los campos que necesitan la UI y los servicios.

import type { Tables } from "@/integrations/supabase/types";

export type CatalogCountry  = Pick<Tables<"countries">,  "id" | "name" | "archived">;
export type CatalogCategory = Pick<Tables<"categories">, "id" | "value" | "label" | "archived">;
export type CatalogDiet     = Pick<Tables<"diets">,      "id" | "value" | "label" | "archived">;
