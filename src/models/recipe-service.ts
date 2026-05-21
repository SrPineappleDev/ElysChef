// Servicio de persistencia de recetas.
// Gestiona exclusivamente las operaciones de base de datos sobre la tabla recipes:
// guardado, actualización de imagen y búsqueda con filtros.
// Las operaciones de generación con IA están en recipe-ai-service.ts.

import { supabase } from "@/integrations/supabase/client";
import { fetchFunction } from "@/lib/edge-function-client";
import type { Recipe } from "@/lib/types";

/**
 * Resuelve el UUID de un registro del catálogo a partir de su valor string.
 * Devuelve null si el valor está vacío, no existe o está archivado.
 */
async function resolveCatalogId(table: "countries" | "categories" | "diets", field: "name" | "value", value: string): Promise<string | null> {
  if (!value) return null;
  const { data } = await supabase
    .from(table)
    .select("id")
    .eq(field, value)
    .eq("archived", false)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Guarda una receta en la base de datos asociada al usuario.
 * Resuelve en paralelo los UUIDs de catálogo (country_id, category_id, diet_id)
 * para mantener la integridad referencial antes de insertar.
 * Devuelve la receta con el ID asignado por la base de datos.
 */
export async function saveRecipe(userId: string, recipe: Recipe, diet?: string): Promise<Recipe> {
  const effectiveDiet = diet || recipe.diet || "";

  const [country_id, category_id, diet_id] = await Promise.all([
    resolveCatalogId("countries", "name", recipe.country || ""),
    resolveCatalogId("categories", "value", recipe.category || ""),
    resolveCatalogId("diets", "value", effectiveDiet),
  ]);

  const { data } = await supabase.from("recipes").insert({
    user_id: userId,
    title: recipe.title,
    description: recipe.description || "",
    image: recipe.image || "",
    calories: recipe.calories,
    time: recipe.time,
    servings: recipe.servings,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    ingredients: recipe.ingredients as any,
    steps: recipe.steps as any,
    country: recipe.country || "",
    category: recipe.category || "",
    diet: effectiveDiet,
    country_id,
    category_id,
    diet_id,
    calories_per_ingredient: (recipe.calories_per_ingredient || {}) as any,
  }).select().single();

  return data ? { ...recipe, id: data.id } : recipe;
}

/**
 * Actualiza la URL de imagen de una receta existente en la base de datos.
 * Se usa después de obtener la imagen desde Pexels para asociarla a la receta guardada.
 */
export async function updateRecipeImage(recipeId: string, image: string): Promise<void> {
  await supabase.from("recipes").update({ image }).eq("id", recipeId);
}

/**
 * Busca recetas en la base de datos aplicando filtros opcionales de país, categoría,
 * rango de calorías y paginación. Delega la consulta a la Edge Function search-recipes
 * autenticada con el token de sesión del usuario.
 */
export async function searchRecipes(params: {
  country?: string;
  category?: string;
  min_calories?: number;
  max_calories?: number;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.country) query.set("country", params.country);
  if (params.category) query.set("category", params.category);
  if (params.min_calories) query.set("min_calories", String(params.min_calories));
  if (params.max_calories) query.set("max_calories", String(params.max_calories));
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const session = (await supabase.auth.getSession()).data.session;
  return fetchFunction(`search-recipes?${query.toString()}`, session?.access_token ?? "");
}
