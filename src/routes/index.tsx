import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import {
  Sparkles,
  Mail,
  Copy,
  Check,
  Loader2,
  Wand2,
  Zap,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Aidesk — Smart Email Generator" },
      {
        name: "description",
        content:
          "Draft professional workplace emails in seconds with AI. Pick a tone, describe the purpose, and let Aidesk write it for you.",
      },
    ],
  }),
});

type ToneKey =
  | "professional"
  | "friendly"
  | "concise"
  | "persuasive"
  | "apologetic"
  | "enthusiastic";
type LengthKey = "short" | "medium" | "long";

function Home() {
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<ToneKey>("professional");
  const [length, setLength] = useState<LengthKey>("medium");
  const [result, setResult] = useState<{ subject: string; body: string } | null>(
    null,
  );
  const [copied, setCopied] = useState<"subject" | "body" | "all" | null>(null);

  const mutation = useMutation({
    mutationFn: (input: {
      recipient: string;
      purpose: string;
      context: string;
      tone: ToneKey;
      length: LengthKey;
    }) => generateEmail({ data: input }),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Email drafted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate email");
    },
  });

  const handleGenerate = () => {
    if (!recipient.trim() || !purpose.trim()) {
      toast.error("Please fill in the recipient and purpose");
      return;
    }
    mutation.mutate({ recipient, purpose, context, tone, length });
  };

  const copy = async (kind: "subject" | "body" | "all") => {
    if (!result) return;
    const text =
      kind === "subject"
        ? result.subject
        : kind === "body"
          ? result.body
          : `Subject: ${result.subject}\n\n${result.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[var(--gradient-hero)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">Aidesk</div>
              <div className="text-xs text-muted-foreground -mt-0.5">
                Workplace productivity, powered by AI
              </div>
            </div>
          </div>
          <a
            href="#generator"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <Wand2 className="h-4 w-4" /> Open Generator
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Smart Email Generator — live
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground max-w-3xl mx-auto leading-[1.05]">
          Write the perfect work email in{" "}
          <span className="bg-[var(--gradient-hero)] bg-clip-text text-transparent">
            seconds
          </span>
          .
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Describe what you need to say. Aidesk drafts a polished, on-tone email you
          can send straight from your inbox.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          <Feature icon={Zap} label="Instant drafts" />
          <Feature icon={Clock} label="Save 30 min/day" />
          <Feature icon={ShieldCheck} label="Tone-controlled" />
        </div>
      </section>

      {/* Generator */}
      <section id="generator" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2 p-6 border-border/70 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Mail className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Describe your email</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  placeholder="e.g. My manager, Sarah from HR"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="purpose">What is the email about?</Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g. Ask for a deadline extension on the Q3 report due Friday"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-1.5 min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as ToneKey)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="apologetic">Apologetic</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Length</Label>
                  <Select
                    value={length}
                    onValueChange={(v) => setLength(v as LengthKey)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="context">Extra context (optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Names, deadlines, links, or specific points to include"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={mutation.isPending}
                className="w-full h-11 text-base bg-[var(--gradient-hero)] hover:opacity-95 text-primary-foreground shadow-[var(--shadow-elegant)] border-0"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Drafting…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" /> Generate email
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Result */}
          <Card className="lg:col-span-3 p-6 border-border/70 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Drafted email</h2>
              </div>
              {result && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copy("all")}
                  className="gap-1.5"
                >
                  {copied === "all" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copy all
                </Button>
              )}
            </div>

            {!result && !mutation.isPending && (
              <EmptyState />
            )}

            {mutation.isPending && <LoadingState />}

            {result && !mutation.isPending && (
              <div className="space-y-5">
                <Field
                  label="Subject"
                  value={result.subject}
                  onCopy={() => copy("subject")}
                  copied={copied === "subject"}
                >
                  <div className="font-medium text-foreground">
                    {result.subject}
                  </div>
                </Field>

                <Field
                  label="Body"
                  value={result.body}
                  onCopy={() => copy("body")}
                  copied={copied === "body"}
                >
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                    {result.body}
                  </div>
                </Field>
              </div>
            )}
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Aidesk uses AI to generate drafts. Always review before sending.
        </p>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground/80">
      <Icon className="h-4 w-4 text-primary" /> {label}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border border-dashed border-border/70 bg-muted/30">
      <div className="h-12 w-12 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center mb-4 shadow-[var(--shadow-glow)]">
        <Mail className="h-6 w-6 text-primary-foreground" />
      </div>
      <p className="font-medium text-foreground">Your draft will appear here</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Fill in the details on the left and hit <em>Generate email</em>.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4 py-6">
      <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
      <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
      <div className="h-px bg-border my-2" />
      <div className="space-y-2.5">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-11/12 bg-muted rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

function Field({
  label,
  onCopy,
  copied,
  children,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="rounded-xl border border-border/70 bg-background px-4 py-3 text-[15px]">
        {children}
      </div>
    </div>
  );
}