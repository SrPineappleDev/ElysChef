import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

class QuotaExhaustedError extends Error {
  constructor() { super("DAILY_QUOTA"); }
}

class ModelUnavailableError extends Error {
  constructor() { super("MODEL_UNAVAILABLE"); }
}

// Llama a Groq con reintentos ante rate limit (backoff 2s→4s→8s).
async function callGroq(apiKey: string, messages: unknown[], maxRetries = 3): Promise<Response> {
  let lastStatus = 0;
  let lastBody = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: GROQ_VISION_MODEL, messages, temperature: 0.2 }),
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (data: unknown) =>
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { imageBase64 } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
          {
            type: "text",
            text: `Eres un experto en reconocimiento de ingredientes alimenticios. Analiza la imagen y devuelve ÚNICAMENTE un JSON válido (sin markdown, sin code blocks) con esta estructura exacta:
{"ingredients": ["ingrediente1", "ingrediente2", ...]}
Usa nombres en español. Sé específico (ej: "tomate cherry" en vez de solo "tomate"). Solo incluye alimentos claramente visibles.`,
          },
        ],
      },
    ];

    let response: Response;
    try {
      response = await callGroq(GROQ_API_KEY, messages);
    } catch (err) {
      if (err instanceof QuotaExhaustedError) {
        return json({ error: "Se ha agotado la cuota diaria de la IA. La cuota se restablece automáticamente cada día. Inténtalo mañana o contacta con el administrador." });
      }
      if (err instanceof ModelUnavailableError) {
        return json({ error: "La IA está experimentando alta demanda en este momento. Espera unos segundos e inténtalo de nuevo." });
      }
      throw err;
    }

    if (!response.ok) {
      console.error("Groq vision API error:", response.status, await response.text());
      return json({ error: `Error en la IA (${response.status}). Intenta de nuevo.` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = { ingredients: [] };
    }

    return json(parsed);
  } catch (e) {
    console.error("recognize-ingredients error:", e);
    return json({ error: "Error al analizar la imagen. Intenta de nuevo." });
  }
});
