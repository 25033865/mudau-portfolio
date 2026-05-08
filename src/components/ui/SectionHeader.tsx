// ─── Section Header ───────────────────────────────────────────────────────────
// Reusable heading block used at the top of every section.
// Usage: <SectionHeader label="About Me" title="My" titleAccent="story" />

interface SectionHeaderProps {
  label: string;       // Small uppercase label above the title
  title: string;       // First part of the main heading
  titleAccent: string; // Gradient-coloured part of the heading
  centered?: boolean;  // Center alignment (default: center)
}

export default function SectionHeader({
  label,
  title,
  titleAccent,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      {/* Label */}
      <span className="inline-block font-mono text-xs text-accent uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full border border-accent/20 bg-accent/5">
        {label}
      </span>

      {/* Heading */}
      <h2 className="font-display font-bold text-4xl sm:text-5xl text-text leading-tight">
        {title}{" "}
        <span className="gradient-text">{titleAccent}</span>
      </h2>
    </div>
  );
}
