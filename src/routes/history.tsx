import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { History as HistoryIcon, MessageSquare, FlaskConical, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { listThreads, deleteThread } from "@/lib/threads.functions";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — Aidesk" }, { name: "description", content: "Your past Aidesk chat and research conversations." }] }),
});

function HistoryPage() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["threads", "all"], queryFn: () => listThreads({ data: {} }) });
  const del = useMutation({
    mutationFn: (threadId: string) => deleteThread({ data: { threadId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      toast.success("Conversation deleted");
    },
  });

  const filtered = useMemo(
    () => (data ?? []).filter((t) => t.title.toLowerCase().includes(q.toLowerCase())),
    [data, q],
  );

  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-8">
      <PageHeader icon={HistoryIcon} title="History" description="All your Aidesk chat and research conversations." />
      <div className="mt-6 relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations..." className="pl-9" />
      </div>
      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No conversations yet. Start one from the Chatbot or Research Assistant.
          </Card>
        )}
        {filtered.map((t) => {
          const Icon = t.kind === "chat" ? MessageSquare : FlaskConical;
          return (
            <Card key={t.id} className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <Link
                to={t.kind === "chat" ? "/chat/$threadId" : "/research/$threadId"}
                params={{ threadId: t.id }}
                className="flex-1 min-w-0"
              >
                <div className="font-medium truncate text-sm">{t.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(t.updated_at).toLocaleString()}
                </div>
              </Link>
              <Badge variant="secondary" className="capitalize">{t.kind}</Badge>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (confirm("Delete this conversation?")) del.mutate(t.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}