"use client";

import { SKILLS } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";

// ─── Skills Section ───────────────────────────────────────────────────────────
// Edit skills in SKILLS inside /src/lib/data.ts — add, remove or rename them.

const ALL_SKILLS_FLAT = [
  ...SKILLS.mobile,
  ...SKILLS.frontend,
  ...SKILLS.backend,
  ...SKILLS.tools,
  ...SKILLS.design,
];

const CATEGORY_CONFIG = [
  { key: "mobile" as const, label: "📱 Mobile", color: "border-accent/30 bg-accent/5" },
  { key: "frontend" as const, label: "🌐 Frontend", color: "border-accent2/30 bg-accent2/5" },
  { key: "backend" as const, label: "⚡ Backend & Cloud", color: "border-green-500/30 bg-green-500/5" },
  { key: "tools" as const, label: "🔧 Tools & IDEs", color: "border-yellow-500/30 bg-yellow-500/5" },
  { key: "design" as const, label: "✏️ Design", color: "border-pink-500/30 bg-pink-500/5" },
];

export default function SkillsSection() {
  const doubled = [...ALL_SKILLS_FLAT, ...ALL_SKILLS_FLAT];

  return (
    <section id="skills" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeader
          label="My Skills"
          title="Tools I build"
          titleAccent="great apps with"
        />

        {/* Marquee Strip */}
        <div className="mt-16 overflow-hidden -mx-6 px-0">
          <div className="marquee-track gap-4">
            {doubled.map((skill, i) => (
              <div
                key={`${skill.name}-${i}`}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border glass text-sm font-body text-muted mx-2"
              >
                <span>{skill.icon}</span>
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Categorised Grid */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORY_CONFIG.map((cat) => (
            <div
              key={cat.key}
              className={`rounded-2xl border p-6 ${cat.color} hover:scale-[1.02] transition-transform`}
            >
              <h3 className="font-display font-semibold text-text text-base mb-4">
                {cat.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {SKILLS[cat.key].map((skill) => (
                  <span
                    key={skill.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-body text-muted rounded-md bg-bg/60 border border-border/60"
                  >
                    {skill.icon} {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
