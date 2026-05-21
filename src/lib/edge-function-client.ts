// Cliente HTTP para las Edge Functions de Supabase.
// Centraliza la construcción de la URL, las cabeceras de autenticación y el manejo de errores
// para que los servicios no contengan llamadas fetch() en línea.

import { supabase } from "@/integrations/supabase/client";

const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

/**
 * Invoca una Edge Function mediante POST enviando el JWT de sesión del usuario.
 * Las Edge Functions usan ese JWT para verificar identidad y descontar créditos en el servidor.
 */
export async function invokeFunction(name: string, body: unknown): Promise<any> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token ?? ANON_KEY;

  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${name}`);
  return res.json();
}

/**
 * Llama a una Edge Function mediante GET con el token de sesión del usuario.
 * Usada para operaciones de lectura autenticadas (p. ej. búsqueda de recetas).
 */
export async function fetchFunction(path: string, accessToken: string): Promise<any> {
  const res = await fetch(`${FUNCTIONS_URL}/${path}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "apikey": ANON_KEY,
    },
  });
  if (!res.ok) throw new Error("Error en la petición a la función");
  return res.json();
}
