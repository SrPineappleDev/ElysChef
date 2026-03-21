// Tipos e interfaces globales de la aplicación.
// Define las estructuras de datos principales: ingrediente, receta, categorías y países disponibles.

// Representa un ingrediente individual con su cantidad, unidad y calorías
export interface Ingredient {
  ingredient_name: string;
  quantity: number | string;
  unit: string;
  calories: number;
}

// Representa una receta completa con toda su información nutricional y de preparación
export interface Recipe {
  id: string;
  title: string;
  image: string;
  calories: number;
  time: string;
  servings: number;
  protein: string;
  carbs: string;
  fat: string;
  ingredients: string[];
  steps: string[];
  country?: string;       // País de origen de la receta (opcional)
  category?: string;      // Categoría de la receta (opcional)
  calories_per_ingredient?: Record<string, number>; // Calorías desglosadas por ingrediente
  imageQuery?: string;    // Término de búsqueda para generar la imagen con IA
}

// Tipo union con las categorías de receta disponibles
export type RecipeCategory = "desayuno" | "almuerzo" | "cena" | "postre" | "snack";

// Lista de categorías con su valor interno y etiqueta visible al usuario
export const CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
  { value: "postre", label: "Postre" },
  { value: "snack", label: "Snack" },
];

// Lista de países disponibles para filtrar recetas por origen
export const COUNTRIES = [
  "México", "España", "Italia", "Japón", "China", "India",
  "Francia", "Tailandia", "Perú", "Argentina", "Colombia",
  "Estados Unidos", "Grecia", "Marruecos", "Corea del Sur",
];
