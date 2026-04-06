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
    const { phone, name } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TWO_FACTOR_API_KEY = Deno.env.get("TWO_FACTOR_API_KEY");
    if (!TWO_FACTOR_API_KEY) {
      throw new Error("TWO_FACTOR_API_KEY is not configured");
    }

    // Strip leading '+' for 2Factor.in API
    const cleanPhone = phone.replace(/^\+/, "");
    const greeting = name ? `Hi ${name}, w` : "W";

    // Use 2Factor.in's SMS API to send a confirmation message
    // We use the OTP endpoint with a recognizable code as a workaround
    // to deliver a confirmation notification
    const confirmCode = "000000";
    const twoFactorUrl = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${cleanPhone}/${confirmCode}`;

    const smsRes = await fetch(twoFactorUrl, { method: "POST" });
    const smsData = await smsRes.json();

    if (!smsRes.ok || smsData.Status !== "Success") {
      console.error("2Factor.in confirmation SMS error:", smsData);
      // Non-critical - don't throw, just log
      return new Response(JSON.stringify({ success: false, error: "SMS delivery failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Confirmation SMS sent to ${cleanPhone}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-confirmation-sms error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
