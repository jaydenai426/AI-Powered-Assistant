import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Send, Loader2, MessageSquare, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { sendChatMessage } from "@/lib/ai.functions";
import { AiDisclaimer } from "./ai-disclaimer";

const SUGGESTIONS: Record<"chat" | "research", string[]> = {
  chat: [
    "Draft a Slack message declining a meeting politely",
    "Explain OKRs vs KPIs with an example",
    "Rewrite this in a more concise, executive tone",
  ],
  research: [
    "Research brief on remote-first hiring best practices",
    "Compare project management methodologies for a 6-person team",
    "Pros and cons of switching from Jira to Linear",
  ],
};

export function NewChatComposer({ kind }: { kind: "chat" | "research" }) {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (content: string) => sendChatMessage({ data: { threadId: null, content, kind } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({
        to: kind === "chat" ? "/chat/$threadId" : "/research/$threadId",
        params: { threadId: res.threadId },
      });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to send"),
  });

  const Icon = kind === "chat" ? MessageSquare : FlaskConical;
  const title = kind === "chat" ? "AI Chatbot" : "AI Research Assistant";
  const subtitle =
    kind === "chat"
      ? "Ask anything. Aidesk keeps context across the conversation."
      : "Ask a question. Get a structured brief with findings, caveats and next steps.";

  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-10 flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      </div>

      <Card className="p-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={kind === "chat" ? "Message Aidesk..." : "What should I research?"}
          rows={4}
          className="border-0 shadow-none focus-visible:ring-0 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && input.trim() && !mutation.isPending) {
              mutation.mutate(input.trim());
            }
          }}
          autoFocus
        />
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-muted-foreground">⌘/Ctrl + Enter to send</span>
          <Button size="sm" disabled={!input.trim() || mutation.isPending} onClick={() => mutation.mutate(input.trim())}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SUGGESTIONS[kind].map((s) => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="text-left text-xs rounded-lg border border-border/70 bg-background/60 hover:bg-muted p-3 transition"
          >
            {s}
          </button>
        ))}
      </div>

      <AiDisclaimer />
    </div>
  );
}