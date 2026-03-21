// Modelo de servicio de favoritos.
// Contiene las funciones para leer, añadir y eliminar recetas favoritas
// del usuario en la base de datos de Supabase.

import { supabase } from "@/integrations/supabase/client";
import type { Recipe } from "@/lib/types";

/**
 * Model: Favorites Service
 * Handles favorites data operations
 */

/**
 * Obtiene todas las recetas favoritas de un usuario.
 * Hace un join entre la tabla "favorites" y "recipes" para devolver
 * los datos completos de cada receta guardada.
 * Devuelve un array de recetas (vacío si no hay favoritos).
 */
export async function fetchUserFavorites(userId: string): Promise<Recipe[]> {
  const { data } = await supabase
    .from("favorites")
    .select("recipe_id, recipes(*)")
    .eq("user_id", userId);

  if (!data) return [];

  // Filtra registros sin receta asociada y mapea los datos al tipo Recipe
  return data
    .filter((f: any) => f.recipes)
    .map((f: any) => {
      const r = f.recipes;
      return {
        id: r.id,
        title: r.title,
        image: r.image || "",
        calories: r.calories || 0,
        time: r.time || "",
        servings: r.servings || 1,
        protein: r.protein || "",
        carbs: r.carbs || "",
        fat: r.fat || "",
        ingredients: (r.ingredients as string[]) || [],
        steps: (r.steps as string[]) || [],
        country: (r as any).country || "",
        category: (r as any).category || "",
        calories_per_ingredient: (r as any).calories_per_ingredient || {},
      };
    });
}

/**
 * Añade una receta a los favoritos del usuario.
 * Inserta un registro en la tabla "favorites" con el ID del usuario y el de la receta.
 * Lanza un error si la inserción falla.
 */
export async function addFavorite(userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, recipe_id: recipeId });
  if (error) throw error;
}

/**
 * Elimina una receta de los favoritos del usuario.
 * Borra el registro de "favorites" que coincida con el usuario y la receta.
 * Lanza un error si la eliminación falla.
 */
export async function removeFavorite(userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);
  if (error) throw error;
}
