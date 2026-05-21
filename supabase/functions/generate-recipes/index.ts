import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGroq, QuotaExhaustedError, ModelUnavailableError, QUOTA_ERROR_MSG, UNAVAILABLE_ERROR_MSG } from "../_shared/groq.ts";
import { getCorsHeaders, validateAndDeductCredits } from "../_shared/credits.ts";

const GROQ_MODEL = "llama-3.3-70b-versatile";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (data: unknown) =>
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authErr = await validateAndDeductCredits(req.headers.get("Authorization"), 50);
    if (authErr) return json({ error: authErr });

    const { ingredients, country, category, diet, allergies, availableCountries, availableCategories, availableDiets } = await req.json();
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
      : availableDiets?.length > 0
        ? `\nLa dieta de la receta debe ser ÚNICAMENTE una de estas: ${availableDiets.join(", ")}.`
        : "";
    const allergyFilter = allergies?.length > 0
      ? `\nIMPORTANTE: El usuario es alérgico a los siguientes alimentos. NO incluyas estos ingredientes en ninguna receta: ${allergies.join(", ")}.`
      : "";

    const availableCategoriesStr = availableCategories?.length > 0
      ? availableCategories.join("|")
      : "almuerzo|cena|desayuno|postre|snack";

    const availableDietsStr = availableDiets?.length > 0
      ? availableDiets.join("|")
      : "vegetariano|vegano|sin gluten|sin lactosa|keto|sin azúcar";

    const systemPrompt = `Eres un chef experto y nutricionista. Genera exactamente 3 recetas usando los ingredientes proporcionados. Puedes añadir ingredientes básicos de cocina (sal, pimienta, aceite, etc.) pero la receta debe centrarse en los ingredientes dados.${countryFilter}${categoryFilter}${dietFilter}${allergyFilter}

Responde SOLO con un JSON válido (sin markdown, sin code blocks) con esta estructura exacta:
{
  "recipes": [
    {
      "id": "unique-id",
      "title": "Nombre de la receta",
      "description": "Descripción apetitosa de la receta en 1-2 frases.",
      "country": "País de origen real (ej: España, Italia, México). NUNCA uses términos como Mediterráneo, Internacional, Fusión u otras regiones genéricas. Debe ser siempre un país concreto.",
      "category": "${availableCategoriesStr}",
      "diet": "${availableDietsStr}",
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

Sé creativo y genera recetas variadas. Los valores nutricionales y calorías por ingrediente deben ser realistas. Los pasos deben ser claros y detallados. Siempre incluye description, country, category, diet e imageQuery.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Genera 3 recetas con estos ingredientes: ${ingredients.join(", ")}` },
    ];

    let response: Response;
    try {
      response = await callGroq(GROQ_API_KEY, { model: GROQ_MODEL, messages, temperature: 0.7 });
    } catch (err) {
      if (err instanceof QuotaExhaustedError) return json({ error: QUOTA_ERROR_MSG });
      if (err instanceof ModelUnavailableError) return json({ error: UNAVAILABLE_ERROR_MSG });
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
        description: recipe.description || "",
        country: recipe.country || "",
        category: recipe.category || "",
        diet: recipe.diet || "",
        calories_per_ingredient: recipe.calories_per_ingredient || {},
      }));
    }

    return json(parsed);
  } catch (e) {
    console.error("generate-recipes error:", e);
    return json({ error: "Error al generar recetas. Intenta de nuevo." });
  }
});
