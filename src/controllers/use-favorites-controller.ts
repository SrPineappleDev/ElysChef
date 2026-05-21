// Controlador de favoritos.
// Gestiona el estado de las recetas favoritas del usuario, aplica los límites
// según el plan (máximo 10 en plan gratuito, ilimitados en VIP) y expone
// funciones para consultar y alternar favoritos.

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  fetchUserFavorites,
  addFavorite,
  removeFavorite,
} from "@/models/favorites-service";
import type { Recipe } from "@/lib/types";

/**
 * Hook que gestiona los favoritos del usuario autenticado.
 * Carga los favoritos al iniciar, aplica el límite según el plan
 * y expone funciones para consultar si una receta es favorita y alternarla.
 * Devuelve: favorites (lista), isFavorite (función), toggleFavorite (función), loading.
 */
export function useFavorites() {
  const { user, profile } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  // Set de IDs para consultas O(1) de si una receta está en favoritos
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const isVip = profile?.plan === "vip";
  const maxFavorites = isVip ? Infinity : 10;

  /**
   * Carga los favoritos del usuario desde la base de datos.
   * Si no hay usuario autenticado, limpia el estado y detiene la carga.
   */
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    const recipes = await fetchUserFavorites(user.id);
    setFavorites(recipes);
    // Construye el Set de IDs para búsquedas rápidas
    setFavoriteIds(new Set(recipes.map((r) => r.id)));
    setLoading(false);
  }, [user]);

  // Recarga los favoritos cada vez que cambia el usuario
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  /**
   * Comprueba si una receta está en favoritos por su ID.
   */
  const isFavorite = (id: string) => favoriteIds.has(id);

  /**
   * Alterna el estado de favorito de una receta.
   * Si ya es favorita, la elimina. Si no lo es, la añade (respetando el límite del plan).
   * Actualiza el estado local y muestra un toast con el resultado.
   */
  const toggleFavorite = async (recipe: Recipe) => {
    if (!user) return;

    if (isFavorite(recipe.id)) {
      // La receta ya es favorita: se elimina
      try {
        await removeFavorite(user.id, recipe.id);
        setFavorites((prev) => prev.filter((r) => r.id !== recipe.id));
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(recipe.id);
          return next;
        });
        toast.success("Eliminado de favoritos");
      } catch {
        toast.error("Error al eliminar favorito");
      }
    } else {
      // La receta no es favorita: se intenta añadir
      // Comprueba si el plan gratuito ha llegado al límite de favoritos
      if (!isVip && favorites.length >= maxFavorites) {
        toast.error(`Plan gratuito: máximo ${maxFavorites} favoritos. Cambia a VIP para ilimitados.`);
        return;
      }
      try {
        await addFavorite(user.id, recipe.id);
        setFavorites((prev) => [...prev, recipe]);
        setFavoriteIds((prev) => new Set(prev).add(recipe.id));
        toast.success("¡Guardado en favoritos!");
      } catch {
        toast.error("Error al guardar favorito");
      }
    }
  };

  return { favorites, isFavorite, toggleFavorite, loading };
}
