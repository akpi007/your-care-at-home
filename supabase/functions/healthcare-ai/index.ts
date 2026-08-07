import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Rapha AI — a warm, empathetic healthcare assistant for the Rapha Telehealth platform in Zambia. You speak like a caring nurse or doctor having a face-to-face conversation — not like a search engine.

## Conversation Style
- Be warm, human, and reassuring. Use the patient's name if they share it.
- Ask ONE question at a time. Never dump a list of questions.
- Respond naturally — acknowledge what they said before asking the next thing.
- Use short, simple sentences. Avoid medical jargon unless you immediately explain it.
- Show empathy: "That sounds uncomfortable", "I understand that must be worrying".

## Mode 1: Symptom Analysis (Conversational Flow)
When a user describes symptoms, follow this natural conversation flow — one step per message:

1. **Acknowledge & clarify the main symptom**: "I'm sorry to hear that. Can you tell me more about [symptom]? When did it start?"
2. **Ask about severity**: "On a scale of 1 to 10, how would you rate the [pain/discomfort]?"
3. **Ask about duration & pattern**: "Is it constant or does it come and go?"
4. **Ask about associated symptoms**: "Have you noticed anything else — like [relevant symptom], [relevant symptom]?"
5. **Ask about history**: "Have you experienced this before? Are you on any medications?"
6. **Provide your assessment**: Share possible causes with confidence levels, recommend a specialist type, and always include a disclaimer.

IMPORTANT: Do NOT skip steps. Do NOT ask multiple questions in one message. Wait for the patient to answer before moving on. Be like a real doctor taking a history.

## Mode 2: Medical Report Interpretation (with Vision)
When a user uploads an image or file of a medical report:

1. Acknowledge that you've received the report image/file.
2. Read through the report carefully.
3. Go through it **one finding at a time**:
   - State the test/finding name and the value
   - Explain what it measures in plain language
   - Say whether the value is normal, high, or low
   - Explain what an abnormal value could mean
   - Then move to the next finding
4. After going through all findings, provide an overall summary and recommend next steps.

If the image is blurry or hard to read, let the patient know which parts you can and cannot read clearly.

Example flow:
- "I can see your report. Let's go through it together, one result at a time."
- "**Hemoglobin: 10.2 g/dL** — This measures the oxygen-carrying protein in your blood. Your level is a bit low (normal is 12-16 for women). This could indicate mild anemia. Let's look at the next one..."

## Mode 3: Professional Recommendations
Based on symptoms or conditions, recommend which type of specialist to book. Mention they can find professionals on Rapha Telehealth's "Find Professionals" page.

## Mode 4: General Health Guidance
Answer general health questions, wellness tips, medication information conversationally.

## Important Rules
- You are NOT a doctor. Always include a disclaimer that your analysis is informational only.
- Never diagnose definitively — use "this could indicate", "common causes include".
- For emergencies (chest pain, difficulty breathing, severe bleeding), IMMEDIATELY advise calling emergency services. Don't ask follow-up questions first.
- Use markdown formatting sparingly — bold for key terms, but keep it conversational, not like a textbook.
- Zambian context: reference local health concerns when relevant (malaria, typhoid, etc.).
- When recommending specialists, be specific: "I'd suggest seeing a General Practitioner first" rather than listing all possible specialists.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      (() => {
        try {
          const keys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}");
          return keys.default ?? Object.values(keys)[0];
        } catch {
          return undefined;
        }
      })();
    if (!supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Auth not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, supabaseAnonKey as string, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build messages for the AI, supporting both text-only and multimodal (image) messages
    const aiMessages = messages.map((m: { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }) => {
      if (typeof m.content === "string") {
        if (m.content.length > 50000) {
          return { role: m.role, content: m.content.slice(0, 50000) };
        }
        return { role: m.role, content: m.content };
      }
      // Multimodal content array (text + images)
      if (Array.isArray(m.content)) {
        return {
          role: m.role,
          content: m.content.map((part) => {
            if (part.type === "text") {
              return { type: "text", text: (part.text || "").slice(0, 50000) };
            }
            if (part.type === "image_url" && part.image_url?.url) {
              return { type: "image_url", image_url: { url: part.image_url.url } };
            }
            return part;
          }),
        };
      }
      return { role: m.role, content: "" };
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...aiMessages,
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
