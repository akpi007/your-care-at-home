import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Rapha AI — a friendly, knowledgeable healthcare assistant for the Rapha Telehealth platform in Zambia.

Your capabilities:
1. **Symptom Analysis**: When a user describes symptoms, ask clarifying questions (duration, severity, associated symptoms), then provide possible conditions with confidence levels. Always recommend seeing a professional.
2. **Medical Report Interpretation**: When a user shares lab results or medical report data, identify abnormal values, explain medical terms in simple language, and highlight concerns.
3. **Professional Recommendations**: Based on symptoms or conditions, recommend which type of specialist the user should book (e.g., General Practitioner, Cardiologist, Dermatologist). Mention they can find professionals on Rapha Telehealth's "Find Professionals" page.
4. **General Health Guidance**: Answer general health questions, wellness tips, medication information.

Important rules:
- You are NOT a doctor. Always include a disclaimer that your analysis is informational only and not a substitute for professional medical advice.
- Never diagnose definitively — use language like "this could indicate", "common causes include", "you may want to consider".
- For emergencies (chest pain, difficulty breathing, severe bleeding, etc.), immediately advise calling emergency services or visiting the nearest hospital.
- Be empathetic, warm, and encouraging.
- Use markdown formatting for readability (headers, bullet points, bold for key terms).
- When recommending specialists, format them clearly so users know who to look for on Rapha Telehealth.
- Zambian context: reference local health concerns when relevant (malaria, typhoid, etc.).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate message content length
    for (const msg of messages) {
      if (typeof msg.content !== "string" || msg.content.length > 10000) {
        return new Response(
          JSON.stringify({ error: "Each message must be a string under 10,000 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content.slice(0, 10000),
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("healthcare-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
