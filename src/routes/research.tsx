import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listThreads } from "@/lib/threads.functions";
import { NewChatComposer } from "@/components/new-chat-composer";

export const Route = createFileRoute("/research")({
  component: ResearchIndex,
  head: () => ({ meta: [{ title: "AI Research Assistant — Aidesk" }, { name: "description", content: "Structured research briefs with an AI research assistant." }] }),
});

function ResearchIndex() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["threads", "research"], queryFn: () => listThreads({ data: { kind: "research" } }) });
  useEffect(() => {
    if (data && data.length > 0) {
      navigate({ to: "/research/$threadId", params: { threadId: data[0].id }, replace: true });
    }
  }, [data, navigate]);
  return <NewChatComposer kind="research" />;
}