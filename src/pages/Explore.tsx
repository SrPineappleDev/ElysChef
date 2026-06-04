import { useState } from "react";
import { Compass, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetail from "@/components/RecipeDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExploreController } from "@/controllers/use-explore-controller";
import type { ExploreFilters } from "@/controllers/use-explore-controller";
import type { Recipe } from "@/lib/types";

const EMPTY_FILTER = "__all__";

const Explore = () => {
  const {
    hasSearched,
    results,
    loading,
    page,
    totalPages,
    total,
    countries,
    categories,
    diets,
    isAdmin,
    isFavorite,
    toggleFavorite,
    applyFilters,
    changePage,
    deleteRecipe,
    deletingId,
  } = useExploreController();

  const [draft, setDraft] = useState<ExploreFilters>({
    title: "",
    country: "",
    category: "",
    diet: "",
    min_calories: 0,
    max_calories: 99999,
  });

  const [selected, setSelected] = useState<Recipe | null>(null);

  const handleSearch = () => applyFilters(draft);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-display font-bold text-3xl text-foreground">Explorar recetas</h1>
        <p className="text-muted-foreground mt-2">Busca entre todas las recetas de la comunidad</p>
      </div>

      {/* Panel de filtros */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8 space-y-4 animate-fade-in">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input
            placeholder="Buscar por título..."
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            onKeyDown={handleKeyDown}
          />

          <Select
            value={draft.country || EMPTY_FILTER}
            onValueChange={(v) => setDraft((d) => ({ ...d, country: v === EMPTY_FILTER ? "" : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_FILTER}>Todos los países</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={draft.category || EMPTY_FILTER}
            onValueChange={(v) => setDraft((d) => ({ ...d, category: v === EMPTY_FILTER ? "" : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_FILTER}>Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={draft.diet || EMPTY_FILTER}
            onValueChange={(v) => setDraft((d) => ({ ...d, diet: v === EMPTY_FILTER ? "" : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Dieta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_FILTER}>Todas las dietas</SelectItem>
              {diets.map((d) => (
                <SelectItem key={d.id} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Mín. kcal"
              value={draft.min_calories || ""}
              onChange={(e) => setDraft((d) => ({ ...d, min_calories: Number(e.target.value) || 0 }))}
            />
            <span className="text-muted-foreground text-sm shrink-0">–</span>
            <Input
              type="number"
              placeholder="Máx. kcal"
              value={draft.max_calories >= 99999 ? "" : draft.max_calories}
              onChange={(e) => setDraft((d) => ({ ...d, max_calories: Number(e.target.value) || 99999 }))}
            />
          </div>
        </div>

        <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto font-display font-semibold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
          Buscar
        </Button>
      </div>

      {/* Resultados */}
      {!hasSearched ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Compass className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-1">Empieza a explorar</h2>
          <p className="text-sm text-muted-foreground">Aplica filtros y pulsa Buscar para descubrir recetas.</p>
        </div>
      ) : loading && results.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-1">Sin resultados</h2>
          <p className="text-sm text-muted-foreground">Prueba con otros filtros.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {total} receta{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r) => (
              <div key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                <RecipeCard
                  recipe={r}
                  onToggleFavorite={() => toggleFavorite(r)}
                  isFavorite={isFavorite(r.id)}
                  onDelete={isAdmin ? () => deleteRecipe(r.id) : undefined}
                  isDeleting={deletingId === r.id}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => changePage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => changePage(page + 1)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Explore;
