// Modelo de servicio de recetas.
// Centraliza todas las operaciones relacionadas con recetas:
// generación con IA, reconocimiento de ingredientes por imagen,
// guardado en base de datos, búsqueda y generación de imágenes.

import { supabase } from "@/integrations/supabase/client";
import { invokeFunction, fetchFunction } from "@/lib/edge-function-client";
import type { Recipe } from "@/lib/types";

/**
 * Envía una imagen en base64 a la Edge Function "recognize-ingredients"
 * para detectar los ingredientes visibles en ella con IA.
 * Devuelve un array de nombres de ingredientes detectados.
 */
export async function recognizeIngredientsFromImage(imageBase64: string, mimeType = "image/jpeg"): Promise<string[]> {
  const data = await invokeFunction("recognize-ingredients", { imageBase64, mimeType });
  if (data?.error) throw new Error(data.error);
  return data?.ingredients || [];
}

/**
 * Genera recetas personalizadas usando IA a partir de una lista de ingredientes.
 * Acepta filtros opcionales de país y categoría para ajustar los resultados.
 * Devuelve un array de recetas generadas por la IA.
 */
export async function generateRecipesFromAI(
  ingredients: string[],
  options?: {
    country?: string;
    category?: string;
    diet?: string;
    allergies?: string[];
    availableCountries?: string[];
    availableCategories?: string[];
    availableDiets?: string[];
  }
): Promise<Recipe[]> {
  const data = await invokeFunction("generate-recipes", {
    ingredients,
    country: options?.country,
    category: options?.category,
    diet: options?.diet,
    allergies: options?.allergies,
    availableCountries: options?.availableCountries,
    availableCategories: options?.availableCategories,
    availableDiets: options?.availableDiets,
  });
  if (data?.error) throw new Error(data.error);
  return data?.recipes || [];
}

/**
 * Genera una imagen para una receta usando IA.
 * Recibe el título de la receta y una consulta opcional para la imagen.
 * Devuelve la URL de la imagen generada, o null si falla.
 */
export async function generateRecipeImage(title: string, imageQuery?: string): Promise<string | null> {
  try {
    const data = await invokeFunction("generate-recipe-image", { title, imageQuery });
    if (data?.error) return null;
    return data?.image || null;
  } catch {
    // Si hay cualquier error, devuelve null en lugar de lanzar una excepción
    return null;
  }
}

/**
 * Resuelve el UUID de un registro del catálogo a partir de su valor string.
 * Devuelve null si no existe o está archivado.
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
 * Resuelve los IDs de catálogo (country_id, category_id, diet_id) antes de insertar
 * para mantener la integridad referencial con las tablas de catálogo.
 * Devuelve la receta con el ID asignado por la base de datos.
 */
export async function saveRecipe(userId: string, recipe: Recipe, diet?: string): Promise<Recipe> {
  // Resolver IDs del catálogo en paralelo
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
 * Actualiza la imagen de una receta existente en la base de datos.
 * Útil para asignar la imagen generada por IA después de guardar la receta.
 */
export async function updateRecipeImage(recipeId: string, image: string): Promise<void> {
  await supabase.from("recipes").update({ image }).eq("id", recipeId);
}

/**
 * Busca recetas en la base de datos aplicando filtros opcionales.
 * Soporta filtros de país, categoría, rango de calorías y paginación.
 * Llama a la Edge Function "search-recipes" con autenticación del usuario.
 * Devuelve el resultado en formato JSON con las recetas encontradas.
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

/**
 * Convierte un archivo de imagen (File) a base64, preservando el tipo MIME real del archivo.
 * Devuelve tanto el string base64 (sin prefijo) como el mimeType para enviarlo a la Edge Function.
 */
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [prefix, base64] = result.split(",");
      // Extrae el mimeType del prefijo "data:image/png;base64"
      const mimeType = prefix.split(":")[1]?.split(";")[0] || file.type || "image/jpeg";
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
