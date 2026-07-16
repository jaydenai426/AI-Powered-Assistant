import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Mail, FileText, ListChecks, Sparkles,
  MessageSquare, FlaskConical, History, BarChart3, Settings, LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

const workspaceItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Notes", url: "/meetings", icon: FileText },
  { title: "Task Planner", url: "/tasks", icon: ListChecks },
] as const;

const aiItems = [
  { title: "AI Chatbot", url: "/chat", icon: MessageSquare },
  { title: "Research Assistant", url: "/research", icon: FlaskConical },
] as const;

const accountItems = [
  { title: "History", url: "/history", icon: History },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => (path === "/" ? currentPath === "/" : currentPath.startsWith(path));
  const { user, signOut } = useSession();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-[var(--gradient-hero)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Aidesk</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5 truncate">
                Workplace AI
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Workspace" items={workspaceItems} isActive={isActive} collapsed={collapsed} />
        <NavGroup label="AI Assistants" items={aiItems} isActive={isActive} collapsed={collapsed} />
        <NavGroup label="Account" items={accountItems} isActive={isActive} collapsed={collapsed} />
      </SidebarContent>
      {user && !collapsed && (
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="p-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
              {(user.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{user.email}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => signOut()} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

function NavGroup({
  label, items, isActive, collapsed,
}: {
  label: string;
  items: ReadonlyArray<{ title: string; url: string; icon: React.ComponentType<{ className?: string }> }>;
  isActive: (p: string) => boolean;
  collapsed: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <Link to={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}