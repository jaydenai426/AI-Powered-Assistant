import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
  Navigate,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "sonner";
import { SessionProvider, useSession } from "@/hooks/use-session";
import { ThemeSync, themeBootScript } from "@/components/theme-provider";
import { CommandPalette } from "@/components/command-palette";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dashboard — Aidesk" },
      { name: "description", content: "Your AI workplace productivity dashboard. Draft emails, summarize meetings and plan tasks in one place." },
      { name: "author", content: "Aidesk" },
      { property: "og:title", content: "Dashboard — Aidesk" },
      { property: "og:description", content: "Your AI workplace productivity dashboard. Draft emails, summarize meetings and plan tasks in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dashboard — Aidesk" },
      { name: "twitter:description", content: "Your AI workplace productivity dashboard. Draft emails, summarize meetings and plan tasks in one place." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2f718517-5ec2-4baa-80d6-14299b487ddf" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/2f718517-5ec2-4baa-80d6-14299b487ddf" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" richColors />
      <SessionProvider>
        <ThemeSync />
        <AppShell />
      </SessionProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const { session, loading } = useSession();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isAuthRoute = pathname === "/auth";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gradient-subtle)]">
        <div className="h-8 w-8 rounded-full bg-[var(--gradient-hero)] animate-pulse" />
      </div>
    );
  }

  if (!session && !isAuthRoute) {
    return <Navigate to="/auth" />;
  }

  if (isAuthRoute) {
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      <CommandPalette />
      <div className="min-h-screen flex w-full bg-[var(--gradient-subtle)]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center gap-2 border-b border-border/60 bg-background/70 backdrop-blur-md px-3 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="text-sm font-medium text-muted-foreground truncate min-w-0 flex-1">
              <span className="hidden sm:inline">Aidesk — AI Workplace Productivity Assistant</span>
              <span className="sm:hidden">Aidesk</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
