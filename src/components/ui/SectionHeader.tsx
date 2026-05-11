"use client";

import { motion, useReducedMotion } from "framer-motion";

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
  const prefersReducedMotion = useReducedMotion();
  const hasTitle = title.trim().length > 0;
  const hasAccent = titleAccent.trim().length > 0;

  return (
    <motion.div
      className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.55 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Label */}
      <span className="inline-block max-w-full break-words font-mono text-[11px] sm:text-xs text-accent uppercase tracking-[0.18em] sm:tracking-[0.2em] mb-4 px-3 py-1 rounded-full border border-accent/20 bg-accent/5">
        {label}
      </span>

      {/* Heading */}
      <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-text leading-tight [text-wrap:balance]">
        {hasTitle && title}
        {hasTitle && hasAccent && " "}
        {hasAccent && <span className="gradient-text">{titleAccent}</span>}
      </h2>
    </motion.div>
  );
}
