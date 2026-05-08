import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

// ─── Button ───────────────────────────────────────────────────────────────────
// Consistent button component used across the portfolio.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const base = "inline-flex max-w-full items-center justify-center gap-2 rounded-xl font-body font-medium transition-all";

  const variants = {
    primary: "bg-accent text-bg hover:bg-accent/90 glow",
    outline: "border border-border text-text hover:border-accent/40 hover:text-accent",
    ghost: "text-muted hover:text-text",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
