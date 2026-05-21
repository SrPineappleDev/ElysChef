// Contratos e interfaces del servicio de IA.
// Aplica ISP (Interface Segregation Principle): define interfaces separadas para que
// cada consumidor dependa solo de las operaciones que realmente utiliza.
// También re-exporta las implementaciones concretas desde recipe-ai-service para compatibilidad.

import type { Recipe } from "@/lib/types";
import type { AIGenerationRequest, AIImageRequest, AIRecognitionRequest } from "@/entities/ia";

// Contrato para el servicio de generación de recetas e imágenes con IA
export interface IRecipeAIService {
  generateRecipesFromAI(req: AIGenerationRequest): Promise<Recipe[]>;
  generateRecipeImage(req: AIImageRequest): Promise<string | null>;
}

// Contrato para el servicio de reconocimiento de ingredientes por imagen
export interface IRecognitionAIService {
  recognizeIngredientsFromImage(req: AIRecognitionRequest): Promise<string[]>;
  fileToBase64(file: File): Promise<{ base64: string; mimeType: string }>;
}

// Re-exporta las implementaciones concretas — el código nuevo debe importar desde @/models/recipe-ai-service
export {
  generateRecipesFromAI,
  generateRecipeImage,
  recognizeIngredientsFromImage,
  fileToBase64,
} from "@/models/recipe-ai-service";

export { searchRecipes } from "@/models/recipe-service";
