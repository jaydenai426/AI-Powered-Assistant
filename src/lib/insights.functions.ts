import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TIME_SAVED_MIN: Record<string, number> = {
  email: 8, meeting: 15, tasks: 20, chat: 3, research: 12,
};

export const getInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: events } = await context.supabase
      .from("activity_events")
      .select("tool, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);

    const rows = events ?? [];
    const totals: Record<string, number> = {};
    for (const e of rows) totals[e.tool] = (totals[e.tool] ?? 0) + 1;

    const dayMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dayMap.set(d, 0);
    }
    for (const e of rows) {
      const d = e.created_at.slice(0, 10);
      if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
    }
    const days: { date: string; count: number }[] = [];
    for (const [date, count] of dayMap) days.push({ date, count });

    let minutesSaved = 0;
    for (const [tool, count] of Object.entries(totals)) minutesSaved += (TIME_SAVED_MIN[tool] ?? 5) * count;

    const { count: threadCount } = await context.supabase
      .from("threads")
      .select("id", { count: "exact", head: true });

    return {
      totals, totalRuns: rows.length, minutesSaved, days,
      threadCount: threadCount ?? 0,
      recent: rows.slice(0, 15),
    };
  });