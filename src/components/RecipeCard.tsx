// Componente de tarjeta de receta.
// Muestra la información resumida de una receta: imagen, calorías, país, título,
// categoría, tiempo, porciones y macronutrientes. Incluye botón de favorito.

import { memo } from "react";
import { Clock, Flame, Users, Heart, MapPin, Tag, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

/**
 * Tarjeta visual que resume los datos de una receta.
 * Muestra imagen (o spinner si aún se está cargando), badges de calorías y país,
 * título, categoría, tiempo, porciones y los tres macronutrientes principales.
 */
const RecipeCard = ({ recipe, onToggleFavorite, isFavorite, onDelete, isDeleting }: RecipeCardProps) => {
  return (
    <Card className="overflow-hidden bg-card border-border animate-fade-in group">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {isDeleting && (
          <div className="absolute inset-0 z-10 bg-background/75 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <Loader2 className="w-6 h-6 animate-spin text-destructive" />
            <p className="text-xs font-semibold text-foreground">Eliminando, espere...</p>
          </div>
        )}
        {recipe.image ? (
          // Imagen de la receta con efecto zoom al pasar el ratón
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          // Spinner mientras se genera la imagen con IA
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-1">
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-9 h-9 rounded-full glass-card hover:bg-destructive/20"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(recipe.id); }}
            className="w-9 h-9 rounded-full glass-card hover:bg-destructive/20"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </Button>
        </div>

        {/* Badges de calorías y país en la esquina inferior izquierda */}
        <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
          <Badge className="bg-calorie text-calorie-foreground font-display font-semibold">
            <Flame className="w-3 h-3 mr-1" />
            {recipe.calories} kcal
          </Badge>
          {recipe.country && (
            <Badge variant="secondary" className="glass-card font-display text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {recipe.country}
            </Badge>
          )}
        </div>
      </div>

      {/* Sección de información textual de la receta */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base sm:text-lg text-foreground leading-tight min-w-0">
            {recipe.title}
          </h3>
          {/* Badge de categoría (desayuno, almuerzo, cena, etc.) */}
          {recipe.category && (
            <Badge variant="outline" className="text-xs shrink-0 capitalize">
              <Tag className="w-3 h-3 mr-1" />
              {recipe.category}
            </Badge>
          )}
        </div>

        {/* Descripción breve de la receta */}
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
        )}

        {/* Tiempo de preparación y número de porciones */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.time}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {recipe.servings} porciones
          </span>
        </div>

        {/* Resumen de macronutrientes: proteínas, carbohidratos y grasas */}
        <div className="flex gap-4 pt-2 border-t border-border">
          <NutrientPill label="Proteínas" value={recipe.protein} color="text-success" />
          <NutrientPill label="Carbos" value={recipe.carbs} color="text-accent" />
          <NutrientPill label="Grasas" value={recipe.fat} color="text-calorie" />
        </div>
      </div>
    </Card>
  );
};

/**
 * Componente auxiliar que muestra un macronutriente con su valor y etiqueta.
 * Recibe el nombre, el valor y el color de texto a aplicar.
 */
const NutrientPill = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="text-center flex-1">
    <p className={`font-display font-bold text-sm ${color}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default memo(RecipeCard);
