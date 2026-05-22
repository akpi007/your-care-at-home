import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function randomPassword() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phone, code } = await req.json();
    if (!phone || !code || typeof phone !== "string" || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "Phone and code required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    // Find the most recent unused, unexpired code
    const { data: otpRows, error: fetchErr } = await admin
      .from("otp_codes")
      .select("*")
      .eq("phone", normalizedPhone)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchErr) throw fetchErr;
    const otp = otpRows?.[0];
    if (!otp) {
      return new Response(JSON.stringify({ error: "Code expired or not found. Please request a new code." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (otp.attempts >= 5) {
      await admin.from("otp_codes").update({ used: true }).eq("id", otp.id);
      return new Response(JSON.stringify({ error: "Too many attempts. Please request a new code." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (otp.code !== code) {
      await admin.from("otp_codes").update({ attempts: otp.attempts + 1 }).eq("id", otp.id);
      return new Response(JSON.stringify({ error: "Invalid verification code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark used
    await admin.from("otp_codes").update({ used: true }).eq("id", otp.id);

    // Find or create user by phone
    const password = randomPassword();
    let userId: string | null = null;

    // Search auth users for matching phone
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users?.find(
      (u: any) => u.phone === normalizedPhone.replace(/^\+/, "") || u.phone === normalizedPhone
    );

    if (existing) {
      userId = existing.id;
      const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        phone_confirm: true,
      });
      if (updErr) throw updErr;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        phone: normalizedPhone,
        password,
        phone_confirm: true,
      });
      if (createErr) throw createErr;
      userId = created.user?.id ?? null;
    }

    return new Response(
      JSON.stringify({ success: true, phone: normalizedPhone, password, userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("verify-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
