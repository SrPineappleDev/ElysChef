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
    const url = new URL(req.url);
    const country = url.searchParams.get("country") || "";
    const category = url.searchParams.get("category") || "";
    const minCalories = parseInt(url.searchParams.get("min_calories") || "0");
    const maxCalories = parseInt(url.searchParams.get("max_calories") || "99999");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    const authHeader = req.headers.get("authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { authorization: authHeader } } }
    );

    let query = supabase
      .from("recipes")
      .select("*", { count: "exact" })
      .gte("calories", minCalories)
      .lte("calories", maxCalories)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (country) query = query.eq("country", country);
    if (category) query = query.eq("category", category);

    const { data, count, error } = await query;

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
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
