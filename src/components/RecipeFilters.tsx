// Componente de filtros para recetas.
// Carga los catálogos de países, categorías y dietas desde Supabase
// y muestra tres selectores para filtrar las recetas generadas.

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchCountries, fetchCategories, fetchDiets } from "@/models/catalog-service";
import type { CatalogCountry, CatalogCategory, CatalogDiet } from "@/models/catalog-service";

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
  const [countries, setCountries] = useState<CatalogCountry[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [diets, setDiets] = useState<CatalogDiet[]>([]);

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
    fetchDiets().then(setDiets).catch(() => {});
  }, []);

  return (
    <div className="flex flex-wrap gap-3">
      {/* Selector de país */}
      <div className="flex-1 min-w-[140px]">
        <Label className="text-xs text-muted-foreground mb-1 block">País</Label>
        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger className="bg-card border-border">
            <SelectValue placeholder="Todos los países" />
          </SelectTrigger>
          <SelectContent className="max-h-48 overflow-y-auto">
            <SelectItem value="all">Todos los países</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
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
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.value}>{c.label}</SelectItem>
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
              {diets.map((d) => (
                <SelectItem key={d.id} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default RecipeFilters;
