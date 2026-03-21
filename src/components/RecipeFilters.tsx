// Componente de filtros para recetas.
// Muestra dos selectores para filtrar las recetas generadas por país de origen
// y por categoría (desayuno, almuerzo, cena, postre, snack).

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, COUNTRIES } from "@/lib/types";

// Props del componente de filtros
interface RecipeFiltersProps {
  country: string;                       // País seleccionado actualmente
  category: string;                      // Categoría seleccionada actualmente
  onCountryChange: (v: string) => void;  // Callback al cambiar el país
  onCategoryChange: (v: string) => void; // Callback al cambiar la categoría
}

/**
 * Componente con dos selectores de filtro para refinar la generación de recetas.
 * El valor "all" representa la opción "sin filtro" para cada selector.
 * Usa las listas COUNTRIES y CATEGORIES definidas en los tipos globales.
 */
const RecipeFilters = ({ country, category, onCountryChange, onCategoryChange }: RecipeFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Selector de país de origen de la receta */}
      <div className="flex-1 min-w-[140px]">
        <Label className="text-xs text-muted-foreground mb-1 block">País</Label>
        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger className="bg-card border-border">
            <SelectValue placeholder="Todos los países" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los países</SelectItem>
            {/* Lista de países disponibles para filtrar */}
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de categoría de la receta */}
      <div className="flex-1 min-w-[140px]">
        <Label className="text-xs text-muted-foreground mb-1 block">Categoría</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-card border-border">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {/* Lista de categorías disponibles */}
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RecipeFilters;
