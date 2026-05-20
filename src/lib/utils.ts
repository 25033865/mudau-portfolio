import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Class Name Utility ───────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Format Year Range ────────────────────────────────────────────────────────
export function formatDateRange(start: string, end?: string): string {
  return `${start} – ${end ?? "Present"}`;
}

// ─── Platform Label ───────────────────────────────────────────────────────────
export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    ios: "iOS",
    android: "Android",
    "cross-platform": "Cross-Platform",
    web: "Game",
  };
  return labels[platform] ?? platform;
}

// ─── Status Color ─────────────────────────────────────────────────────────────
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    live: "text-green-400 bg-green-400/10 border-green-400/20",
    "in-progress": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    concept: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };
  return colors[status] ?? "text-muted bg-muted/10";
}
