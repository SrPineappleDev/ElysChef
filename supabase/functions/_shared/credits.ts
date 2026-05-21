import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export { getCorsHeaders } from "./groq.ts";

function makeSupabase(authHeader: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
}

/**
 * Verifica el JWT del usuario y descuenta `cost` créditos de su perfil.
 * Devuelve null si todo va bien, o un string de error si falla.
 */
export async function validateAndDeductCredits(
  authHeader: string | null,
  cost: number,
): Promise<string | null> {
  if (!authHeader) return "No autorizado";

  const supabase = makeSupabase(authHeader);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return "No autorizado";

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return "Perfil no encontrado";
  if (profile.credits < cost) return `Créditos insuficientes. Necesitas ${cost} créditos.`;

  const { data: updated, error: deductError } = await supabase
    .from("profiles")
    .update({ credits: profile.credits - cost })
    .eq("id", user.id)
    .gte("credits", cost)
    .select("credits");

  if (deductError || !updated || updated.length === 0) return "Créditos insuficientes";

  return null;
}

/**
 * Verifica que el JWT sea de un usuario autenticado. Sin coste de créditos.
 * Devuelve null si todo va bien, o un string de error si falla.
 */
export async function validateAuth(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return "No autorizado";

  const supabase = makeSupabase(authHeader);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return "No autorizado";

  return null;
}
