// Cliente HTTP para las Edge Functions de Supabase.
// Centraliza la configuración de URL, autenticación y manejo de errores
// para que los servicios no contengan fetch() en línea.

const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

/**
 * Invoca una Edge Function mediante POST con la clave anónima.
 * Usado para operaciones de IA que no requieren sesión de usuario.
 */
export async function invokeFunction(name: string, body: unknown): Promise<any> {
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
      "apikey": ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${name}`);
  return res.json();
}

/**
 * Llama a una Edge Function mediante GET con el token de sesión del usuario.
 * Usado para operaciones que requieren autenticación (ej: búsqueda de recetas).
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
