import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    // Decode JWT locally — Supabase already verified the signature before this function runs.
    // This avoids an HTTP round-trip to the Auth API on every request.
    let userId: string;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub;
      if (!userId) throw new Error("missing sub");
    } catch {
      return new Response(JSON.stringify({ success: false, error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const title       = url.searchParams.get("title") || "";
    const country     = url.searchParams.get("country") || "";
    const category    = url.searchParams.get("category") || "";
    const diet        = url.searchParams.get("diet") || "";
    const minCalories = parseInt(url.searchParams.get("min_calories") || "0");
    const maxCalories = parseInt(url.searchParams.get("max_calories") || "99999");
    const page        = parseInt(url.searchParams.get("page") || "1");
    const limit       = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let recipesQuery = supabaseAdmin
      .from("recipes")
      .select("id, title, description, image, calories, time, servings, protein, carbs, fat, ingredients, steps, country, category, diet, calories_per_ingredient, created_at", { count: "exact" })
      .gte("calories", minCalories)
      .lte("calories", maxCalories)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (title)    recipesQuery = recipesQuery.ilike("title", `%${title}%`);
    if (country)  recipesQuery = recipesQuery.eq("country", country);
    if (category) recipesQuery = recipesQuery.eq("category", category);
    if (diet)     recipesQuery = recipesQuery.eq("diet", diet);

    // Profile check and recipes query run in parallel.
    const [profileResult, recipesResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("plan, role").eq("id", userId).single(),
      recipesQuery,
    ]);

    const profile = profileResult.data;
    if (!profile || (profile.plan !== "vip" && profile.role !== "admin")) {
      return new Response(JSON.stringify({ success: false, error: "Acceso restringido a usuarios VIP y administradores" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (recipesResult.error) throw recipesResult.error;

    return new Response(JSON.stringify({
      success: true,
      data: recipesResult.data || [],
      pagination: {
        page,
        limit,
        total: recipesResult.count || 0,
        total_pages: Math.ceil((recipesResult.count || 0) / limit),
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search-recipes error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
