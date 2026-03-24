// Controlador del generador de recetas.
// Orquesta el flujo completo: recibe ingredientes (por texto o imagen),
// genera recetas con IA, las guarda en la base de datos y les asigna imágenes generadas.
// Aplica el límite de recetas según el plan del usuario (1 para free, 3 para VIP).

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  recognizeIngredientsFromImage,
  generateRecipesFromAI,
  generateRecipeImage,
  saveRecipe,
  updateRecipeImage,
  fileToBase64,
} from "@/models/recipe-service";
import { deductCredits } from "@/models/profile-service";
import type { Recipe } from "@/lib/types";

/**
 * Controller: Recipe Generator
 * Orchestrates recipe generation flow (ingredients → AI → save → images)
 */

/**
 * Hook que gestiona el estado y la lógica del generador de recetas.
 * Devuelve los ingredientes, recetas generadas, receta seleccionada,
 * estados de carga, filtros y las funciones para generar recetas y analizar imágenes.
 */
export function useRecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);       // Generación de recetas en curso
  const [isRecognizing, setIsRecognizing] = useState(false); // Reconocimiento de imagen en curso
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("all");
  const { user, profile, refreshProfile } = useAuth();
  // Contador que identifica cada generación para evitar actualizar estado obsoleto (race condition)
  const generationIdRef = useRef(0);

  // Número de recetas a generar: solo VIP puede elegir entre 1-3; free siempre 1
  const [recipeCount, setRecipeCount] = useState<1 | 2 | 3>(1);

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
    // Guard de créditos: generar recetas cuesta 50 créditos
    if (profile && profile.credits < 50) {
      toast.error(`Créditos insuficientes. Necesitas 50 créditos. Tienes ${profile.credits}.`, {
        description: "Recarga créditos en tu perfil.",
      });
      return;
    }

    // Incrementa el ID de generación para invalidar cualquier generación anterior en curso
    const generationId = ++generationIdRef.current;
    setIsLoading(true);
    try {
      // Prepara los filtros, ignorando el valor "all" (sin filtro)
      const filters = {
        country: country !== "all" ? country : undefined,
        category: category !== "all" ? category : undefined,
      };
      const result = await generateRecipesFromAI(ingredients, filters);

      // Limita el número de recetas: VIP usa recipeCount elegido, free siempre 1
      const effectiveCount = profile?.plan === "vip" ? recipeCount : 1;
      const limited = result.slice(0, effectiveCount);

      // Guarda las recetas en la base de datos si el usuario está autenticado
      let savedRecipes: Recipe[] = [];
      if (user) {
        for (const r of limited) {
          const saved = await saveRecipe(user.id, r);
          savedRecipes.push(saved);
        }
      } else {
        savedRecipes = limited;
      }

      // Deduce créditos tras llamada exitosa a la IA
      if (profile && user) {
        await deductCredits(profile.id, 50, profile.credits);
        await refreshProfile();
      }

      setRecipes(savedRecipes);
      setIsLoading(false);

      // Avisa si no se generaron recetas
      if (limited.length === 0) {
        toast.warning("No se pudieron generar recetas. Intenta con otros ingredientes.");
        return;
      }

      // Genera las imágenes de todas las recetas en paralelo
      toast.info("Generando imágenes con IA...");
      const imagePromises = savedRecipes.map(async (r, idx) => {
        const image = await generateRecipeImage(r.title, r.imageQuery);
        return { idx, image };
      });
      const images = await Promise.all(imagePromises);

      // Si el usuario lanzó una nueva generación mientras esta estaba en curso, se descarta
      if (generationId !== generationIdRef.current) return;

      // Actualiza el estado con las imágenes generadas
      setRecipes((prev) => {
        const updated = [...prev];
        for (const { idx, image } of images) {
          if (image && updated[idx]) {
            updated[idx] = { ...updated[idx], image };
          }
        }
        return updated;
      });

      // Persiste las imágenes generadas en la base de datos
      if (user) {
        for (const { idx, image } of images) {
          if (image && savedRecipes[idx]) {
            await updateRecipeImage(savedRecipes[idx].id, image);
          }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Error al generar recetas");
      setIsLoading(false);
    }
  };

  /**
   * Maneja la selección de una imagen para detectar ingredientes con IA.
   * Convierte el archivo a base64, lo envía a la IA y actualiza la lista
   * de ingredientes con los detectados. Muestra el resultado con toasts.
   */
  const handleImageSelected = async (file: File, _preview: string) => {
    // Guard de créditos: analizar imagen cuesta 25 créditos
    if (profile && profile.credits < 25) {
      toast.error(`Créditos insuficientes. Necesitas 25 créditos. Tienes ${profile.credits}.`, {
        description: "Recarga créditos en tu perfil.",
      });
      return;
    }

    setIsRecognizing(true);
    try {
      // Convierte la imagen a base64 para enviarla a la Edge Function
      const base64 = await fileToBase64(file);
      const detected = await recognizeIngredientsFromImage(base64);

      // Deduce créditos tras análisis exitoso
      if (profile && user) {
        await deductCredits(profile.id, 25, profile.credits);
        await refreshProfile();
      }

      if (detected.length > 0) {
        setIngredients(detected);
        toast.success(`${detected.length} ingredientes detectados`);
      } else {
        toast.warning("No se detectaron ingredientes. Intenta con otra imagen.");
      }
    } catch (e: any) {
      toast.error(e.message || "Error al analizar la imagen");
    } finally {
      setIsRecognizing(false);
    }
  };

  return {
    ingredients,
    setIngredients,
    recipes,
    selected,
    setSelected,
    isLoading,
    isRecognizing,
    country,
    setCountry,
    category,
    setCategory,
    profile,
    recipeCount,
    setRecipeCount,
    handleGenerate,
    handleImageSelected,
  };
}
