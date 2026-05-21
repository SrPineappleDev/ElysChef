// Servicio de IA para recetas.
// Centraliza las llamadas a las Edge Functions de generación de recetas,
// reconocimiento de ingredientes por imagen y búsqueda de imagen para cada receta.
// Utiliza los tipos de dominio definidos en entities/ia.ts para tipar todas las peticiones y respuestas.

import { invokeFunction } from "@/lib/edge-function-client";
import type { Recipe } from "@/lib/types";
import type {
  AIGenerationRequest,
  AIGenerationResponse,
  AIRecognitionRequest,
  AIRecognitionResponse,
  AIImageRequest,
  AIImageResponse,
} from "@/entities/ia";
import { aiRecipeRawToRecipe } from "@/entities/ia";

/**
 * Envía los ingredientes y filtros a la Edge Function generate-recipes para obtener recetas generadas por IA.
 * Convierte cada receta cruda de Groq al tipo Recipe mediante aiRecipeRawToRecipe.
 */
export async function generateRecipesFromAI(req: AIGenerationRequest): Promise<Recipe[]> {
  const data: AIGenerationResponse = await invokeFunction("generate-recipes", req);
  if (data?.error) throw new Error(data.error);
  return (data?.recipes ?? []).map(aiRecipeRawToRecipe);
}

/**
 * Envía una imagen en base64 a la Edge Function recognize-ingredients
 * para detectar los ingredientes visibles en ella con IA.
 * Devuelve un array con los nombres de los ingredientes detectados.
 */
export async function recognizeIngredientsFromImage(req: AIRecognitionRequest): Promise<string[]> {
  const data: AIRecognitionResponse = await invokeFunction("recognize-ingredients", req);
  if (data?.error) throw new Error(data.error);
  return data?.ingredients ?? [];
}

/**
 * Solicita a la Edge Function generate-recipe-image una imagen representativa para la receta,
 * buscando en Pexels con el título y la consulta de imagen opcionales.
 * Devuelve la URL de la imagen o null si no se encuentra ninguna o hay un error.
 */
export async function generateRecipeImage(req: AIImageRequest): Promise<string | null> {
  try {
    const data: AIImageResponse = await invokeFunction("generate-recipe-image", req);
    if (data?.error) return null;
    return data?.image ?? null;
  } catch {
    return null;
  }
}

/**
 * Convierte un archivo de imagen (File) a base64 preservando el tipo MIME real del archivo.
 * Devuelve el string base64 (sin prefijo data URI) y el mimeType para enviarlos a la Edge Function.
 */
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [prefix, base64] = result.split(",");
      const mimeType = prefix.split(":")[1]?.split(";")[0] || file.type || "image/jpeg";
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
