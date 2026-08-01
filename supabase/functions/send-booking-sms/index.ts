import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVENTS = [
  "new_request",
  "confirmed",
  "assigned",
  "on_the_way",
  "arrived",
  "completed",
  "cancelled",
] as const;

type Event = (typeof EVENTS)[number];

function patientMessage(event: Event, provider: string, when: string) {
  switch (event) {
    case "confirmed":
      return `Rapha: ${provider} confirmed your visit on ${when}.`;
    case "assigned":
      return `Rapha: ${provider} has been assigned to your visit on ${when}.`;
    case "on_the_way":
      return `Rapha: ${provider} is on the way to you now.`;
    case "arrived":
      return `Rapha: ${provider} has arrived at your location.`;
    case "completed":
      return `Rapha: your visit with ${provider} is complete. Please leave a review in the app.`;
    case "cancelled":
      return `Rapha: your visit with ${provider} on ${when} was cancelled.`;
    default:
      return `Rapha: booking update for your visit on ${when}.`;
  }
}

async function sendSms(phone: string, message: string) {
  const key = Deno.env.get("TWO_FACTOR_API_KEY");
  if (!key || !phone) return { sent: false, reason: "not_configured" };
  const clean = phone.replace(/^\+/, "");
  if (!/^\d{8,15}$/.test(clean)) return { sent: false, reason: "invalid_phone" };

  const url =
    `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${key}` +
    `&to=${clean}&from=RAPHA&msg=${encodeURIComponent(message)}`;

  try {
    const res = await fetch(url, { method: "POST" });
    const text = await res.text();
    if (!res.ok) {
      console.error("SMS send failed", res.status, text);
      return { sent: false, reason: text.slice(0, 200) };
    }
    return { sent: true };
  } catch (e) {
    console.error("SMS transport error", e);
    return { sent: false, reason: "transport_error" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
    const event = body.event as Event;
    if (!bookingId || !EVENTS.includes(event)) {
      return new Response(JSON.stringify({ error: "bookingId and a valid event are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .select(
        "id, user_id, booking_date, booking_time, professional_id, professionals(user_id, display_name)",
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bErr || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const proUserId = (booking as any).professionals?.user_id ?? null;
    const providerName = (booking as any).professionals?.display_name ?? "your provider";

    if (user.id !== booking.user_id && user.id !== proUserId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const when = `${booking.booking_date} at ${String(booking.booking_time).slice(0, 5)}`;
    const targetUserId = event === "new_request" ? proUserId : booking.user_id;
    if (!targetUserId) {
      return new Response(JSON.stringify({ success: true, sms: { sent: false, reason: "no_recipient" } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const message =
      event === "new_request"
        ? `Rapha: you have a new booking request for ${when}. Open your dashboard to accept.`
        : patientMessage(event, providerName, when);

    const sms = await sendSms(profile?.phone ?? "", message);

    // Always mirror as an in-app notification so nothing is lost if SMS fails
    await admin.from("notifications").insert({
      user_id: targetUserId,
      title: event === "new_request" ? "New booking request" : "Booking update",
      body: message,
      type: "booking",
      link: event === "new_request" ? "/provider-dashboard" : "/dashboard",
    });

    return new Response(JSON.stringify({ success: true, sms }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-booking-sms error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
