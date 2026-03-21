// Modelo de servicio de recetas.
// Centraliza todas las operaciones relacionadas con recetas:
// generación con IA, reconocimiento de ingredientes por imagen,
// guardado en base de datos, búsqueda y generación de imágenes.

import { supabase } from "@/integrations/supabase/client";
import type { Recipe } from "@/lib/types";

/**
 * Model: Recipe Service
 * Handles all recipe-related data operations (CRUD + AI generation)
 */

// Clave pública de Supabase para autenticar las llamadas a Edge Functions
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// URL base de las Edge Functions del proyecto
const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

/**
 * Función interna para invocar una Edge Function de Supabase mediante POST.
 * Recibe el nombre de la función y el cuerpo de la petición.
 * Devuelve la respuesta en formato JSON o lanza un error si la petición falla.
 */
async function invokeFunction(name: string, body: unknown) {
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${name}`);
  return res.json();
}

/**
 * Envía una imagen en base64 a la Edge Function "recognize-ingredients"
 * para detectar los ingredientes visibles en ella con IA.
 * Devuelve un array de nombres de ingredientes detectados.
 */
export async function recognizeIngredientsFromImage(imageBase64: string): Promise<string[]> {
  const data = await invokeFunction("recognize-ingredients", { imageBase64 });
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
  options?: { country?: string; category?: string }
): Promise<Recipe[]> {
  const data = await invokeFunction("generate-recipes", {
    ingredients,
    country: options?.country,
    category: options?.category,
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
 * Guarda una receta en la base de datos asociada al usuario.
 * Inserta todos los campos de la receta en la tabla "recipes".
 * Devuelve la receta con el ID asignado por la base de datos.
 */
export async function saveRecipe(userId: string, recipe: Recipe): Promise<Recipe> {
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
    calories_per_ingredient: (recipe.calories_per_ingredient || {}) as any,
  }).select().single();

  // Si la inserción devuelve datos, actualiza el ID de la receta con el generado por la BD
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
  // Construye los parámetros de la URL de búsqueda
  const query = new URLSearchParams();
  if (params.country) query.set("country", params.country);
  if (params.category) query.set("category", params.category);
  if (params.min_calories) query.set("min_calories", String(params.min_calories));
  if (params.max_calories) query.set("max_calories", String(params.max_calories));
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/search-recipes?${query.toString()}`;

  // Obtiene el token de sesión activo para autenticar la petición
  const session = (await supabase.auth.getSession()).data.session;
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${session?.access_token || ""}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!res.ok) throw new Error("Error al buscar recetas");
  return res.json();
}

/**
 * Convierte un archivo de imagen (File) a una cadena base64.
 * Lee el archivo con FileReader y extrae solo la parte de datos (sin el prefijo data:...).
 * Devuelve una promesa que resuelve con el string base64.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Elimina el prefijo "data:image/...;base64," para obtener solo los datos
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
