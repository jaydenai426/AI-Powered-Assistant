import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-12 w-12 shrink-0 rounded-2xl bg-[var(--gradient-hero)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs uppercase tracking-wider text-primary font-medium">{eyebrow}</div>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-0.5">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-2xl">
          {description}
        </p>
      </div>
    </div>
  );
}