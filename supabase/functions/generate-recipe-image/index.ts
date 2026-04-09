import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getEnglishKeywords(title: string, geminiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
        contents: [{
          role: "user",
          parts: [{ text: `Give me 2-3 English keywords (comma separated, no explanation) to search a food photo of: "${title}". Example: "garlic chicken, spanish dish"` }],
        }],
      }),
    }
  );
  if (!res.ok) return title;
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || title;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, imageQuery } = await req.json();
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!PEXELS_API_KEY) throw new Error("PEXELS_API_KEY is not configured");

    let keywords = imageQuery;
    if (!keywords && GEMINI_API_KEY) {
      keywords = await getEnglishKeywords(title, GEMINI_API_KEY);
    }
    if (!keywords) keywords = title;

    const query = encodeURIComponent(keywords);
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );

    if (!res.ok) {
      console.error("Pexels error:", res.status);
      return new Response(JSON.stringify({ image: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const image = data.photos?.[0]?.src?.large ?? null;

    return new Response(JSON.stringify({ image }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipe-image error:", e);
    return new Response(JSON.stringify({ image: null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
