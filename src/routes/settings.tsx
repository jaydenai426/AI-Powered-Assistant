import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings as SettingsIcon, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { getSettings, updateSettings } from "@/lib/settings.functions";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Aidesk" }, { name: "description", content: "Manage your Aidesk profile, defaults and preferences." }] }),
});

function SettingsPage() {
  const qc = useQueryClient();
  const { user, signOut } = useSession();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });

  const [displayName, setDisplayName] = useState("");
  const [tone, setTone] = useState("professional");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (!data) return;
    setDisplayName(data.display_name ?? "");
    setTone(data.default_tone ?? "professional");
    setTheme((data.theme as "system" | "light" | "dark") ?? "system");
    setAck(data.ai_disclaimer_ack ?? false);
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updateSettings({
        data: {
          display_name: displayName || null,
          default_tone: tone,
          theme,
          ai_disclaimer_ack: ack,
        },
      }),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-8 space-y-6">
      <PageHeader icon={SettingsIcon} title="Settings" description="Personalize Aidesk for the way you work." />

      <Card className="p-6 space-y-5">
        <div className="grid gap-1.5">
          <Label>Account email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dn">Display name</Label>
          <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How Aidesk should address you" />
        </div>
        <div className="grid gap-1.5">
          <Label>Default email tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["professional", "friendly", "concise", "persuasive", "apologetic", "enthusiastic"].map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Theme</Label>
          <Select value={theme} onValueChange={(v) => setTheme(v as "system" | "light" | "dark")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Match system</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <div className="text-sm font-medium">I acknowledge the AI disclaimer</div>
            <div className="text-xs text-muted-foreground">Hide the banner across the app once you've read it.</div>
          </div>
          <Switch checked={ack} onCheckedChange={setAck} />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save changes</Button>
        </div>
      </Card>

      <AiDisclaimer />

      <Card className="p-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Sign out</div>
          <div className="text-xs text-muted-foreground">You'll be returned to the sign-in screen.</div>
        </div>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </Card>
    </div>
  );
}