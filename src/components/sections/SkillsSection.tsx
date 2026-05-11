"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Code2,
  Paintbrush,
  PenTool,
  Smartphone,
  Wrench,
} from "lucide-react";
import { SKILLS } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

// ─── Skills Section ───────────────────────────────────────────────────────────
// Edit skills in SKILLS inside /src/lib/data.ts — add, remove or rename them.

const ALL_SKILLS_FLAT = [
  ...SKILLS.mobile,
  ...SKILLS.frontend,
  ...SKILLS.backend,
  ...SKILLS.tools,
  ...SKILLS.design,
];

const SIMPLE_ICONS_BASE = "https://cdn.simpleicons.org";

const SKILL_ICON_MAP: Record<string, { src?: string; Icon?: LucideIcon }> = {
  flutter: { src: `${SIMPLE_ICONS_BASE}/flutter/02569B` },
  react: { src: `${SIMPLE_ICONS_BASE}/react/61DAFB` },
  kotlin: { src: `${SIMPLE_ICONS_BASE}/kotlin/7F52FF` },
  nextjs: { src: `${SIMPLE_ICONS_BASE}/nextdotjs/F5F7FB` },
  typescript: { src: `${SIMPLE_ICONS_BASE}/typescript/3178C6` },
  tailwindcss: { src: `${SIMPLE_ICONS_BASE}/tailwindcss/38BDF8` },
  html5: { src: `${SIMPLE_ICONS_BASE}/html5/E34F26` },
  firebase: { src: `${SIMPLE_ICONS_BASE}/firebase/FFCA28` },
  supabase: { src: `${SIMPLE_ICONS_BASE}/supabase/3ECF8E` },
  nodejs: { src: `${SIMPLE_ICONS_BASE}/nodedotjs/5FA04E` },
  git: { src: `${SIMPLE_ICONS_BASE}/git/F05032` },
  vscode: {
    src: "https://raw.githubusercontent.com/microsoft/vscode/main/resources/win32/code_70x70.png",
  },
  androidstudio: { src: `${SIMPLE_ICONS_BASE}/androidstudio/3DDC84` },
  netbeans: { src: `${SIMPLE_ICONS_BASE}/apachenetbeanside/1B6AC6` },
  figma: { src: `${SIMPLE_ICONS_BASE}/figma/F24E1E` },
  daisyui: { src: `${SIMPLE_ICONS_BASE}/daisyui/5A0EF8` },
  uiux: { Icon: Paintbrush },
};

function SkillIcon({
  icon,
  className = "h-4 w-4",
}: {
  icon: string;
  className?: string;
}) {
  const iconConfig = SKILL_ICON_MAP[icon];
  const Icon = iconConfig?.Icon ?? Code2;

  if (iconConfig?.src) {
    return (
      <Image
        src={iconConfig.src}
        alt=""
        aria-hidden="true"
        width={18}
        height={18}
        unoptimized
        className={`${className} flex-shrink-0 object-contain`}
      />
    );
  }

  return <Icon aria-hidden="true" className={`${className} flex-shrink-0 text-accent`} />;
}

const CATEGORY_CONFIG = [
  {
    key: "mobile" as const,
    label: "Mobile",
    icon: Smartphone,
    color: "border-accent/30 bg-accent/5",
    shadow: "hover:shadow-[0_0_35px_rgba(0,229,255,0.25)]",
  },
  {
    key: "frontend" as const,
    label: "Frontend",
    icon: Code2,
    color: "border-accent2/30 bg-accent2/5",
    shadow: "hover:shadow-[0_0_35px_rgba(123,97,255,0.25)]",
  },
  {
    key: "backend" as const,
    label: "Backend & Cloud",
    icon: Cloud,
    color: "border-green-500/30 bg-green-500/5",
    shadow: "hover:shadow-[0_0_35px_rgba(34,197,94,0.25)]",
  },
  {
    key: "tools" as const,
    label: "Tools & IDEs",
    icon: Wrench,
    color: "border-yellow-500/30 bg-yellow-500/5",
    shadow: "hover:shadow-[0_0_35px_rgba(234,179,8,0.25)]",
  },
  {
    key: "design" as const,
    label: "Design",
    icon: PenTool,
    color: "border-pink-500/30 bg-pink-500/5",
    shadow: "hover:shadow-[0_0_35px_rgba(236,72,153,0.25)]",
  },
];

export default function SkillsSection() {
  const doubled = [...ALL_SKILLS_FLAT, ...ALL_SKILLS_FLAT];

  return (
    <section id="skills" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="absolute right-0 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-accent/4 blur-[100px] pointer-events-none sm:h-[400px] sm:w-[400px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          label="My Skills"
          title="Tools I build"
          titleAccent="great apps with"
        />

        {/* Marquee Strip */}
        <ScrollReveal className="-mx-4 mt-12 overflow-hidden px-0 sm:-mx-6 sm:mt-16">
          <div className="marquee-track gap-2 sm:gap-4">
            {doubled.map((skill, i) => (
              <div
                key={`${skill.name}-${i}`}
                className="mx-1 inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-border px-3 py-2 font-body text-xs text-muted glass sm:mx-2 sm:px-4 sm:text-sm"
              >
                <SkillIcon icon={skill.icon} />
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Categorised Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {CATEGORY_CONFIG.map((cat, index) => {
            const CategoryIcon = cat.icon;

            return (
              <ScrollReveal
                key={cat.key}
                className="h-full"
                delay={index * 0.06}
              >
                <div className={`h-full rounded-2xl border p-5 sm:p-6 ${cat.color} ${cat.shadow} hover:scale-[1.02] transition-all`}>
                  <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-text">
                    <CategoryIcon aria-hidden="true" size={16} className="text-accent" />
                    {cat.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS[cat.key].map((skill) => (
                      <span
                        key={skill.name}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-bg/60 px-2.5 py-1 font-body text-xs text-muted"
                      >
                        <SkillIcon icon={skill.icon} className="h-3.5 w-3.5" />
                        <span>{skill.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
