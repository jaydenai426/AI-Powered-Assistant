import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/settings.functions";
import { useSession } from "@/hooks/use-session";

function applyTheme(theme: "light" | "dark" | "system") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  root.classList.toggle("dark", resolved === "dark");
}

export function ThemeSync() {
  const { session } = useSession();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: () => getSettings(),
    enabled: !!session,
    staleTime: 60_000,
  });
  const theme = (data?.theme as "light" | "dark" | "system" | undefined) ?? "system";

  useEffect(() => {
    try {
      localStorage.setItem("aidesk-theme", theme);
    } catch {
      /* ignore */
    }
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [theme]);

  return null;
}

/** Runs before hydration paint via inline script to prevent theme flash. */
export const themeBootScript = `
try {
  var t = localStorage.getItem('aidesk-theme') || 'system';
  var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (d) document.documentElement.classList.add('dark');
} catch(e){}
`;