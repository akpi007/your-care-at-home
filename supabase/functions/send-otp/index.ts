import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string" || phone.length < 8) {
      return new Response(JSON.stringify({ error: "Valid phone number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TWO_FACTOR_API_KEY = Deno.env.get("TWO_FACTOR_API_KEY");
    if (!TWO_FACTOR_API_KEY) throw new Error("TWO_FACTOR_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Normalize: strip leading + for 2Factor.in
    const cleanPhone = phone.replace(/^\+/, "");
    const normalizedPhone = `+${cleanPhone}`;

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Invalidate previous unused codes for this phone
    await admin
      .from("otp_codes")
      .update({ used: true })
      .eq("phone", normalizedPhone)
      .eq("used", false);

    const { error: insertErr } = await admin
      .from("otp_codes")
      .insert({ phone: normalizedPhone, code, expires_at: expiresAt });

    if (insertErr) {
      console.error("OTP insert error:", insertErr);
      throw new Error("Failed to store OTP");
    }

    // Send via 2Factor.in
    const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${cleanPhone}/${code}`;
    const smsRes = await fetch(url, { method: "POST" });
    const smsData = await smsRes.json();

    if (!smsRes.ok || smsData.Status !== "Success") {
      console.error("2Factor.in send error:", smsData);
      return new Response(
        JSON.stringify({ error: smsData?.Details || "SMS delivery failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP sent to ${normalizedPhone}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
