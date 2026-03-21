// Modelo de servicio de perfiles.
// Contiene las funciones para leer y actualizar los datos del perfil del usuario
// en la tabla "profiles" de Supabase.

import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/use-auth";

/**
 * Model: Profile Service
 * Handles profile data operations
 */

/**
 * Obtiene el perfil de un usuario por su ID.
 * Devuelve el perfil completo o null si no existe.
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data as Profile | null;
}

/**
 * Actualiza el nombre y/o apellidos de un perfil existente.
 * Lanza un error si la operación en la base de datos falla.
 */
export async function updateProfile(
  profileId: string,
  updates: { nombre?: string; apellidos?: string }
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", profileId);
  if (error) throw error;
}

/**
 * Cambia el plan del usuario (gratuito o VIP).
 * Lanza un error si la operación en la base de datos falla.
 */
export async function updatePlan(profileId: string, plan: "free" | "vip"): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("id", profileId);
  if (error) throw error;
}
