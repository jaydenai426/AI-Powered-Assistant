import { createFileRoute } from "@tanstack/react-router";
import { ChatWindow } from "@/components/chat-window";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadPage,
  head: () => ({ meta: [{ title: "AI Chat — Aidesk" }] }),
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  return <ChatWindow key={threadId} threadId={threadId} kind="chat" />;
}