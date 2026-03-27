import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { role, display_name, specialization, years_experience, license_number, bio, city } =
      await req.json();

    if (role !== "professional") {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Update role: delete default patient role, insert professional
    await adminClient.from("user_roles").delete().eq("user_id", userId).eq("role", "patient");
    await adminClient.from("user_roles").upsert(
      { user_id: userId, role: "professional" },
      { onConflict: "user_id,role" }
    );

    // Check if professional record exists (created by trigger)
    const { data: existing } = await adminClient
      .from("professionals")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await adminClient
        .from("professionals")
        .update({
          display_name,
          specialization,
          years_experience: years_experience || 0,
          license_number: license_number || "",
          bio: bio || "",
          city: city || "",
          verification_status: "pending",
        })
        .eq("user_id", userId);
    } else {
      await adminClient.from("professionals").insert({
        user_id: userId,
        display_name,
        specialization,
        years_experience: years_experience || 0,
        license_number: license_number || "",
        bio: bio || "",
        city: city || "",
        verification_status: "pending",
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
