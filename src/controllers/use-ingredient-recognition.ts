// Controlador de reconocimiento de ingredientes por imagen.
// Gestiona la conversión de imagen a base64, el análisis con IA,
// la deducción de créditos y la actualización de la lista de ingredientes.

import { useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/entities/profile";
import { recognizeIngredientsFromImage, fileToBase64 } from "@/models/recipe-service";
import { deductCredits } from "@/models/profile-service";
import { CREDITS } from "@/lib/credit-config";

interface UseIngredientRecognitionOptions {
  profile: Profile | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  onIngredientsDetected: (ingredients: string[]) => void;
}

export function useIngredientRecognition({
  profile,
  user,
  refreshProfile,
  onIngredientsDetected,
}: UseIngredientRecognitionOptions) {
  const [isRecognizing, setIsRecognizing] = useState(false);

  const handleImageSelected = async (file: File, _preview: string) => {
    if (profile && profile.credits < CREDITS.COST_ANALYZE_IMAGE) {
      toast.error(
        `Créditos insuficientes. Necesitas ${CREDITS.COST_ANALYZE_IMAGE} créditos. Tienes ${profile.credits}.`,
        { description: "Recarga créditos en tu perfil." }
      );
      return;
    }

    setIsRecognizing(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const detected = await recognizeIngredientsFromImage(base64, mimeType);

      if (profile && user) {
        await deductCredits(profile.id, CREDITS.COST_ANALYZE_IMAGE, profile.credits);
        await refreshProfile();
      }

      if (detected.length > 0) {
        onIngredientsDetected(detected);
        toast.success(`${detected.length} ingredientes detectados`);
      } else {
        toast.warning("No se detectaron ingredientes. Intenta con otra imagen.");
      }
    } catch (e: any) {
      toast.error(e.message || "Error al analizar la imagen");
    } finally {
      setIsRecognizing(false);
    }
  };

  return { isRecognizing, handleImageSelected };
}
