// Datos de recetas de ejemplo (mock data).
// Se usan para pruebas o como contenido de demostración cuando no hay recetas generadas.
// Incluye recetas de distintos países y categorías con información nutricional completa.

import type { Recipe } from "./types";

// Array con recetas de muestra listas para usar sin llamar a la API
export const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Ensalada Mediterránea con Aguacate",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    calories: 320,
    time: "15 min",
    servings: 2,
    protein: "8g",
    carbs: "18g",
    fat: "24g",
    country: "España",
    category: "almuerzo",
    // Desglose calórico por cada ingrediente principal
    calories_per_ingredient: {
      "Aguacate": 160,
      "Tomate": 40,
      "Pepino": 15,
      "Queso feta": 75,
      "Aceitunas": 30,
    },
    ingredients: [
      "1 aguacate maduro",
      "2 tomates medianos",
      "1/2 pepino",
      "100g de queso feta",
      "Aceitunas negras",
      "Aceite de oliva virgen extra",
      "Zumo de limón",
      "Sal y pimienta al gusto",
    ],
    steps: [
      "Lava y corta los tomates en gajos. Pela y corta el pepino en rodajas finas.",
      "Corta el aguacate por la mitad, retira el hueso y corta la pulpa en cubos.",
      "Dispón las verduras en un plato amplio y añade las aceitunas y el queso feta desmenuzado.",
      "Aliña con aceite de oliva, zumo de limón, sal y pimienta. Sirve inmediatamente.",
    ],
  },
  {
    id: "2",
    title: "Pasta al Pesto con Tomates Cherry",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    calories: 485,
    time: "25 min",
    servings: 4,
    protein: "14g",
    carbs: "58g",
    fat: "22g",
    country: "Italia",
    category: "cena",
    calories_per_ingredient: {
      "Pasta penne": 280,
      "Tomates cherry": 30,
      "Pesto": 120,
      "Parmesano": 55,
    },
    ingredients: [
      "400g de pasta penne",
      "200g de tomates cherry",
      "4 cucharadas de pesto",
      "50g de parmesano rallado",
      "Albahaca fresca",
      "Piñones tostados",
      "Aceite de oliva",
      "Sal al gusto",
    ],
    steps: [
      "Cuece la pasta en abundante agua con sal según las instrucciones del paquete.",
      "Mientras tanto, corta los tomates cherry por la mitad y tuesta los piñones en una sartén seca.",
      "Escurre la pasta reservando un poco del agua de cocción. Mezcla con el pesto.",
      "Añade los tomates, piñones y parmesano. Ajusta la consistencia con el agua reservada.",
      "Sirve decorando con hojas frescas de albahaca.",
    ],
  },
  {
    id: "3",
    title: "Bowl de Pollo Teriyaki",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    calories: 520,
    time: "30 min",
    servings: 2,
    protein: "35g",
    carbs: "52g",
    fat: "16g",
    country: "Japón",
    category: "cena",
    calories_per_ingredient: {
      "Pechuga de pollo": 250,
      "Arroz basmati": 200,
      "Zanahoria": 25,
      "Edamame": 45,
    },
    ingredients: [
      "300g de pechuga de pollo",
      "200g de arroz basmati",
      "1 zanahoria",
      "1 pepino",
      "Edamame cocido",
      "Salsa teriyaki",
      "Semillas de sésamo",
      "Cebolleta picada",
    ],
    steps: [
      "Cuece el arroz según las instrucciones y reserva.",
      "Corta el pollo en tiras y cocínalo en una sartén con un poco de aceite hasta dorarlo.",
      "Añade la salsa teriyaki al pollo y cocina 2 minutos más hasta que caramelice.",
      "Corta la zanahoria en juliana y el pepino en rodajas finas.",
      "Monta el bowl con arroz, pollo teriyaki, verduras y edamame. Espolvorea con sésamo y cebolleta.",
    ],
  },
];

/**
 * Devuelve las recetas de muestra si hay al menos un ingrediente en la lista.
 * Si la lista está vacía, devuelve un array vacío.
 */
export function getRecipesForIngredients(ingredients: string[]): Recipe[] {
  if (ingredients.length === 0) return [];
  return mockRecipes;
}
