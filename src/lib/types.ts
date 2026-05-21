// Tipos globales y constantes estáticas de la aplicación.
// Define las estructuras de datos principales: Recipe, Ingredient,
// y las listas semilla de categorías, países y dietas.

export interface Ingredient {
  ingredient_name: string;
  quantity: number | string;
  unit: string;
  calories: number;
}

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
  country?: string;
  category?: string;
  diet?: string;
  description?: string;
  calories_per_ingredient?: Record<string, number>;
  imageQuery?: string; // Término de búsqueda para obtener la imagen de la receta desde Pexels
}

export type RecipeCategory = "desayuno" | "almuerzo" | "cena" | "postre" | "snack";

export const CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
  { value: "postre", label: "Postre" },
  { value: "snack", label: "Snack" },
];

export const COUNTRIES = [
  "México", "España", "Italia", "Japón", "China", "India",
  "Francia", "Tailandia", "Perú", "Argentina", "Colombia",
  "Estados Unidos", "Grecia", "Marruecos", "Corea del Sur",
];

// Valores semilla del catálogo de dietas — se usan para poblar la tabla en la primera carga
export const DIETS: { value: string; label: string }[] = [
  { value: "vegetariano",  label: "🥦 Vegetariano" },
  { value: "vegano",       label: "🌱 Vegano" },
  { value: "sin gluten",   label: "🌾 Sin gluten" },
  { value: "sin lactosa",  label: "🥛 Sin lactosa" },
  { value: "keto",         label: "🥩 Keto" },
  { value: "sin azúcar",   label: "🍬 Sin azúcar" },
];
