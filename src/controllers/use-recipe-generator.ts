// Controlador del generador de recetas.
// Orquesta el flujo completo: recibe ingredientes (por texto o imagen),
// genera recetas con IA, las guarda en la base de datos y les asigna imágenes generadas.
// Aplica el límite de recetas según el plan del usuario (1 para free, 3 para VIP).

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { generateRecipesFromAI, generateRecipeImage } from "@/models/recipe-ai-service";
import { saveRecipe, updateRecipeImage } from "@/models/recipe-service";
import { fetchUserAllergies } from "@/models/allergy-service";
import { CREDITS } from "@/lib/credit-config";
import { fetchCountries, fetchCategories, fetchDiets } from "@/models/catalog-service";
import { useIngredientRecognition } from "@/controllers/use-ingredient-recognition";
import type { Recipe } from "@/lib/types";

export function useRecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("all");
  const [diet, setDiet] = useState("all");
  const [recipeCount, setRecipeCount] = useState<1 | 2 | 3>(1);
  const [userAllergyNames, setUserAllergyNames] = useState<string[]>([]);

  const { user, profile, refreshProfile } = useAuth();
  // Contador que identifica cada generación para evitar actualizar estado obsoleto (race condition)
  const generationIdRef = useRef(0);

  // Catálogos activos cacheados con React Query (stale 5 min, no se refetcha en cada mount)
  const { data: countriesData } = useQuery({ queryKey: ["catalog-countries"], queryFn: fetchCountries, staleTime: 5 * 60 * 1000 });
  const { data: categoriesData } = useQuery({ queryKey: ["catalog-categories"], queryFn: fetchCategories, staleTime: 5 * 60 * 1000 });
  const { data: dietsData } = useQuery({ queryKey: ["catalog-diets"], queryFn: fetchDiets, staleTime: 5 * 60 * 1000 });

  const activeCountries = countriesData?.map((c) => c.name) ?? [];
  const activeCategories = categoriesData?.map((c) => c.value) ?? [];
  const activeDiets = dietsData?.map((d) => d.value) ?? [];

  // Carga las alergias del usuario VIP al montar el componente
  useEffect(() => {
    if (profile?.plan !== "vip" || !profile?.id) return;
    fetchUserAllergies(profile.id)
      .then((list) => setUserAllergyNames(list.map((a) => a.name)))
      .catch(() => {});
  }, [profile?.plan, profile?.id]);

  const { isRecognizing, handleImageSelected } = useIngredientRecognition({
    profile,
    user,
    refreshProfile,
    onIngredientsDetected: setIngredients,
  });

  /**
   * Genera recetas usando IA a partir de los ingredientes y filtros actuales.
   * Flujo:
   * 1. Llama a la IA con los ingredientes y filtros seleccionados.
   * 2. Limita los resultados según el plan del usuario.
   * 3. Guarda cada receta en la base de datos (si hay sesión activa).
   * 4. Genera imágenes con IA para cada receta de forma paralela.
   * 5. Actualiza las imágenes en el estado y en la base de datos.
   */
  const handleGenerate = async () => {
    if (profile && profile.credits < CREDITS.COST_GENERATE) {
      toast.error(
        `Créditos insuficientes. Necesitas ${CREDITS.COST_GENERATE} créditos. Tienes ${profile.credits}.`,
        { description: "Recarga créditos en tu perfil." }
      );
      return;
    }

    // Incrementa el ID de generación para invalidar cualquier generación anterior en curso
    const generationId = ++generationIdRef.current;
    setIsLoading(true);
    try {
      setGenerationStep("Generando recetas con IA...");
      const filters = {
        country: country !== "all" ? country : undefined,
        category: category !== "all" ? category : undefined,
        diet: diet !== "all" ? diet : undefined,
        allergies: profile?.plan === "vip" && userAllergyNames.length > 0 ? userAllergyNames : undefined,
        availableCountries: activeCountries.length > 0 ? activeCountries : undefined,
        availableCategories: activeCategories.length > 0 ? activeCategories : undefined,
        availableDiets: activeDiets.length > 0 ? activeDiets : undefined,
      };
      const result = await generateRecipesFromAI({ ingredients, ...filters });

      // Limita el número de recetas: VIP usa recipeCount elegido, free siempre 1
      const effectiveCount = profile?.plan === "vip" ? recipeCount : 1;
      const limited = result.slice(0, effectiveCount);

      if (limited.length === 0) {
        toast.warning("No se pudieron generar recetas. Intenta con otros ingredientes.");
        setIsLoading(false);
        setGenerationStep(null);
        return;
      }

      setGenerationStep("Guardando recetas...");
      let savedRecipes: Recipe[];
      if (user) {
        savedRecipes = await Promise.all(limited.map((r) => saveRecipe(user.id, r, filters.diet)));
      } else {
        savedRecipes = limited;
      }

      if (profile && user) {
        await refreshProfile();
      }

      setRecipes(savedRecipes);

      setGenerationStep("Generando imágenes con IA...");
      const imagePromises = savedRecipes.map(async (r, idx) => {
        const image = await generateRecipeImage({ title: r.title, imageQuery: r.imageQuery });
        return { idx, image };
      });
      const images = await Promise.all(imagePromises);

      // Si el usuario lanzó una nueva generación mientras esta estaba en curso, se descarta
      if (generationId !== generationIdRef.current) return;

      setRecipes((prev) => {
        const updated = [...prev];
        for (const { idx, image } of images) {
          if (image && updated[idx]) {
            updated[idx] = { ...updated[idx], image };
          }
        }
        return updated;
      });

      if (user) {
        await Promise.all(
          images
            .filter(({ image, idx }) => image && savedRecipes[idx])
            .map(({ idx, image }) => updateRecipeImage(savedRecipes[idx].id, image!))
        );
      }

      setIsLoading(false);
      setGenerationStep(null);
    } catch (e: any) {
      toast.error(e.message || "Error al generar recetas");
      setIsLoading(false);
      setGenerationStep(null);
    }
  };

  return {
    ingredients,
    setIngredients,
    recipes,
    selected,
    setSelected,
    isLoading,
    generationStep,
    isRecognizing,
    country,
    setCountry,
    category,
    setCategory,
    diet,
    setDiet,
    profile,
    recipeCount,
    setRecipeCount,
    handleGenerate,
    handleImageSelected,
  };
}
