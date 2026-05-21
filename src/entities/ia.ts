// Tipos de dominio para las operaciones de IA.
// Define las estructuras de petición y respuesta de cada Edge Function de IA,
// así como el mapper que convierte la salida cruda de Groq al tipo Recipe de la aplicación.

import type { Recipe } from "@/lib/types";

// Receta tal como la devuelve la Edge Function generate-recipes (salida de Groq).
// Coincide con la estructura JSON definida en el system prompt.
// Se diferencia de Recipe en que no incluye `image`, que se obtiene después desde Pexels.
export interface AIRecipeRaw {
  id: string;
  title: string;
  description: string;
  country: string;
  category: string;
  diet: string;
  calories: number;
  time: string;
  servings: number;
  protein: string;
  carbs: string;
  fat: string;
  ingredients: string[];
  calories_per_ingredient: Record<string, number>;
  steps: string[];
  imageQuery: string;
}

// Cuerpo de petición enviado a la Edge Function generate-recipes
export interface AIGenerationRequest {
  ingredients: string[];
  country?: string;
  category?: string;
  diet?: string;
  allergies?: string[];
  availableCountries?: string[];
  availableCategories?: string[];
  availableDiets?: string[];
}

// Respuesta de la Edge Function generate-recipes
export interface AIGenerationResponse {
  recipes: AIRecipeRaw[];
  error?: string;
}

// Cuerpo de petición enviado a la Edge Function recognize-ingredients
export interface AIRecognitionRequest {
  imageBase64: string;
  mimeType: string;
}

// Respuesta de la Edge Function recognize-ingredients
export interface AIRecognitionResponse {
  ingredients: string[];
  error?: string;
}

// Cuerpo de petición enviado a la Edge Function generate-recipe-image
export interface AIImageRequest {
  title: string;
  imageQuery?: string;
}

// Respuesta de la Edge Function generate-recipe-image
export interface AIImageResponse {
  image: string | null;
  error?: string;
}

// Convierte una receta cruda de Groq al tipo Recipe del dominio.
// El campo `image` se inicializa vacío; el llamador es responsable de rellenarlo con generateRecipeImage.
export function aiRecipeRawToRecipe(raw: AIRecipeRaw): Recipe {
  return {
    id: raw.id,
    title: raw.title,
    image: "",
    calories: raw.calories,
    time: raw.time,
    servings: raw.servings,
    protein: raw.protein,
    carbs: raw.carbs,
    fat: raw.fat,
    ingredients: raw.ingredients,
    steps: raw.steps,
    country: raw.country,
    category: raw.category,
    diet: raw.diet,
    description: raw.description,
    calories_per_ingredient: raw.calories_per_ingredient,
    imageQuery: raw.imageQuery,
  };
}
