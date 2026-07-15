import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Loader2, Wand2, Plus, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { summarizeMeeting } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/meetings")({
  component: MeetingsPage,
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Aidesk" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into an executive TL;DR, decisions, action items and risks with AI.",
      },
    ],
  }),
});

type ActionItem = { task: string; owner: string; due: string };
type Summary = {
  title: string;
  tldr: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  risks: string[];
};

const SAMPLE = `Project Atlas weekly sync — Tue 10:00
Attendees: Priya (PM), Marco (Eng), Elena (Design), Sam (QA)

- Priya: Beta launch slipping by 5 days due to auth bug.
- Marco: Root cause in refresh token rotation. Fix ETA Thursday.
- Elena: New onboarding flow ready for review, needs copy from marketing by Fri.
- Sam: QA blocked on staging outage. Ops ticket opened.
Decisions:
- Push public beta to Aug 28.
- Cut "team invites" from launch scope, ship in v1.1.
Follow-ups: Priya to email stakeholders. Marco to write postmortem after fix.`;

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: { notes: string; focus: string }) => summarizeMeeting({ data: input }),
    onSuccess: (data) => {
      setSummary(data);
      toast.success("Meeting summarized");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to summarize"),
  });

  const handleRun = () => {
    if (notes.trim().length < 20) {
      toast.error("Paste at least a few lines of notes");
      return;
    }
    mutation.mutate({ notes, focus });
  };

  const updateList = (key: "keyPoints" | "decisions" | "risks", i: number, value: string) => {
    if (!summary) return;
    const next = [...summary[key]];
    next[i] = value;
    setSummary({ ...summary, [key]: next });
  };
  const removeFromList = (key: "keyPoints" | "decisions" | "risks", i: number) => {
    if (!summary) return;
    setSummary({ ...summary, [key]: summary[key].filter((_, idx) => idx !== i) });
  };
  const addToList = (key: "keyPoints" | "decisions" | "risks") => {
    if (!summary) return;
    setSummary({ ...summary, [key]: [...summary[key], ""] });
  };

  const updateAction = (i: number, patch: Partial<ActionItem>) => {
    if (!summary) return;
    const next = [...summary.actionItems];
    next[i] = { ...next[i], ...patch };
    setSummary({ ...summary, actionItems: next });
  };
  const addAction = () => {
    if (!summary) return;
    setSummary({ ...summary, actionItems: [...summary.actionItems, { task: "", owner: "", due: "" }] });
  };
  const removeAction = (i: number) => {
    if (!summary) return;
    setSummary({ ...summary, actionItems: summary.actionItems.filter((_, idx) => idx !== i) });
  };

  const copyAll = async () => {
    if (!summary) return;
    const md = [
      `# ${summary.title}`,
      ``,
      `**TL;DR** ${summary.tldr}`,
      ``,
      `## Key points`,
      ...summary.keyPoints.map((p) => `- ${p}`),
      ``,
      `## Decisions`,
      ...summary.decisions.map((p) => `- ${p}`),
      ``,
      `## Action items`,
      ...summary.actionItems.map((a) => `- [ ] ${a.task}${a.owner ? ` — @${a.owner}` : ""}${a.due ? ` (${a.due})` : ""}`),
      ``,
      `## Risks / follow-ups`,
      ...summary.risks.map((p) => `- ${p}`),
    ].join("\n");
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <PageHeader
        icon={FileText}
        eyebrow="Meetings"
        title="Meeting Notes Summarizer"
        description="Paste your raw notes or transcript. Aidesk extracts a TL;DR, decisions, action items and risks — all editable."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <Card className="lg:col-span-2 p-6 border-border/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Raw notes</h2>
            <button
              onClick={() => setNotes(SAMPLE)}
              className="text-xs text-primary hover:underline"
            >
              Load sample
            </button>
          </div>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste meeting notes or transcript here…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-72 font-mono text-sm"
            />
            <div>
              <Label htmlFor="focus">Focus (optional)</Label>
              <Input
                id="focus"
                placeholder="e.g. Focus on engineering blockers"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button
              onClick={handleRun}
              disabled={mutation.isPending}
              className="w-full h-11 bg-[var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-elegant)] border-0 hover:opacity-95"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Summarizing…</>
              ) : (
                <><Wand2 className="h-4 w-4 mr-2" /> Summarize meeting</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6 border-border/70 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Summary <span className="text-xs text-muted-foreground font-normal ml-1">(editable)</span></h2>
            {summary && (
              <Button size="sm" variant="outline" onClick={copyAll} className="gap-1.5">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy as Markdown
              </Button>
            )}
          </div>

          {!summary && !mutation.isPending && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border border-dashed border-border/70 bg-muted/30">
              <div className="h-12 w-12 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center mb-4 shadow-[var(--shadow-glow)]">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="font-medium">Your structured summary will appear here</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">Paste notes on the left and hit summarize.</p>
            </div>
          )}

          {mutation.isPending && (
            <div className="space-y-3 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${60 + ((i * 7) % 40)}%` }} />
              ))}
            </div>
          )}

          {summary && !mutation.isPending && (
            <div className="space-y-6">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title</Label>
                <Input
                  value={summary.title}
                  onChange={(e) => setSummary({ ...summary, title: e.target.value })}
                  className="mt-1.5 font-semibold"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">TL;DR</Label>
                <Textarea
                  value={summary.tldr}
                  onChange={(e) => setSummary({ ...summary, tldr: e.target.value })}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <EditableList
                label="Key points"
                items={summary.keyPoints}
                onChange={(i, v) => updateList("keyPoints", i, v)}
                onRemove={(i) => removeFromList("keyPoints", i)}
                onAdd={() => addToList("keyPoints")}
              />
              <EditableList
                label="Decisions"
                items={summary.decisions}
                onChange={(i, v) => updateList("decisions", i, v)}
                onRemove={(i) => removeFromList("decisions", i)}
                onAdd={() => addToList("decisions")}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Action items</Label>
                  <Button size="sm" variant="ghost" onClick={addAction} className="h-7 gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {summary.actionItems.map((a, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto] gap-2 items-start rounded-lg border border-border/70 p-2 bg-background">
                      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-2 min-w-0">
                        <Input placeholder="Task" value={a.task} onChange={(e) => updateAction(i, { task: e.target.value })} />
                        <Input placeholder="Owner" value={a.owner} onChange={(e) => updateAction(i, { owner: e.target.value })} />
                        <Input placeholder="Due" value={a.due} onChange={(e) => updateAction(i, { due: e.target.value })} />
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeAction(i)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {summary.actionItems.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No action items.</p>
                  )}
                </div>
              </div>

              <EditableList
                label="Risks / follow-ups"
                items={summary.risks}
                onChange={(i, v) => updateList("risks", i, v)}
                onRemove={(i) => removeFromList("risks", i)}
                onAdd={() => addToList("risks")}
              />

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                <Badge variant="secondary">{summary.keyPoints.length} points</Badge>
                <Badge variant="secondary">{summary.decisions.length} decisions</Badge>
                <Badge variant="secondary">{summary.actionItems.length} actions</Badge>
                <Badge variant="secondary">{summary.risks.length} risks</Badge>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function EditableList({
  label,
  items,
  onChange,
  onRemove,
  onAdd,
}: {
  label: string;
  items: string[];
  onChange: (i: number, v: string) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
        <Button size="sm" variant="ghost" onClick={onAdd} className="h-7 gap-1 text-xs">
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-2 items-start">
            <Textarea
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              className="min-h-10 py-2"
              rows={2}
            />
            <Button size="icon" variant="ghost" onClick={() => onRemove(i)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-muted-foreground italic">None.</p>}
      </div>
    </div>
  );
}