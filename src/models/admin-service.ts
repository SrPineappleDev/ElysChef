// Servicio de administración.
// Proporciona las consultas de agregación para los KPIs del panel de admin.

import { supabase } from "@/integrations/supabase/client";
import { CREDITS } from "@/lib/credit-config";

export interface UserStats {
  total: number;
  free: number;
  vip: number;
  newThisWeek: number;
}

export interface RecipeStats {
  total: number;
  byCategory: { category: string; count: number }[];
  byCountry: { country: string; count: number }[];
  byDiet: { diet: string; count: number }[];
}

export interface AllergyStats {
  name: string;
  count: number;
}

export interface AdminProfile {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  plan: string;
  credits: number;
  created_at: string | null;
}

/** Obtiene estadísticas de usuarios: total, distribución free/VIP y nuevos registros esta semana. */
export async function fetchUserStats(): Promise<UserStats> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan, created_at");
  if (error) throw error;

  const total = data?.length || 0;
  const free = data?.filter((p) => p.plan === "free").length || 0;
  const vip = data?.filter((p) => p.plan === "vip").length || 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = data?.filter((p) => p.created_at && new Date(p.created_at) > oneWeekAgo).length || 0;

  return { total, free, vip, newThisWeek };
}

/** Obtiene estadísticas de recetas: total desglosado por categoría, país y dieta. */
export async function fetchRecipeStats(): Promise<RecipeStats> {
  const { data, error } = await supabase
    .from("recipes")
    .select("category, country, diet");
  if (error) throw error;

  const total = data?.length || 0;

  const categoryMap: Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  const dietMap: Record<string, number> = {};

  data?.forEach((r) => {
    const cat = r.category || "Sin categoría";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;

    const country = r.country || "Desconocido";
    countryMap[country] = (countryMap[country] || 0) + 1;

    const diet = r.diet || "Sin restricción";
    dietMap[diet] = (dietMap[diet] || 0) + 1;
  });

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const byCategory = Object.entries(categoryMap)
    .map(([category, count]) => ({ category: capitalize(category), count }))
    .sort((a, b) => b.count - a.count);

  const byCountry = Object.entries(countryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const byDiet = Object.entries(dietMap)
    .map(([diet, count]) => ({ diet: capitalize(diet), count }))
    .sort((a, b) => b.count - a.count);

  return { total, byCategory, byCountry, byDiet };
}

/** Obtiene las alergias más frecuentes entre todos los usuarios. */
export async function fetchAllergyStats(): Promise<AllergyStats[]> {
  const { data, error } = await supabase
    .from("user_allergies")
    .select("allergies(name)");
  if (error) throw error;

  const map: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const name = row.allergies?.name;
    if (name) map[name] = (map[name] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Estima los créditos totales consumidos por todos los usuarios.
 * Calculado como la diferencia entre el saldo inicial de cada plan y el saldo actual.
 */
export async function fetchCreditStats(): Promise<{ totalConsumed: number }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan, credits");
  if (error) throw error;

  let totalConsumed = 0;
  (data || []).forEach((p) => {
    const initial = p.plan === "vip" ? CREDITS.INITIAL_VIP : CREDITS.INITIAL_FREE;
    totalConsumed += Math.max(0, initial - p.credits);
  });

  return { totalConsumed };
}

/** Obtiene todos los perfiles para la tabla de usuarios del panel de admin, ordenados por fecha de creación. */
export async function fetchAllProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre, apellidos, email, plan, credits, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Devuelve un mapa user_id → nº de recetas generadas. */
export async function fetchRecipeCountPerUser(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("recipes").select("user_id");
  if (error) throw error;
  const map: Record<string, number> = {};
  (data || []).forEach((r) => { map[r.user_id] = (map[r.user_id] || 0) + 1; });
  return map;
}
