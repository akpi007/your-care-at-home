import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TWO_FACTOR_API_KEY = Deno.env.get("TWO_FACTOR_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!TWO_FACTOR_API_KEY) {
      throw new Error("TWO_FACTOR_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Delete old codes for this phone
    await supabase.from("otp_codes").delete().eq("phone", phone);

    // Store new code
    const { error: insertError } = await supabase.from("otp_codes").insert({
      phone,
      code,
      expires_at: expiresAt,
    });

    if (insertError) throw insertError;

    // Strip leading '+' for 2Factor.in API (expects plain digits)
    const cleanPhone = phone.replace(/^\+/, "");

    // Send OTP via 2Factor.in Transactional SMS API
    const twoFactorUrl = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${cleanPhone}/${code}/Your OTP is ${code}`;

    const smsRes = await fetch(twoFactorUrl);
    const smsData = await smsRes.json();

    if (smsData.Status !== "Success") {
      console.error("2Factor.in error:", smsData);
      throw new Error(smsData.Details || "Failed to send SMS via 2Factor.in");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
