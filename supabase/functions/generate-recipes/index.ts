import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ingredients, country, category, diet, allergies, availableCountries, availableCategories, availableDiets } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const ingredientList = ingredients.join(", ");
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
    const dietFilter = diet ? `\nLa receta debe ser apta para la siguiente dieta: ${diet}. Respeta estrictamente esta restricción dietética.` : "";
    const allergyFilter = allergies && allergies.length > 0
      ? `\nIMPORTANTE: El usuario es alérgico a los siguientes alimentos. NO incluyas estos ingredientes en ninguna receta: ${allergies.join(", ")}.`
      : "";

    const availableCategoriesStr = availableCategories?.length > 0 ? availableCategories.join("|") : "almuerzo|cena|desayuno|postre|snack";

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
          contents: [
            {
              role: "user",
              parts: [{ text: `Genera 3 recetas con estos ingredientes: ${ingredientList}` }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gemini API error:", status, t);
      return new Response(JSON.stringify({ error: `Error en la IA (${status}). Intenta de nuevo.` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const content = parts.find((p: any) => !p.thought && p.text)?.text || parts[0]?.text || "";

    if (!content) {
      return new Response(JSON.stringify({ recipes: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = { recipes: [] };
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

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipes error:", e);
    return new Response(JSON.stringify({ error: "Error al generar recetas. Intenta de nuevo." }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
