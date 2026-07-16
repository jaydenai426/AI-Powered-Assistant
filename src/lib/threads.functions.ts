import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listThreads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ kind: z.enum(["chat", "research"]).optional() }).parse(data))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("threads")
      .select("id, kind, title, updated_at, created_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (data.kind) q = q.eq("kind", data.kind);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ threadId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: thread, error } = await context.supabase
      .from("threads")
      .select("id, kind, title, updated_at, created_at")
      .eq("id", data.threadId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!thread) return null;
    const { data: messages } = await context.supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    return { thread, messages: messages ?? [] };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ threadId: z.string().uuid(), title: z.string().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("threads")
      .update({ title: data.title })
      .eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ threadId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("threads").delete().eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });