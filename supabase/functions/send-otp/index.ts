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

    if (!/^\d{8,15}$/.test(cleanPhone)) {
      return new Response(JSON.stringify({ error: "Valid phone number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Rate limiting ---
    const now = Date.now();
    const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

    const { data: recent, error: recentErr } = await admin
      .from("otp_codes")
      .select("created_at")
      .eq("phone", normalizedPhone)
      .gte("created_at", dayAgo)
      .order("created_at", { ascending: false })
      .limit(50);

    if (recentErr) {
      console.error("rate limit lookup error:", recentErr);
    } else if (recent && recent.length > 0) {
      const last = new Date(recent[0].created_at as string).getTime();
      const secondsSince = (now - last) / 1000;
      if (secondsSince < 60) {
        return new Response(
          JSON.stringify({
            error: `Please wait ${Math.ceil(60 - secondsSince)}s before requesting another code.`,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const lastHour = recent.filter((r: any) => r.created_at >= hourAgo).length;
      if (lastHour >= 5) {
        return new Response(
          JSON.stringify({ error: "Too many code requests. Please try again in an hour." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (recent.length >= 15) {
        return new Response(
          JSON.stringify({ error: "Daily limit reached. Please try again tomorrow or contact support." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now + 10 * 60 * 1000).toISOString();


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

    // Send via 2Factor.in VOICE call (OTP is read out over an automated call)
    // Indian numbers use the bare 10-digit/91-prefixed form; international
    // numbers must be sent with the leading "+" (E.164).
    const isIndian = cleanPhone.startsWith("91") && cleanPhone.length === 12;
    const candidates = isIndian
      ? [cleanPhone]
      : [encodeURIComponent(`+${cleanPhone}`), cleanPhone];

    let smsData: any = null;
    let sent = false;
    for (const target of candidates) {
      const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/VOICE/${target}/${code}`;
      const smsRes = await fetch(url, { method: "POST" });
      smsData = await smsRes.json().catch(() => null);
      if (smsRes.ok && smsData?.Status === "Success") {
        sent = true;
        break;
      }
      console.error("2Factor.in voice send error:", target, smsData);
    }

    if (!sent) {
      const details = String(smsData?.Details || "");
      const message =
        !isIndian && /invalid phone number/i.test(details)
          ? "Voice OTP calls to this country aren't enabled on the provider account yet. Please contact support."
          : details || "Verification call failed";
      return new Response(
        JSON.stringify({ error: message }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }




    console.log(`Voice OTP call placed to ${normalizedPhone}`);
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
