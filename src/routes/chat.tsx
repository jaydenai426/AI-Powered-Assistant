import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listThreads } from "@/lib/threads.functions";
import { NewChatComposer } from "@/components/new-chat-composer";

export const Route = createFileRoute("/chat")({
  component: ChatIndex,
  head: () => ({ meta: [{ title: "AI Chatbot — Aidesk" }, { name: "description", content: "Chat with your AI workplace assistant." }] }),
});

function ChatIndex() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["threads", "chat"], queryFn: () => listThreads({ data: { kind: "chat" } }) });
  useEffect(() => {
    if (data && data.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: data[0].id }, replace: true });
    }
  }, [data, navigate]);
  return <NewChatComposer kind="chat" />;
}