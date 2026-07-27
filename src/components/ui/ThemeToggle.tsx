"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "mudau-theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "dark" || value === "light";
}

function getPreferredTheme(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isThemeMode(stored)) return stored;

  return "dark";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

type ThemeToggleProps = {
  showLabel?: boolean;
  className?: string;
};

export default function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode | null>(null);

  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    applyTheme(preferredTheme);
    setTheme(preferredTheme);
  }, []);

  const isLight = theme === "light";
  const nextTheme: ThemeMode = isLight ? "dark" : "light";
  const label = isLight ? "Switch to dark mode" : "Switch to light mode";
  const Icon = isLight ? Moon : Sun;

  const handleToggle = () => {
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      aria-pressed={isLight}
      title={label}
      className={cn(
        "group inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-accent/35 bg-accent/5 font-body text-sm font-medium text-accent transition-all hover:border-accent/60 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        showLabel ? "w-full justify-between px-4" : "w-11",
        className
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
        {showLabel && <span>{label}</span>}
      </span>
      {showLabel && (
        <span className="font-mono text-xs text-muted transition-colors group-hover:text-accent">
          {isLight ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
