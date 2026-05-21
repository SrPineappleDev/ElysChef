import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, validateAuth } from "../_shared/credits.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authErr = await validateAuth(req.headers.get("Authorization"));
    if (authErr) {
      return new Response(JSON.stringify({ image: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, imageQuery } = await req.json();
    const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
    if (!PEXELS_API_KEY) throw new Error("PEXELS_API_KEY is not configured");

    // Usa imageQuery si viene del generador de recetas, si no usa el título directamente
    const query = encodeURIComponent(imageQuery || title);
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
