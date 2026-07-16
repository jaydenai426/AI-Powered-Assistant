import { createFileRoute } from "@tanstack/react-router";
import { ChatWindow } from "@/components/chat-window";

export const Route = createFileRoute("/research/$threadId")({
  component: ResearchThreadPage,
  head: () => ({ meta: [{ title: "Research — Aidesk" }] }),
});

function ResearchThreadPage() {
  const { threadId } = Route.useParams();
  return <ChatWindow key={threadId} threadId={threadId} kind="research" />;
}