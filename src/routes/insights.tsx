import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Mail, FileText, ListChecks, MessageSquare, FlaskConical, Clock, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getInsights } from "@/lib/insights.functions";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
  head: () => ({ meta: [{ title: "Productivity Insights — Aidesk" }, { name: "description", content: "See how much time Aidesk is saving you across email, meetings, tasks, chat and research." }] }),
});

const TOOL_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  email: { label: "Emails drafted", icon: Mail },
  meeting: { label: "Meetings summarized", icon: FileText },
  tasks: { label: "Task plans", icon: ListChecks },
  chat: { label: "Chat messages", icon: MessageSquare },
  research: { label: "Research briefs", icon: FlaskConical },
};

function InsightsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["insights"], queryFn: () => getInsights() });

  const totals = data?.totals ?? {};
  const days = data?.days ?? [];
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const hours = Math.floor((data?.minutesSaved ?? 0) / 60);
  const mins = (data?.minutesSaved ?? 0) % 60;

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
      <PageHeader icon={BarChart3} title="Productivity Insights" description="How much Aidesk is helping across your workspace, last 30 days." />

      {isLoading ? (
        <p className="text-sm text-muted-foreground mt-6">Loading…</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard icon={Zap} label="Total AI runs" value={data?.totalRuns ?? 0} sub="last 30 days" />
            <StatCard icon={Clock} label="Estimated time saved" value={`${hours}h ${mins}m`} sub="based on typical task times" />
            <StatCard icon={MessageSquare} label="Conversations" value={data?.threadCount ?? 0} sub="chat + research threads" />
          </div>

          <Card className="p-6 mt-6">
            <div className="text-sm font-medium mb-4">Activity — last 14 days</div>
            <div className="flex items-end gap-1.5 h-40">
              {days.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/70"
                    style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "6px" : "2px" }}
                    title={`${d.count} runs on ${d.date}`}
                  />
                  <div className="text-[9px] text-muted-foreground">{d.date.slice(5)}</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(TOOL_META).map(([k, m]) => (
              <Card key={k} className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{totals[k] ?? 0} runs</div>
                </div>
                <div className="text-lg font-semibold tabular-nums">{totals[k] ?? 0}</div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}