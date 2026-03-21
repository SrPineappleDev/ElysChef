// Componente de entrada de ingredientes.
// Permite al usuario escribir y añadir ingredientes a la lista,
// eliminarlos individualmente y lanzar la generación de recetas.

import { useState } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Props que recibe el componente
interface IngredientInputProps {
  ingredients: string[];                              // Lista actual de ingredientes
  onIngredientsChange: (ingredients: string[]) => void; // Callback al cambiar la lista
  onGenerate: () => void;                             // Callback para generar recetas
  isLoading?: boolean;                                // True mientras se generan recetas
}

/**
 * Componente con campo de texto, botones de acción y lista de ingredientes seleccionados.
 * Permite añadir con Enter o con el botón "+", y eliminar cada ingrediente con su "x".
 */
const IngredientInput = ({ ingredients, onIngredientsChange, onGenerate, isLoading }: IngredientInputProps) => {
  // Valor del campo de texto actual
  const [current, setCurrent] = useState("");

  /**
   * Añade el ingrediente escrito a la lista si no está vacío ni repetido.
   * Convierte el texto a minúsculas para evitar duplicados por capitalización.
   */
  const addIngredient = () => {
    const trimmed = current.trim();
    if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
      onIngredientsChange([...ingredients, trimmed.toLowerCase()]);
    }
    setCurrent("");
  };

  /**
   * Elimina un ingrediente de la lista por su índice.
   */
  const removeIngredient = (i: number) => {
    onIngredientsChange(ingredients.filter((_, idx) => idx !== i));
  };

  /**
   * Intercepta la tecla Enter para añadir el ingrediente sin enviar el formulario.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="space-y-4">
      {/* Campo de texto para escribir un nuevo ingrediente */}
      <div className="flex gap-2">
        <Input
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un ingrediente..."
          className="flex-1 bg-card border-border"
        />
        <Button onClick={addIngredient} size="icon" variant="outline">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Lista de ingredientes añadidos como badges con botón de eliminar */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-1 capitalize"
            >
              {ing}
              {/* Botón para eliminar el ingrediente de la lista */}
              <button
                onClick={() => removeIngredient(i)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Botón para lanzar la generación de recetas; deshabilitado si no hay ingredientes */}
      <Button
        onClick={onGenerate}
        disabled={ingredients.length === 0 || isLoading}
        className="w-full gradient-hero text-primary-foreground font-display font-semibold text-base h-12"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        {isLoading ? "Generando receta..." : "Generar Receta"}
      </Button>
    </div>
  );
};

export default IngredientInput;
