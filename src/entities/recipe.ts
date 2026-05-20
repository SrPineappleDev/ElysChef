import type { Tables } from "@/integrations/supabase/types";
import type { Recipe } from "@/lib/types";

export type RecipeRow = Tables<"recipes">;

export function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    image: row.image ?? "",
    calories: row.calories ?? 0,
    time: row.time ?? "",
    servings: row.servings ?? 1,
    protein: row.protein ?? "",
    carbs: row.carbs ?? "",
    fat: row.fat ?? "",
    ingredients: (row.ingredients as string[]) ?? [],
    steps: (row.steps as string[]) ?? [],
    country: row.country ?? undefined,
    category: row.category ?? undefined,
    diet: row.diet ?? undefined,
    description: row.description ?? undefined,
    calories_per_ingredient: (row.calories_per_ingredient as Record<string, number>) ?? undefined,
  };
}
