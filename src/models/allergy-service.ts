// Modelo de servicio de alergias.
// Gestiona el catálogo de alergias (admin) y las alergias del usuario (VIP).

import { supabase } from "@/integrations/supabase/client";

export interface Allergy {
  id: string;
  name: string;
  created_at: string;
}

/** Obtiene el catálogo completo de alergias ordenado alfabéticamente. */
export async function fetchAllergies(): Promise<Allergy[]> {
  const { data, error } = await supabase
    .from("allergies")
    .select("*")
    .order("name");
  if (error) throw error;
  return data || [];
}

/** Añade una alergia al catálogo (solo admin). */
export async function addAllergy(name: string): Promise<Allergy> {
  const { data, error } = await supabase
    .from("allergies")
    .insert({ name: name.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Elimina una alergia del catálogo (solo admin). */
export async function deleteAllergy(id: string): Promise<void> {
  const { error } = await supabase
    .from("allergies")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/** Obtiene las alergias seleccionadas por un usuario. */
export async function fetchUserAllergies(userId: string): Promise<Allergy[]> {
  const { data, error } = await supabase
    .from("user_allergies")
    .select("allergies(id, name, created_at)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row: any) => row.allergies).filter(Boolean);
}

/** Añade una alergia a la lista del usuario VIP. */
export async function addUserAllergy(userId: string, allergyId: string): Promise<void> {
  const { error } = await supabase
    .from("user_allergies")
    .insert({ user_id: userId, allergy_id: allergyId });
  if (error) throw error;
}

/** Elimina una alergia de la lista del usuario. */
export async function removeUserAllergy(userId: string, allergyId: string): Promise<void> {
  const { error } = await supabase
    .from("user_allergies")
    .delete()
    .eq("user_id", userId)
    .eq("allergy_id", allergyId);
  if (error) throw error;
}
