import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { searchRecipes, deleteRecipeAsAdmin } from "@/models/recipe-service";
import { fetchCountries, fetchCategories, fetchDiets } from "@/models/catalog-service";
import { useFavorites } from "@/controllers/use-favorites-controller";
import type { CatalogCountry, CatalogCategory, CatalogDiet } from "@/entities/catalog";

export interface ExploreFilters {
  title: string;
  country: string;
  category: string;
  diet: string;
  min_calories: number;
  max_calories: number;
}

function buildSearchParams(f: ExploreFilters, page: number) {
  return {
    title: f.title || undefined,
    country: f.country || undefined,
    category: f.category || undefined,
    diet: f.diet || undefined,
    min_calories: f.min_calories > 0 ? f.min_calories : undefined,
    max_calories: f.max_calories > 0 && f.max_calories < 99999 ? f.max_calories : undefined,
    page,
    limit: 12,
  };
}

export function useExploreController() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [submittedFilters, setSubmittedFilters] = useState<ExploreFilters | null>(null);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [countries, setCountries] = useState<CatalogCountry[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [diets, setDiets] = useState<CatalogDiet[]>([]);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    Promise.all([fetchCountries(), fetchCategories(), fetchDiets()])
      .then(([c, cat, d]) => { setCountries(c); setCategories(cat); setDiets(d); })
      .catch(() => toast.error("Error cargando catálogos"));
  }, []);

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["explore", submittedFilters, page],
    queryFn: () => searchRecipes(buildSearchParams(submittedFilters!, page)),
    enabled: submittedFilters !== null,
    staleTime: 2 * 60 * 1000,
  });

  // Prefetch next page while viewing the current one
  useEffect(() => {
    if (!submittedFilters || !data) return;
    const nextPage = page + 1;
    if (nextPage > (data.pagination?.total_pages ?? 0)) return;
    queryClient.prefetchQuery({
      queryKey: ["explore", submittedFilters, nextPage],
      queryFn: () => searchRecipes(buildSearchParams(submittedFilters, nextPage)),
      staleTime: 2 * 60 * 1000,
    });
  }, [data, page, submittedFilters, queryClient]);

  const applyFilters = useCallback((newFilters: ExploreFilters) => {
    setSubmittedFilters(newFilters);
    setPage(1);
  }, []);

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const deleteRecipe = useCallback(async (recipeId: string) => {
    if (!isAdmin) return;
    setDeletingId(recipeId);
    try {
      await deleteRecipeAsAdmin(recipeId);
      queryClient.invalidateQueries({ queryKey: ["explore"] });
      toast.success("Receta eliminada");
    } catch {
      toast.error("Error al eliminar la receta");
    } finally {
      setDeletingId(null);
    }
  }, [isAdmin, queryClient]);

  return {
    hasSearched: submittedFilters !== null,
    results: data?.data ?? [],
    loading: submittedFilters !== null && (isPending || isFetching),
    page,
    totalPages: data?.pagination?.total_pages ?? 0,
    total: data?.pagination?.total ?? 0,
    countries,
    categories,
    diets,
    isAdmin,
    isFavorite,
    toggleFavorite,
    applyFilters,
    changePage,
    deleteRecipe,
    deletingId,
  };
}
