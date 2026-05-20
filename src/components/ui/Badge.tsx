import { cn } from "@/lib/utils";

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "muted";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default: "border-border text-muted bg-surface",
    accent: "border-accent/30 text-accent bg-accent/5",
    muted: "border-border text-muted/60 bg-bg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
