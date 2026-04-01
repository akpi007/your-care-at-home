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
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Phone and code required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find valid OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!otpRecord) {
      return new Response(JSON.stringify({ error: "Invalid or expired code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as verified
    await supabase.from("otp_codes").update({ verified: true }).eq("id", otpRecord.id);

    // Check if user exists with this phone
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.phone === phone);

    let session = null;
    let user = null;
    let isNewUser = false;

    if (existingUser) {
      // Sign in existing user by generating a magic link token
      const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: existingUser.email || `${phone.replace(/\+/g, "")}@phone.raphatelehealth.app`,
      });

      if (tokenError) throw tokenError;

      // Use the token to sign in
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenData.properties?.hashed_token || "",
        type: "magiclink",
      });

      if (verifyError) throw verifyError;
      session = verifyData.session;
      user = verifyData.user;
    } else {
      // Create new user
      const email = `${phone.replace(/\+/g, "")}@phone.raphatelehealth.app`;
      const password = crypto.randomUUID();

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        phone,
        password,
        email_confirm: true,
        phone_confirm: true,
      });

      if (createError) throw createError;
      user = newUser.user;
      isNewUser = true;

      // Sign in the new user
      const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

      if (tokenError) throw tokenError;

      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenData.properties?.hashed_token || "",
        type: "magiclink",
      });

      if (verifyError) throw verifyError;
      session = verifyData.session;
      user = verifyData.user;
    }

    // Clean up used OTP
    await supabase.from("otp_codes").delete().eq("phone", phone);

    return new Response(
      JSON.stringify({
        success: true,
        session,
        user,
        isNewUser,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("verify-otp error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
