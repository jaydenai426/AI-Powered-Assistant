import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Mail, Copy, Check, Loader2, Wand2 } from "lucide-react";
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
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/email")({
  component: EmailPage,
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Aidesk" },
      {
        name: "description",
        content:
          "Draft professional workplace emails in seconds. Pick a tone, describe the purpose, edit and copy.",
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

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<ToneKey>("professional");
  const [length, setLength] = useState<LengthKey>("medium");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hasResult, setHasResult] = useState(false);
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
      setSubject(data.subject);
      setBody(data.body);
      setHasResult(true);
      toast.success("Email drafted");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to generate email"),
  });

  const handleGenerate = () => {
    if (!recipient.trim() || !purpose.trim()) {
      toast.error("Please fill in the recipient and purpose");
      return;
    }
    mutation.mutate({ recipient, purpose, context, tone, length });
  };

  const copy = async (kind: "subject" | "body" | "all") => {
    const text =
      kind === "subject"
        ? subject
        : kind === "body"
          ? body
          : `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  const starters = [
    { r: "My manager", p: "Ask for a deadline extension on the Q3 report due Friday." },
    { r: "The team", p: "Announce a schedule change for tomorrow's stand-up." },
    { r: "A prospective customer", p: "Follow up after a product demo and propose next steps." },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <PageHeader
        icon={Mail}
        eyebrow="Communication"
        title="Smart Email Generator"
        description="Describe what you need to say — Aidesk drafts a polished, on-tone email you can edit and send."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
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
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
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
                <Select value={length} onValueChange={(v) => setLength(v as LengthKey)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
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
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Drafting…</>
              ) : (
                <><Wand2 className="h-4 w-4 mr-2" /> Generate email</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6 border-border/70 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Drafted email</h2>
              <span className="text-xs text-muted-foreground ml-1">(editable)</span>
            </div>
            {hasResult && (
              <Button size="sm" variant="outline" onClick={() => copy("all")} className="gap-1.5">
                {copied === "all" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy all
              </Button>
            )}
          </div>

          {!hasResult && !mutation.isPending && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border border-dashed border-border/70 bg-muted/30">
              <div className="h-12 w-12 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center mb-4 shadow-[var(--shadow-glow)]">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="font-medium text-foreground">Your draft will appear here</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Fill in the details on the left and hit <em>Generate email</em>.
              </p>
              <div className="mt-5 w-full max-w-sm space-y-1.5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Or try a starter</p>
                {starters.map((s) => (
                  <button
                    key={s.p}
                    onClick={() => { setRecipient(s.r); setPurpose(s.p); }}
                    className="w-full text-left text-xs rounded-lg border border-border/70 bg-background/70 hover:bg-muted p-2.5 transition"
                  >
                    <span className="font-medium">{s.r}</span> — {s.p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mutation.isPending && (
            <div className="space-y-3 py-4">
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
              <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-px bg-border my-2" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-11/12 bg-muted rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
            </div>
          )}

          {hasResult && !mutation.isPending && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Subject</Label>
                  <button onClick={() => copy("subject")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
                    {copied === "subject" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                </div>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="font-medium" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Body</Label>
                  <button onClick={() => copy("body")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
                    {copied === "body" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                </div>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-72 leading-relaxed" />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}