// Página de análisis de ingredientes y generación de recetas.
// Permite al usuario introducir ingredientes de dos formas: texto manual o imagen.
// Muestra filtros de país y categoría, y presenta las recetas generadas por la IA.

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Type } from "lucide-react";
import IngredientInput from "@/components/IngredientInput";
import ImageUpload from "@/components/ImageUpload";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetail from "@/components/RecipeDetail";
import RecipeFilters from "@/components/RecipeFilters";
import { useFavorites } from "@/controllers/use-favorites-controller";
import { useRecipeGenerator } from "@/controllers/use-recipe-generator";

/**
 * Página principal de generación de recetas con dos modos de entrada:
 * - Texto: el usuario escribe los ingredientes manualmente.
 * - Imagen: el usuario sube una foto y la IA detecta los ingredientes.
 * Al seleccionar una receta generada, muestra su vista de detalle completo.
 */
const Analyze = () => {
  // Estado y lógica del generador de recetas (ingredientes, filtros, recetas, IA)
  const {
    ingredients, setIngredients,
    recipes, selected, setSelected,
    isLoading, isRecognizing,
    country, setCountry,
    category, setCategory,
    profile,
    handleGenerate, handleImageSelected,
  } = useRecipeGenerator();

  // Funciones de favoritos para marcar/desmarcar recetas generadas
  const { isFavorite, toggleFavorite } = useFavorites();

  // Si hay una receta seleccionada, muestra su vista de detalle completo
  if (selected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <RecipeDetail
          recipe={selected}
          onBack={() => setSelected(null)}
          onToggleFavorite={() => toggleFavorite(selected)}
          isFavorite={isFavorite(selected.id)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Cabecera con título y subtítulo con info del plan activo */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-display font-bold text-3xl text-foreground">
          Analiza tus ingredientes
        </h1>
        <p className="text-muted-foreground mt-2">
          Sube una imagen o escribe los ingredientes que tienes disponibles.
          {/* Muestra el plan activo y el límite de recetas del usuario */}
          {profile && (
            <span className="block text-xs mt-1">
              Plan {profile.plan === "vip" ? "VIP — hasta 3 recetas" : "Gratuito — 1 receta"}
            </span>
          )}
        </p>
      </div>

      {/* Filtros de país y categoría para refinar las recetas generadas */}
      <div className="mb-6 animate-fade-in">
        <RecipeFilters
          country={country}
          category={category}
          onCountryChange={setCountry}
          onCategoryChange={setCategory}
        />
      </div>

      {/* Tabs para elegir entre entrada por texto o por imagen */}
      <Tabs defaultValue="text" className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
          <TabsTrigger value="text" className="font-display">
            <Type className="w-4 h-4 mr-2" /> Texto
          </TabsTrigger>
          <TabsTrigger value="image" className="font-display">
            <Camera className="w-4 h-4 mr-2" /> Imagen
          </TabsTrigger>
        </TabsList>

        {/* Tab de entrada por texto: campo de ingredientes y botón generar */}
        <TabsContent value="text" className="space-y-6">
          <IngredientInput
            ingredients={ingredients}
            onIngredientsChange={setIngredients}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Tab de entrada por imagen: zona de carga y resultado del reconocimiento */}
        <TabsContent value="image" className="space-y-6">
          {/* Zona de subida de imagen */}
          <ImageUpload onImageSelected={handleImageSelected} />

          {/* Indicador de carga mientras la IA analiza la imagen */}
          {isRecognizing && (
            <div className="text-center py-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Analizando imagen con IA...
              </div>
            </div>
          )}

          {/* Ingredientes detectados: permite editarlos antes de generar la receta */}
          {ingredients.length > 0 && !isRecognizing && (
            <div className="animate-fade-in">
              <p className="text-sm text-muted-foreground mb-2">Ingredientes detectados:</p>
              <IngredientInput
                ingredients={ingredients}
                onIngredientsChange={setIngredients}
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cuadrícula de recetas generadas por la IA */}
      {recipes.length > 0 && (
        <div className="mt-10 space-y-6 animate-fade-in">
          <h2 className="font-display font-bold text-xl text-foreground">
            Recetas sugeridas por IA
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {recipes.map((r) => (
              // Al hacer clic en la tarjeta, se abre el detalle de la receta
              <div key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                <RecipeCard
                  recipe={r}
                  onToggleFavorite={() => toggleFavorite(r)}
                  isFavorite={isFavorite(r.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyze;
