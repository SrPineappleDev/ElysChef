import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGroq, corsHeaders, QuotaExhaustedError, ModelUnavailableError, QUOTA_ERROR_MSG, UNAVAILABLE_ERROR_MSG } from "../_shared/groq.ts";

const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (data: unknown) =>
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { imageBase64, mimeType = "image/jpeg" } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
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
      response = await callGroq(GROQ_API_KEY, { model: GROQ_VISION_MODEL, messages, temperature: 0.2 });
    } catch (err) {
      if (err instanceof QuotaExhaustedError) return json({ error: QUOTA_ERROR_MSG });
      if (err instanceof ModelUnavailableError) return json({ error: UNAVAILABLE_ERROR_MSG });
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
