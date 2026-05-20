// Página de recetas favoritas.
// Muestra las recetas guardadas por el usuario en una cuadrícula de tarjetas.
// Al hacer clic en una tarjeta, muestra el detalle completo de la receta.
// Indica el límite de favoritos del plan gratuito (máximo 10).

import { useState } from "react";
import { Heart, Loader2, Download } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetail from "@/components/RecipeDetail";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/controllers/use-favorites-controller";
import { useAuth } from "@/hooks/use-auth";
import { downloadRecipePdf, downloadAllFavoritesPdf } from "@/lib/pdf-generator";
import type { Recipe } from "@/lib/types";

/**
 * Página que lista las recetas favoritas del usuario.
 * Tiene tres estados visuales: cargando, sin favoritos o cuadrícula de recetas.
 * Al seleccionar una receta, cambia a la vista de detalle con opción de volver.
 */
const Favorites = () => {
  const { favorites, isFavorite, toggleFavorite, loading } = useFavorites();
  const { profile } = useAuth();

  // Receta seleccionada para ver su detalle; null muestra la lista
  const [selected, setSelected] = useState<Recipe | null>(null);

  // Solo VIP y admin pueden descargar PDFs
  const canDownload = profile?.plan === "vip" || profile?.role === "admin";

  // Vista de detalle de una receta seleccionada
  if (selected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <RecipeDetail
          recipe={selected}
          onBack={() => setSelected(null)}
          onToggleFavorite={() => toggleFavorite(selected)}
          isFavorite={isFavorite(selected.id)}
          onDownloadPdf={canDownload ? () => downloadRecipePdf(selected) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Cabecera con título y contador de favoritos para plan gratuito */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-display font-bold text-3xl text-foreground">Mis Favoritos</h1>
        <p className="text-muted-foreground mt-2">
          Tus recetas guardadas
          {/* Muestra el contador de uso solo para usuarios del plan gratuito */}
          {profile && profile.plan === "free" && (
            <span className="block text-xs mt-1">
              {favorites.length}/10 — Plan gratuito
            </span>
          )}
        </p>
        {/* Botón de descarga masiva solo para VIP y admin con al menos una receta */}
        {canDownload && favorites.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display font-semibold"
            onClick={() => downloadAllFavoritesPdf(favorites)}
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar todas en PDF
          </Button>
        )}
      </div>

      {/* Estado de carga: spinner centrado */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : favorites.length === 0 ? (
        // Estado vacío: mensaje informativo cuando no hay favoritos
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-1">Sin favoritos aún</h2>
          <p className="text-sm text-muted-foreground">
            Analiza ingredientes y guarda las recetas que más te gusten.
          </p>
        </div>
      ) : (
        // Cuadrícula de tarjetas de recetas favoritas
        <div className="grid sm:grid-cols-2 gap-6">
          {favorites.map((r) => (
            // Al hacer clic en la tarjeta, se abre el detalle de la receta
            <div key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
              <RecipeCard
                recipe={r}
                onToggleFavorite={() => toggleFavorite(r)}
                isFavorite={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
