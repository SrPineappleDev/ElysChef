// Controlador de reconocimiento de ingredientes por imagen.
// Valida el saldo de créditos antes de llamar al servicio, convierte el archivo
// a base64 y delega el análisis a la Edge Function de reconocimiento de IA.
// Los créditos se descuentan en el servidor; este controlador solo refresca el perfil tras la operación.

import { useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/entities/profile";
import { recognizeIngredientsFromImage, fileToBase64 } from "@/models/recipe-ai-service";
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
      const detected = await recognizeIngredientsFromImage({ imageBase64: base64, mimeType });

      if (profile && user) {
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
