// Componente de detalle de receta.
// Muestra la vista completa de una receta: imagen grande, información nutricional,
// desglose calórico por ingrediente, lista de ingredientes, pasos de preparación
// y botón para añadir o quitar de favoritos.

import { ArrowLeft, Clock, Flame, Users, Heart, ChefHat, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Recipe } from "@/lib/types";

// Props del componente de detalle
interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;                      // Callback para volver a la lista de recetas
  onToggleFavorite: (id: string) => void;  // Callback para añadir/quitar de favoritos
  isFavorite: boolean;                     // True si la receta está en favoritos
}

/**
 * Vista detallada de una receta con toda su información.
 * Organizada en secciones: cabecera con imagen, cuadrícula nutricional,
 * calorías por ingrediente, lista de ingredientes y pasos de preparación.
 */
const RecipeDetail = ({ recipe, onBack, onToggleFavorite, isFavorite }: RecipeDetailProps) => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Botón para volver a la lista anterior */}
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      {/* Imagen principal con título y badges superpuestos */}
      <div className="relative rounded-2xl overflow-hidden aspect-video">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        {/* Gradiente oscuro para mejorar la legibilidad del texto sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display font-bold text-3xl text-primary-foreground mb-3">{recipe.title}</h1>
          {/* Badges con calorías, tiempo, porciones, país y categoría */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-calorie text-calorie-foreground font-display">
              <Flame className="w-3 h-3 mr-1" /> {recipe.calories} kcal
            </Badge>
            <Badge variant="secondary" className="glass-card">
              <Clock className="w-3 h-3 mr-1" /> {recipe.time}
            </Badge>
            <Badge variant="secondary" className="glass-card">
              <Users className="w-3 h-3 mr-1" /> {recipe.servings} porciones
            </Badge>
            {recipe.country && (
              <Badge variant="secondary" className="glass-card">
                <MapPin className="w-3 h-3 mr-1" /> {recipe.country}
              </Badge>
            )}
            {recipe.category && (
              <Badge variant="secondary" className="glass-card capitalize">
                <Tag className="w-3 h-3 mr-1" /> {recipe.category}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Cuadrícula con los 4 valores nutricionales principales */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Calorías", value: `${recipe.calories}`, unit: "kcal", className: "bg-calorie/10 text-calorie" },
          { label: "Proteínas", value: recipe.protein, unit: "", className: "bg-success/10 text-success" },
          { label: "Carbohidratos", value: recipe.carbs, unit: "", className: "bg-accent/10 text-accent" },
          { label: "Grasas", value: recipe.fat, unit: "", className: "bg-warm text-warm-foreground" },
        ].map((n) => (
          <div key={n.label} className={`rounded-xl p-4 text-center ${n.className}`}>
            <p className="font-display font-bold text-lg">{n.value}{n.unit}</p>
            <p className="text-xs mt-1 opacity-80">{n.label}</p>
          </div>
        ))}
      </div>

      {/* Desglose de calorías por ingrediente (solo si está disponible) */}
      {recipe.calories_per_ingredient && Object.keys(recipe.calories_per_ingredient).length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-calorie" /> Calorías por ingrediente
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {Object.entries(recipe.calories_per_ingredient).map(([name, cal]) => (
              <div key={name} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-muted/50">
                <span className="text-foreground">{name}</span>
                <span className="font-display font-semibold text-calorie">{cal} kcal</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista completa de ingredientes de la receta */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-primary" /> Ingredientes
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      </div>

      {/* Pasos numerados de preparación */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="font-display font-bold text-lg mb-4">Preparación</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              {/* Número del paso con estilo destacado */}
              <span className="flex-shrink-0 w-8 h-8 rounded-full gradient-hero text-primary-foreground font-display font-bold text-sm flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-foreground pt-1.5 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Botón para añadir o quitar la receta de favoritos */}
      <Button
        onClick={() => onToggleFavorite(recipe.id)}
        variant={isFavorite ? "destructive" : "outline"}
        className="w-full h-12 font-display font-semibold"
      >
        <Heart className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`} />
        {isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      </Button>
    </div>
  );
};

export default RecipeDetail;
