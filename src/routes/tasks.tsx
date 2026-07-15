import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListChecks, Loader2, Wand2, Plus, Trash2, Copy, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { planTasks } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  head: () => ({
    meta: [
      { title: "AI Task Planner — Aidesk" },
      {
        name: "description",
        content:
          "Turn any goal into a sequenced, prioritized task plan with time estimates. Edit, reorder and check off tasks.",
      },
    ],
  }),
});

type Priority = "high" | "medium" | "low";
type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimate: string;
  category: string;
  done: boolean;
};
type Horizon = "today" | "week" | "sprint" | "month";

const priorityStyles: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-primary/10 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function TasksPage() {
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("week");
  const [plan, setPlan] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: { goal: string; context: string; horizon: Horizon }) =>
      planTasks({ data: input }),
    onSuccess: (data) => {
      setPlan(data.plan);
      setTasks(data.tasks.map((t) => ({ ...t, id: uid(), done: false })));
      toast.success("Plan ready");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to plan"),
  });

  const handleRun = () => {
    if (goal.trim().length < 3) {
      toast.error("Describe your goal");
      return;
    }
    mutation.mutate({ goal, context, horizon });
  };

  const update = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const add = () =>
    setTasks((prev) => [
      ...prev,
      { id: uid(), title: "", description: "", priority: "medium", estimate: "", category: "General", done: false },
    ]);
  const move = (id: string, dir: -1 | 1) => {
    setTasks((prev) => {
      const i = prev.findIndex((t) => t.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const copyAll = async () => {
    const md = [
      `# Plan for: ${goal}`,
      plan ? `\n${plan}\n` : "",
      ...tasks.map(
        (t, i) =>
          `${i + 1}. [${t.done ? "x" : " "}] **${t.title}** — _${t.priority}_ · ${t.estimate}${t.category ? ` · ${t.category}` : ""}${t.description ? `\n   ${t.description}` : ""}`,
      ),
    ].join("\n");
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const completed = tasks.filter((t) => t.done).length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <PageHeader
        icon={ListChecks}
        eyebrow="Planning"
        title="AI Task Planner"
        description="Describe a goal — Aidesk breaks it into sequenced, prioritized tasks with time estimates you can edit and check off."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <Card className="lg:col-span-2 p-6 border-border/70 shadow-sm">
          <h2 className="font-semibold mb-4">Describe your goal</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                placeholder="e.g. Launch a customer feedback survey and share findings with the team"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-1.5 min-h-24"
              />
            </div>
            <div>
              <Label>Time horizon</Label>
              <Select value={horizon} onValueChange={(v) => setHorizon(v as Horizon)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="sprint">Two-week sprint</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ctx">Context (optional)</Label>
              <Textarea
                id="ctx"
                placeholder="Constraints, tools, stakeholders, existing progress…"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-1.5 min-h-20"
              />
            </div>
            <Button
              onClick={handleRun}
              disabled={mutation.isPending}
              className="w-full h-11 bg-[var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-elegant)] border-0 hover:opacity-95"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Planning…</>
              ) : (
                <><Wand2 className="h-4 w-4 mr-2" /> Generate plan</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6 border-border/70 shadow-sm">
          <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
            <div className="min-w-0">
              <h2 className="font-semibold">Your plan <span className="text-xs text-muted-foreground font-normal ml-1">(editable)</span></h2>
              {tasks.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completed} / {tasks.length} completed
                </p>
              )}
            </div>
            {tasks.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={add} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add task
                </Button>
                <Button size="sm" variant="outline" onClick={copyAll} className="gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
            )}
          </div>

          {tasks.length === 0 && !mutation.isPending && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border border-dashed border-border/70 bg-muted/30">
              <div className="h-12 w-12 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center mb-4 shadow-[var(--shadow-glow)]">
                <ListChecks className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="font-medium">Your task plan will appear here</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">Describe a goal on the left and hit generate.</p>
            </div>
          )}

          {mutation.isPending && (
            <div className="space-y-2 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/60 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {tasks.length > 0 && !mutation.isPending && (
            <div className="space-y-4">
              {plan && (
                <Textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="min-h-16 bg-muted/30 text-sm"
                />
              )}
              <ul className="space-y-2">
                {tasks.map((t, i) => (
                  <li
                    key={t.id}
                    className={cn(
                      "rounded-xl border border-border/70 bg-background p-3 transition",
                      t.done && "opacity-60",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <button
                          onClick={() => move(t.id, -1)}
                          disabled={i === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <GripVertical className="h-4 w-4 rotate-90" />
                        </button>
                      </div>
                      <Checkbox
                        checked={t.done}
                        onCheckedChange={(v) => update(t.id, { done: !!v })}
                        className="mt-2"
                      />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex gap-2 items-center flex-wrap">
                          <Input
                            value={t.title}
                            onChange={(e) => update(t.id, { title: e.target.value })}
                            className={cn("font-medium flex-1 min-w-40", t.done && "line-through")}
                            placeholder="Task title"
                          />
                          <Select value={t.priority} onValueChange={(v) => update(t.id, { priority: v as Priority })}>
                            <SelectTrigger className={cn("w-28 border", priorityStyles[t.priority])}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea
                          value={t.description}
                          onChange={(e) => update(t.id, { description: e.target.value })}
                          className="min-h-10 py-2 text-sm"
                          rows={2}
                          placeholder="Description"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={t.estimate}
                            onChange={(e) => update(t.id, { estimate: e.target.value })}
                            placeholder="Estimate (e.g. 1 h)"
                            className="h-8 text-xs"
                          />
                          <Input
                            value={t.category}
                            onChange={(e) => update(t.id, { category: e.target.value })}
                            placeholder="Category"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => move(t.id, 1)}
                          disabled={i === tasks.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1"
                          aria-label="Move down"
                        >
                          <GripVertical className="h-4 w-4 -rotate-90" />
                        </button>
                        <Button size="icon" variant="ghost" onClick={() => remove(t.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}