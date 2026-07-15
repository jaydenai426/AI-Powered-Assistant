import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  recipient: z.string().min(1).max(200),
  purpose: z.string().min(1).max(2000),
  tone: z.enum(["professional", "friendly", "concise", "persuasive", "apologetic", "enthusiastic"]),
  length: z.enum(["short", "medium", "long"]),
  context: z.string().max(2000).optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const lengthGuide = {
      short: "2-3 sentences",
      medium: "1-2 short paragraphs",
      long: "3-4 well-developed paragraphs",
    }[data.length];

    const system = `You are an expert workplace communication assistant. Write clear, effective emails.
Always respond in strict JSON with keys: "subject" (string), "body" (string).
Do not include any markdown, code fences, or extra commentary.
The body should use \\n\\n between paragraphs and end with a sign-off like "Best," (leave the name blank).`;

    const user = `Write an email with the following details:
- Recipient: ${data.recipient}
- Tone: ${data.tone}
- Length: ${lengthGuide}
- Purpose: ${data.purpose}
${data.context ? `- Additional context: ${data.context}` : ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in your workspace.");
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";

    let parsed: { subject: string; body: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      // Fallback: strip fences if any and retry
      const cleaned = content.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return {
      subject: String(parsed.subject ?? ""),
      body: String(parsed.body ?? ""),
    };
  });