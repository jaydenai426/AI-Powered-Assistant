import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, ArrowRight, Zap, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Aidesk" },
      { name: "description", content: "Your AI workplace productivity dashboard. Draft emails, summarize meetings and plan tasks in one place." },
    ],
  }),
});

const tools = [
  {
    to: "/email" as const,
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Draft polished, on-tone emails in seconds. Choose a tone, describe the purpose, edit and copy.",
    cta: "Draft an email",
  },
  {
    to: "/meetings" as const,
    icon: FileText,
    title: "Meeting Notes Summarizer",
    desc: "Turn raw notes into a TL;DR, decisions, action items and risks — all editable.",
    cta: "Summarize a meeting",
  },
  {
    to: "/tasks" as const,
    icon: ListChecks,
    title: "AI Task Planner",
    desc: "Break any goal into a sequenced, prioritized task plan with time estimates.",
    cta: "Plan a goal",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs text-muted-foreground mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Workplace productivity, powered by AI
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight">
          Do your best work in{" "}
          <span className="bg-[var(--gradient-hero)] bg-clip-text text-transparent">a fraction of the time</span>.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Aidesk is your AI-powered assistant for the everyday workplace tasks that eat your day.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          <Stat icon={Zap} label="Instant drafts" />
          <Stat icon={Clock} label="Save hours/week" />
          <Stat icon={ShieldCheck} label="You stay in control" />
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Card className="p-6 h-full border-border/70 shadow-sm transition hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 hover:border-primary/30">
              <div className="h-11 w-11 rounded-xl bg-[var(--gradient-hero)] flex items-center justify-center shadow-[var(--shadow-elegant)] mb-4">
                <t.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg tracking-tight">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{t.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                {t.cta} <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-12">
        <Card className="p-6 border-border/70 shadow-sm bg-background/60">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold">Getting started</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pick a tool from the sidebar. Every AI output is fully editable — refine tone,
                add owners to action items, reorder tasks. Nothing is sent until you copy it.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground/80">
      <Icon className="h-4 w-4 text-primary" /> {label}
    </div>
  );
}