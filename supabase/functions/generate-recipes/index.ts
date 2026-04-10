import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

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
      body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7 }),
    });

    if (res.ok) return res;

    lastStatus = res.status;
    lastBody = await res.text();

    if (lastStatus === 429) {
      // Groq devuelve 429 para rate limit por minuto y para cuota diaria agotada
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
    const { ingredients, country, category, diet, allergies, availableCountries, availableCategories } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

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

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Genera 3 recetas con estos ingredientes: ${ingredients.join(", ")}` },
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
      console.error("Groq API error:", response.status, await response.text());
      return json({ error: `Error en la IA (${response.status}). Intenta de nuevo.` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

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
