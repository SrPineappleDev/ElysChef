// Servicio de catálogos dinámicos (países, categorías y dietas).
// Persiste en Supabase con soporte de soft delete (campo archived).
// Los registros archivados no aparecen en los filtros pero siguen existiendo.

import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES, CATEGORIES, DIETS } from "@/lib/types";
import type { CatalogCountry, CatalogCategory, CatalogDiet } from "@/entities/catalog";

export type { CatalogCountry, CatalogCategory, CatalogDiet };

// ─── Países ───────────────────────────────────────────────────────────────────

/** Devuelve solo los países activos (para RecipeFilters y para el prompt de la IA). */
export async function fetchCountries(): Promise<CatalogCountry[]> {
  const { data, error } = await supabase
    .from("countries")
    .select("id, name, archived")
    .eq("archived", false)
    .order("name");
  if (error) throw error;

  if ((data || []).length === 0) return seedCountries();
  return data || [];
}

/** Devuelve todos los países (activos + archivados) para el panel de Admin. */
export async function fetchAllCountries(): Promise<CatalogCountry[]> {
  const { data, error } = await supabase
    .from("countries")
    .select("id, name, archived")
    .order("name");
  if (error) throw error;
  return data || [];
}

async function seedCountries(): Promise<CatalogCountry[]> {
  await supabase.from("countries").insert(COUNTRIES.map((name) => ({ name })));
  const { data } = await supabase.from("countries").select("id, name, archived").eq("archived", false).order("name");
  return data || [];
}

export async function addCountry(name: string): Promise<void> {
  const { error } = await supabase.from("countries").insert({ name: name.trim() });
  if (error) throw error;
}

/** Archiva un país (soft delete). Las recetas existentes con ese país no se modifican. */
export async function archiveCountry(id: string): Promise<void> {
  const { error } = await supabase.from("countries").update({ archived: true }).eq("id", id);
  if (error) throw error;
}

/** Restaura un país archivado. */
export async function restoreCountry(id: string): Promise<void> {
  const { error } = await supabase.from("countries").update({ archived: false }).eq("id", id);
  if (error) throw error;
}

// ─── Categorías ───────────────────────────────────────────────────────────────

/** Devuelve solo las categorías activas. */
export async function fetchCategories(): Promise<CatalogCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, value, label, archived")
    .eq("archived", false)
    .order("label");
  if (error) throw error;

  if ((data || []).length === 0) return seedCategories();
  return data || [];
}

/** Devuelve todas las categorías (activas + archivadas) para el Admin. */
export async function fetchAllCategories(): Promise<CatalogCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, value, label, archived")
    .order("label");
  if (error) throw error;
  return data || [];
}

async function seedCategories(): Promise<CatalogCategory[]> {
  await supabase.from("categories").insert(CATEGORIES.map((c) => ({ value: c.value as string, label: c.label })));
  const { data } = await supabase.from("categories").select("id, value, label, archived").eq("archived", false).order("label");
  return data || [];
}

export async function addCategory(label: string): Promise<void> {
  const trimmed = label.trim();
  const value = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
  const { error } = await supabase.from("categories").insert({ value, label: trimmed });
  if (error) throw error;
}

export async function archiveCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").update({ archived: true }).eq("id", id);
  if (error) throw error;
}

export async function restoreCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").update({ archived: false }).eq("id", id);
  if (error) throw error;
}

// ─── Dietas ───────────────────────────────────────────────────────────────────

/** Devuelve solo las dietas activas. */
export async function fetchDiets(): Promise<CatalogDiet[]> {
  const { data, error } = await supabase
    .from("diets")
    .select("id, value, label, archived")
    .eq("archived", false)
    .order("label");
  if (error) throw error;

  if ((data || []).length === 0) return seedDiets();
  return data || [];
}

/** Devuelve todas las dietas (activas + archivadas) para el Admin. */
export async function fetchAllDiets(): Promise<CatalogDiet[]> {
  const { data, error } = await supabase
    .from("diets")
    .select("id, value, label, archived")
    .order("label");
  if (error) throw error;
  return data || [];
}

async function seedDiets(): Promise<CatalogDiet[]> {
  await supabase.from("diets").insert(DIETS.map((d) => ({ value: d.value, label: d.label })));
  const { data } = await supabase.from("diets").select("id, value, label, archived").eq("archived", false).order("label");
  return data || [];
}

export async function addDiet(label: string): Promise<void> {
  const trimmed = label.trim();
  const value = trimmed.toLowerCase().replace(/\p{Emoji}/gu, "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  const { error } = await supabase.from("diets").insert({ value, label: trimmed });
  if (error) throw error;
}

export async function archiveDiet(id: string): Promise<void> {
  const { error } = await supabase.from("diets").update({ archived: true }).eq("id", id);
  if (error) throw error;
}

export async function restoreDiet(id: string): Promise<void> {
  const { error } = await supabase.from("diets").update({ archived: false }).eq("id", id);
  if (error) throw error;
}
