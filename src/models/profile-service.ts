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

/**
 * Resta créditos al perfil del usuario de forma segura.
 * Solo actualiza si el usuario tiene suficientes créditos (credits >= amount).
 * Lanza un error si no hay suficientes créditos o si la operación falla.
 */
export async function deductCredits(profileId: string, amount: number, currentCredits: number): Promise<void> {
  if (currentCredits < amount) throw new Error("Créditos insuficientes");
  const { error } = await supabase
    .from("profiles")
    .update({ credits: currentCredits - amount })
    .eq("id", profileId)
    .gte("credits", amount);
  if (error) throw error;
}

/**
 * Añade créditos al saldo actual del usuario.
 * Lanza un error si la operación en la base de datos falla.
 */
export async function addCredits(profileId: string, amount: number, currentCredits: number): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ credits: currentCredits + amount })
    .eq("id", profileId);
  if (error) throw error;
}

/**
 * Resetea los créditos del usuario al valor inicial según su nuevo plan.
 * free → 200 créditos, vip → 500 créditos.
 * Se llama al cambiar de plan.
 */
export async function resetCreditsForPlan(profileId: string, plan: "free" | "vip"): Promise<void> {
  const credits = plan === "vip" ? 500 : 200;
  const { error } = await supabase
    .from("profiles")
    .update({ credits })
    .eq("id", profileId);
  if (error) throw error;
}
