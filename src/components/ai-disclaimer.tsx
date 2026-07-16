import { AlertTriangle } from "lucide-react";

export function AiDisclaimer({ variant = "banner" }: { variant?: "banner" | "inline" }) {
  if (variant === "inline") {
    return (
      <p className="text-[11px] text-muted-foreground text-center py-2">
        AI can make mistakes. Verify important information before acting on it.
      </p>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <p>
        <span className="font-medium">AI disclaimer:</span> Aidesk uses AI to generate content.
        Outputs may be inaccurate, incomplete, or biased. Review before sending, sharing, or making decisions.
      </p>
    </div>
  );
}