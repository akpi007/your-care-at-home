import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication: only signed-in users may trigger an SMS ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const rawPhone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";

    // Strict E.164 validation
    if (!/^\+?[1-9]\d{7,14}$/.test(rawPhone)) {
      return json({ error: "Invalid phone number" }, 400);
    }
    const cleanPhone = rawPhone.replace(/^\+/, "");

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // --- Authorization: the phone must belong to the caller's own profile ---
    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("user_id", userId)
      .maybeSingle();

    const profilePhone = (profile?.phone ?? "").replace(/[^\d]/g, "");
    if (!profilePhone || !profilePhone.endsWith(cleanPhone.slice(-9))) {
      return json({ error: "Phone number does not belong to this account" }, 403);
    }

    // --- Rate limit: max 3 confirmation SMS per phone per hour ---
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("otp_codes")
      .select("id", { count: "exact", head: true })
      .eq("phone", cleanPhone)
      .gte("created_at", since);

    if ((count ?? 0) >= 3) {
      return json({ error: "Too many messages. Please try again later." }, 429);
    }

    const TWO_FACTOR_API_KEY = Deno.env.get("TWO_FACTOR_API_KEY");
    if (!TWO_FACTOR_API_KEY) {
      console.error("TWO_FACTOR_API_KEY is not configured");
      return json({ error: "Service unavailable" }, 503);
    }

    const confirmCode = "000000";
    const twoFactorUrl = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${cleanPhone}/${confirmCode}`;

    const smsRes = await fetch(twoFactorUrl, { method: "POST" });
    const smsData = await smsRes.json().catch(() => ({}));

    if (!smsRes.ok || smsData.Status !== "Success") {
      console.error("2Factor.in confirmation SMS error", { status: smsRes.status });
      return json({ success: false, error: "SMS delivery failed" });
    }

    // Record the send so it counts toward the rate limit window
    await admin.from("otp_codes").insert({
      phone: cleanPhone,
      code: confirmCode,
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
      used: true,
    });

    console.log("Confirmation SMS sent", { user: userId, greeted: Boolean(name) });

    return json({ success: true });
  } catch (error) {
    console.error("send-confirmation-sms error", error);
    return json({ error: "Something went wrong" }, 500);
  }
});
