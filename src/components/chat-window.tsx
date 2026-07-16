import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Loader2, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getThread } from "@/lib/threads.functions";
import { sendChatMessage } from "@/lib/ai.functions";
import { AiDisclaimer } from "./ai-disclaimer";

export function ChatWindow({ threadId, kind }: { threadId: string; kind: "chat" | "research" }) {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => getThread({ data: { threadId } }),
  });

  const mutation = useMutation({
    mutationFn: (content: string) => sendChatMessage({ data: { threadId, content, kind } }),
    onMutate: (content) => setPending(content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thread", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
      setPending(null);
    },
    onError: (e) => {
      setPending(null);
      toast.error(e instanceof Error ? e.message : "Failed to send");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [data, pending, mutation.isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, mutation.isPending]);

  const messages = data?.messages ?? [];

  function send() {
    const v = input.trim();
    if (!v || mutation.isPending) return;
    setInput("");
    mutation.mutate(v);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-6 space-y-6">
          {isLoading && <div className="text-sm text-muted-foreground">Loading conversation…</div>}
          {!isLoading && messages.length === 0 && !pending && (
            <div className="text-sm text-muted-foreground text-center py-16">
              Send a message to start the conversation.
            </div>
          )}
          {messages.map((m) => (
            <MessageRow key={m.id} role={m.role} content={m.content} />
          ))}
          {pending && <MessageRow role="user" content={pending} />}
          {mutation.isPending && (
            <div className="flex gap-3">
              <Avatar role="assistant" />
              <div className="text-sm text-muted-foreground pt-1.5 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-3">
          <div className="rounded-xl border border-border bg-background shadow-sm p-2 flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={kind === "chat" ? "Message Aidesk..." : "Ask a research question..."}
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 resize-none min-h-[36px] max-h-40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button size="icon" disabled={!input.trim() || mutation.isPending} onClick={send}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <AiDisclaimer variant="inline" />
        </div>
      </div>
    </div>
  );
}

function Avatar({ role }: { role: string }) {
  if (role === "user") {
    return (
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-[var(--gradient-hero)] flex items-center justify-center shrink-0 shadow-[var(--shadow-elegant)]">
      <Sparkles className="h-4 w-4 text-primary-foreground" />
    </div>
  );
}

function MessageRow({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className="flex gap-3">
      <Avatar role={role} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium mb-1 text-muted-foreground">
          {isUser ? "You" : "Aidesk"}
        </div>
        {isUser ? (
          <div className="inline-block rounded-2xl bg-primary text-primary-foreground px-3.5 py-2 text-sm whitespace-pre-wrap max-w-[85%]">
            {content}
          </div>
        ) : (
          <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}