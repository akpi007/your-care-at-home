import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

## Mode 2: Medical Report Interpretation
When a user wants help understanding a medical report:

1. First, ask them to upload the report file or paste/type the results.
2. Once you receive the report content, go through it **one finding at a time**:
   - State the test/finding name and the value
   - Explain what it measures in plain language
   - Say whether the value is normal, high, or low
   - Explain what an abnormal value could mean
   - Then move to the next finding
3. After going through all findings, provide an overall summary and recommend next steps.

Example flow:
- "Let's look at your results one by one."
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
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const msg of messages) {
      if (typeof msg.content !== "string" || msg.content.length > 50000) {
        return new Response(
          JSON.stringify({ error: "Each message must be a string under 50,000 characters" }),
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
            content: m.content.slice(0, 50000),
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
