import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Modelos en orden de preferencia. Si el primero tiene cuota agotada, se prueba el siguiente.
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

class QuotaExhaustedError extends Error {
  constructor() { super("DAILY_QUOTA"); }
}

// Distingue cuota diaria agotada de rate limit por minuto.
// Los errores de cuota diaria incluyen "PerDay" en el quotaId.
function isDailyQuota(body: string): boolean {
  return body.includes("PerDay");
}

// Llama a un modelo concreto con reintentos ante rate limit por minuto (backoff 2s→4s→8s).
// Lanza QuotaExhaustedError si es cuota diaria agotada.
async function callWithRetry(url: string, body: unknown, maxRetries = 3): Promise<Response> {
  let lastStatus = 0;
  let lastBody = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) return res;

    lastStatus = res.status;
    lastBody = await res.text();

    if (lastStatus === 429) {
      if (isDailyQuota(lastBody)) {
        throw new QuotaExhaustedError();
      }
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
        continue;
      }
    }

    break;
  }

  return new Response(lastBody, { status: lastStatus });
}

// Prueba cada modelo en orden. Si uno tiene cuota diaria agotada, pasa al siguiente.
async function callGemini(apiKey: string, body: unknown): Promise<Response> {
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      return await callWithRetry(url, body);
    } catch (err) {
      if (err instanceof QuotaExhaustedError) continue;
      throw err;
    }
  }
  throw new QuotaExhaustedError();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (data: unknown) =>
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { ingredients, country, category, diet, allergies, availableCountries, availableCategories, availableDiets } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const countryFilter = country
      ? `\nEl país de origen de las recetas debe ser: ${country}.`
      : availableCountries?.length > 0
        ? `\nElige el país de origen ÚNICAMENTE de esta lista: ${availableCountries.join(", ")}.`
        : "";
    const categoryFilter = category
      ? `\nLa categoría de las recetas debe ser: ${category}.`
      : availableCategories?.length > 0
        ? `\nLa categoría de las recetas debe ser ÚNICAMENTE una de estas: ${availableCategories.join(", ")}.`
        : "";
    const dietFilter = diet
      ? `\nLa receta debe ser apta para la siguiente dieta: ${diet}. Respeta estrictamente esta restricción dietética.`
      : "";
    const allergyFilter = allergies?.length > 0
      ? `\nIMPORTANTE: El usuario es alérgico a los siguientes alimentos. NO incluyas estos ingredientes en ninguna receta: ${allergies.join(", ")}.`
      : "";

    const availableCategoriesStr = availableCategories?.length > 0
      ? availableCategories.join("|")
      : "almuerzo|cena|desayuno|postre|snack";

    const systemPrompt = `Eres un chef experto y nutricionista. Genera exactamente 3 recetas usando los ingredientes proporcionados. Puedes añadir ingredientes básicos de cocina (sal, pimienta, aceite, etc.) pero la receta debe centrarse en los ingredientes dados.${countryFilter}${categoryFilter}${dietFilter}${allergyFilter}

Responde SOLO con un JSON válido (sin markdown, sin code blocks) con esta estructura exacta:
{
  "recipes": [
    {
      "id": "unique-id",
      "title": "Nombre de la receta",
      "country": "País de origen real (ej: España, Italia, México). NUNCA uses términos como Mediterráneo, Internacional, Fusión u otras regiones genéricas. Debe ser siempre un país concreto.",
      "category": "${availableCategoriesStr}",
      "calories": 350,
      "time": "25 min",
      "servings": 2,
      "protein": "15g",
      "carbs": "30g",
      "fat": "12g",
      "ingredients": ["200g de ingrediente 1", "1 ingrediente 2"],
      "calories_per_ingredient": {
        "ingrediente 1": 180,
        "ingrediente 2": 50
      },
      "steps": ["Paso 1 detallado.", "Paso 2 detallado."],
      "imageQuery": "2-3 English keywords for Pexels food photo search, e.g. 'grilled chicken lemon herbs'"
    }
  ]
}

Sé creativo y genera recetas variadas. Los valores nutricionales y calorías por ingrediente deben ser realistas. Los pasos deben ser claros y detallados. Siempre incluye country, category e imageQuery.`;

    let response: Response;
    try {
      response = await callGemini(GEMINI_API_KEY, {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: `Genera 3 recetas con estos ingredientes: ${ingredients.join(", ")}` }] }],
      });
    } catch (err) {
      if (err instanceof QuotaExhaustedError) {
        return json({ error: "Se ha agotado la cuota diaria de la IA. La cuota se restablece automáticamente cada día. Inténtalo mañana o contacta con el administrador." });
      }
      throw err;
    }

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return json({ error: `Error en la IA (${response.status}). Intenta de nuevo.` });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const content = parts.find((p: any) => !p.thought && p.text)?.text || parts[0]?.text || "";

    if (!content) return json({ recipes: [] });

    let parsed: any;
    try {
      parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      return json({ recipes: [] });
    }

    if (parsed.recipes) {
      parsed.recipes = parsed.recipes.map((recipe: any, i: number) => ({
        ...recipe,
        id: recipe.id || `recipe-${Date.now()}-${i}`,
        image: "",
        country: recipe.country || "",
        category: recipe.category || "",
        calories_per_ingredient: recipe.calories_per_ingredient || {},
      }));
    }

    return json(parsed);
  } catch (e) {
    console.error("generate-recipes error:", e);
    return json({ error: "Error al generar recetas. Intenta de nuevo." });
  }
});
