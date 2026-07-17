import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ListChecks,
  MessageSquare,
  FlaskConical,
  History,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Notes Summarizer", icon: FileText },
  { to: "/tasks", label: "AI Task Planner", icon: ListChecks },
  { to: "/chat", label: "AI Chatbot", icon: MessageSquare },
  { to: "/research", label: "Research Assistant", icon: FlaskConical },
  { to: "/history", label: "History", icon: History },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useSession();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a tool, search actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV.map((n) => (
            <CommandItem key={n.to} onSelect={() => go(n.to)}>
              <n.icon className="h-4 w-4 mr-2" /> {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/chat")}>
            <MessageSquare className="h-4 w-4 mr-2" /> Start a new chat
          </CommandItem>
          <CommandItem onSelect={() => go("/research")}>
            <FlaskConical className="h-4 w-4 mr-2" /> Start a research brief
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              void signOut();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}