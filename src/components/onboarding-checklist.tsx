import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Check, Circle, ArrowRight, Rocket } from "lucide-react";
import { getInsights } from "@/lib/insights.functions";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "email", to: "/email" as const, label: "Draft your first email" },
  { key: "meeting", to: "/meetings" as const, label: "Summarize a meeting" },
  { key: "tasks", to: "/tasks" as const, label: "Plan a goal" },
  { key: "chat", to: "/chat" as const, label: "Ask the chatbot anything" },
  { key: "research", to: "/research" as const, label: "Run a research brief" },
];

export function OnboardingChecklist() {
  const { data } = useQuery({ queryKey: ["insights"], queryFn: () => getInsights() });
  const totals = data?.totals ?? {};
  const done = STEPS.filter((s) => (totals[s.key] ?? 0) > 0).length;
  const pct = Math.round((done / STEPS.length) * 100);

  if (done === STEPS.length) return null;

  return (
    <Card className="p-6 border-border/70 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-[var(--gradient-hero)] flex items-center justify-center shrink-0 shadow-[var(--shadow-elegant)]">
          <Rocket className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold">Get started with Aidesk</h3>
            <span className="text-xs text-muted-foreground">{done} / {STEPS.length} · {pct}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-[var(--gradient-hero)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {STEPS.map((s) => {
          const complete = (totals[s.key] ?? 0) > 0;
          return (
            <li key={s.key}>
              <Link
                to={s.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition group",
                  complete ? "text-muted-foreground" : "hover:bg-muted/60",
                )}
              >
                {complete ? (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={cn("flex-1 min-w-0 truncate", complete && "line-through")}>{s.label}</span>
                {!complete && (
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}