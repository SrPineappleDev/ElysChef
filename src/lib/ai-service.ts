// Capa de compatibilidad para el servicio de IA.
// Re-exporta las funciones de recipe-service con sus nombres antiguos
// para no romper el código que ya las importa desde esta ruta.

// Legacy re-exports for backward compatibility
// New code should import from @/models/recipe-service directly
export {
  recognizeIngredientsFromImage as recognizeIngredients,
  generateRecipesFromAI as generateRecipes,
  generateRecipeImage,
  searchRecipes,
  fileToBase64,
} from "@/models/recipe-service";
