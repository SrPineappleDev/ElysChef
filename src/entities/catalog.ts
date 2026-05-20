import type { Tables } from "@/integrations/supabase/types";

export type CatalogCountry  = Pick<Tables<"countries">,  "id" | "name" | "archived">;
export type CatalogCategory = Pick<Tables<"categories">, "id" | "value" | "label" | "archived">;
export type CatalogDiet     = Pick<Tables<"diets">,      "id" | "value" | "label" | "archived">;
