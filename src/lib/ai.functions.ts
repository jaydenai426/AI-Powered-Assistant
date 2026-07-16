import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// In-memory per-user rate limit to deter abuse of AI-backed endpoints.
// Note: Worker isolates may reset this; it's a deterrent, not a hard guarantee.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 15; // per user per minute per function
const DAILY_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const DAILY_LIMIT_MAX = 200;
const buckets = new Map<string, { count: number; resetAt: number }>();

function hit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

function enforceRateLimit(scope: string, userId: string) {
  if (!hit(`${scope}:m:${userId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }
  if (!hit(`${scope}:d:${userId}`, DAILY_LIMIT_MAX, DAILY_LIMIT_WINDOW_MS)) {
    throw new Error("Daily usage limit reached. Please try again tomorrow.");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logActivity(supabase: any, userId: string, tool: string, meta: Record<string, unknown> = {}) {
  await supabase.from("activity_events").insert({ user_id: userId, tool, meta });
}

const EmailInputSchema = z.object({
  recipient: z.string().min(1).max(200),
  purpose: z.string().min(1).max(2000),
  tone: z.enum(["professional", "friendly", "concise", "persuasive", "apologetic", "enthusiastic"]),
  length: z.enum(["short", "medium", "long"]),
  context: z.string().max(2000).optional().default(""),
});

async function callGateway(system: string, user: string, opts: { json?: boolean } = { json: true }) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in your workspace.");
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "";
  if (!opts.json) return content;
  try {
    return JSON.parse(content);
  } catch {
    return JSON.parse(content.replace(/```json|```/g, "").trim());
  }
}

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => EmailInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    enforceRateLimit("email", context.userId);
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

    const parsed = await callGateway(system, user);
    await logActivity(context.supabase, context.userId, "email", { tone: data.tone, length: data.length });
    return {
      subject: String(parsed.subject ?? ""),
      body: String(parsed.body ?? ""),
    };
  });

const MeetingInputSchema = z.object({
  notes: z.string().min(20).max(20000),
  focus: z.string().max(500).optional().default(""),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => MeetingInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    enforceRateLimit("meeting", context.userId);
    const system = `You are an expert meeting notes summarizer for busy professionals.
Respond in strict JSON only, no markdown, no code fences. Shape:
{
  "title": string,                 // short meeting title
  "tldr": string,                  // 2-3 sentence executive summary
  "keyPoints": string[],           // 3-7 crisp bullet points
  "decisions": string[],           // decisions made (may be empty)
  "actionItems": [ { "task": string, "owner": string, "due": string } ], // owner/due "" if unknown
  "risks": string[]                // open risks or follow-ups
}`;
    const user = `Summarize the following meeting notes.${data.focus ? ` Focus on: ${data.focus}.` : ""}

NOTES:
${data.notes}`;
    const parsed = await callGateway(system, user);
    await logActivity(context.supabase, context.userId, "meeting", { chars: data.notes.length });
    return {
      title: String(parsed.title ?? "Meeting Summary"),
      tldr: String(parsed.tldr ?? ""),
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(String) : [],
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions.map(String) : [],
      actionItems: Array.isArray(parsed.actionItems)
        ? parsed.actionItems.map((a: { task?: unknown; owner?: unknown; due?: unknown }) => ({
            task: String(a?.task ?? ""),
            owner: String(a?.owner ?? ""),
            due: String(a?.due ?? ""),
          }))
        : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
    };
  });

const TaskInputSchema = z.object({
  goal: z.string().min(3).max(1000),
  context: z.string().max(2000).optional().default(""),
  horizon: z.enum(["today", "week", "sprint", "month"]),
});

export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => TaskInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    enforceRateLimit("tasks", context.userId);
    const horizonGuide = {
      today: "a single focused workday (aim for 4-6 tasks)",
      week: "one work week (aim for 6-10 tasks grouped logically)",
      sprint: "a two-week sprint (aim for 8-14 tasks with clear sequencing)",
      month: "a full month (aim for 10-16 milestone-driven tasks)",
    }[data.horizon];
    const system = `You are an expert AI task planner for workplace productivity.
Break the user's goal into concrete, actionable tasks. Respond in strict JSON only, shape:
{
  "plan": string,                                          // 1-2 sentence framing of the plan
  "tasks": [
    {
      "title": string,
      "description": string,                               // 1 sentence, actionable
      "priority": "high" | "medium" | "low",
      "estimate": string,                                  // e.g. "30 min", "2 h", "half day"
      "category": string                                   // e.g. "Research", "Writing", "Meeting"
    }
  ]
}
Order tasks by recommended execution order.`;
    const user = `Goal: ${data.goal}
Time horizon: ${horizonGuide}
${data.context ? `Extra context: ${data.context}` : ""}`;
    const parsed = await callGateway(system, user);
    await logActivity(context.supabase, context.userId, "tasks", { horizon: data.horizon });
    const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    return {
      plan: String(parsed.plan ?? ""),
      tasks: rawTasks.map((t: { title?: unknown; description?: unknown; priority?: unknown; estimate?: unknown; category?: unknown }) => ({
        title: String(t?.title ?? ""),
        description: String(t?.description ?? ""),
        priority: (["high", "medium", "low"].includes(String(t?.priority)) ? String(t?.priority) : "medium") as "high" | "medium" | "low",
        estimate: String(t?.estimate ?? ""),
        category: String(t?.category ?? "General"),
      })),
    };
  });

// ---------- Chat & Research ----------

const SendMessageSchema = z.object({
  threadId: z.string().uuid().nullable().optional(),
  content: z.string().min(1).max(8000),
  kind: z.enum(["chat", "research"]),
});

const SYSTEM_PROMPTS = {
  chat: `You are Aidesk, a helpful, professional AI assistant for workplace productivity. Be concise, well-structured, and use markdown when helpful. Ask clarifying questions when a request is ambiguous. Never fabricate facts — say when you're unsure.`,
  research: `You are Aidesk Research, an AI research assistant. Produce structured, well-cited research briefs.
Format every answer in markdown with these sections when relevant:
**Summary** — 2-3 sentences.
**Key findings** — bullet list.
**Considerations / caveats** — bullet list of limitations.
**Suggested next steps** — 2-4 actionable follow-ups.
Be neutral, evidence-oriented, and explicit about uncertainty. You do not have live web access — advise the user to verify time-sensitive facts.`,
} as const;

async function callGatewayMessages(messages: Array<{ role: string; content: string }>) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in your workspace.");
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SendMessageSchema.parse(data))
  .handler(async ({ data, context }) => {
    enforceRateLimit(`msg:${data.kind}`, context.userId);
    const { supabase, userId } = context;

    // Ensure thread
    let threadId = data.threadId ?? null;
    if (!threadId) {
      const title = data.content.slice(0, 60).trim() || "New conversation";
      const { data: t, error } = await supabase
        .from("threads")
        .insert({ user_id: userId, kind: data.kind, title })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      threadId = t.id;
    } else {
      // Verify ownership + kind
      const { data: t, error } = await supabase
        .from("threads")
        .select("id, kind")
        .eq("id", threadId)
        .maybeSingle();
      if (error || !t) throw new Error("Thread not found");
      if (t.kind !== data.kind) throw new Error("Thread kind mismatch");
    }

    // Load history
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    // Insert user message
    await supabase.from("messages").insert({
      thread_id: threadId,
      user_id: userId,
      role: "user",
      content: data.content,
    });

    const messages = [
      { role: "system", content: SYSTEM_PROMPTS[data.kind] },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: data.content },
    ];

    const reply = await callGatewayMessages(messages);

    await supabase.from("messages").insert({
      thread_id: threadId,
      user_id: userId,
      role: "assistant",
      content: reply,
    });
    await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
    await logActivity(supabase, userId, data.kind, { threadId });

    return { threadId, reply };
  });