// Componente de filtros para recetas.
// Muestra dos selectores para filtrar las recetas generadas por país de origen
// y por categoría (desayuno, almuerzo, cena, postre, snack).

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CATEGORIES, COUNTRIES } from "@/lib/types";

export const DIETS = [
  { value: "vegetariano",  label: "🥦 Vegetariano" },
  { value: "vegano",       label: "🌱 Vegano" },
  { value: "sin gluten",   label: "🌾 Sin gluten" },
  { value: "sin lactosa",  label: "🥛 Sin lactosa" },
  { value: "keto",         label: "🥩 Keto" },
  { value: "sin azúcar",   label: "🍬 Sin azúcar" },
];

// Props del componente de filtros
interface RecipeFiltersProps {
  country: string;
  category: string;
  diet: string;
  isVip?: boolean;
  onCountryChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onDietChange: (v: string) => void;
}

/**
 * Componente con tres selectores de filtro: país, categoría y dieta.
 * El valor "all" representa la opción "sin filtro" para cada selector.
 */
const RecipeFilters = ({ country, category, diet, isVip, onCountryChange, onCategoryChange, onDietChange }: RecipeFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Selector de país */}
      <div className="flex-1 min-w-[140px]">
        <Label className="text-xs text-muted-foreground mb-1 block">País</Label>
        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger className="bg-card border-border">
            <SelectValue placeholder="Todos los países" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los países</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de categoría */}
      <div className="flex-1 min-w-[140px]">
        <Label className="text-xs text-muted-foreground mb-1 block">Categoría</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-card border-border">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de dieta (solo VIP) */}
      {isVip && (
        <div className="flex-1 min-w-[140px]">
          <Label className="text-xs text-muted-foreground mb-1 block">Dieta</Label>
          <Select value={diet} onValueChange={onDietChange}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Sin restricción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sin restricción</SelectItem>
              {DIETS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default RecipeFilters;
