// Servicio de favoritos.
// Gestiona las operaciones de lectura, adición y eliminación de recetas favoritas
// del usuario en la base de datos de Supabase.

import { supabase } from "@/integrations/supabase/client";
import type { Recipe } from "@/lib/types";
import { rowToRecipe, type RecipeRow } from "@/entities/recipe";

/**
 * Obtiene todas las recetas favoritas de un usuario.
 * Realiza un join entre las tablas "favorites" y "recipes" para devolver
 * los datos completos de cada receta guardada.
 * Devuelve un array de recetas (vacío si no hay favoritos).
 */
export async function fetchUserFavorites(userId: string): Promise<Recipe[]> {
  const { data } = await supabase
    .from("favorites")
    .select("recipe_id, recipes(*)")
    .eq("user_id", userId);

  if (!data) return [];

  return data
    .filter((f: { recipes: RecipeRow | null }) => f.recipes)
    .map((f: { recipes: RecipeRow | null }) => rowToRecipe(f.recipes!));
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

/**
 * Recorta los favoritos del usuario al límite indicado, eliminando los más recientes.
 * Mantiene los primeros `limit` favoritos ordenados por fecha de creación (los más antiguos).
 * Se usa al hacer downgrade de VIP a gratuito cuando el usuario supera el límite de 10.
 */
export async function trimFavoritesToLimit(userId: string, limit: number): Promise<void> {
  const { data } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!data || data.length <= limit) return;

  const toRemove = data.slice(limit).map((f: any) => f.recipe_id);
  for (const recipeId of toRemove) {
    await removeFavorite(userId, recipeId);
  }
}
