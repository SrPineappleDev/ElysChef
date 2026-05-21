// Módulo compartido para llamadas a la API de Groq desde las Edge Functions.
// Centraliza el cliente HTTP, el manejo de errores y los reintentos con backoff.

export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const ALLOWED_ORIGINS = new Set([
  "https://elys-chef.vercel.app",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:3000",
]);

export function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://elys-chef.vercel.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

export class QuotaExhaustedError extends Error {
  constructor() { super("DAILY_QUOTA"); }
}

export class ModelUnavailableError extends Error {
  constructor() { super("MODEL_UNAVAILABLE"); }
}

/**
 * Llama a Groq con reintentos ante rate limit y errores 5xx (backoff 2s→4s→8s).
 * Lanza QuotaExhaustedError si se agota la cuota diaria.
 * Lanza ModelUnavailableError si el modelo no responde tras los reintentos.
 */
export async function callGroq(
  apiKey: string,
  body: Record<string, unknown>,
  maxRetries = 3,
): Promise<Response> {
  let lastStatus = 0;
  let lastBody = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) return res;

    lastStatus = res.status;
    lastBody = await res.text();

    if (lastStatus === 429) {
      const isDaily = lastBody.includes("day") || lastBody.includes("daily") || lastBody.includes("tokens_per_day");
      if (isDaily) throw new QuotaExhaustedError();
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
        continue;
      }
    }

    if (lastStatus === 503 || lastStatus === 502) {
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
        continue;
      }
      throw new ModelUnavailableError();
    }

    break;
  }

  return new Response(lastBody, { status: lastStatus });
}

export const QUOTA_ERROR_MSG = "Se ha agotado la cuota diaria de la IA. La cuota se restablece automáticamente cada día. Inténtalo mañana o contacta con el administrador.";
export const UNAVAILABLE_ERROR_MSG = "La IA está experimentando alta demanda en este momento. Espera unos segundos e inténtalo de nuevo.";
