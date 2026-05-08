"use client";

import { Smartphone, Code2, Layers, Zap } from "lucide-react";
import { PERSONAL_INFO } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";

// ─── About Section ────────────────────────────────────────────────────────────
// Edit bio in PERSONAL_INFO inside /src/lib/data.ts
const highlights = [
  {
    icon: <Smartphone size={20} className="text-accent" />,
    title: "Mobile-First",
    desc: "I build apps for iOS & Android that feel native, fast and delightful.",
  },
  {
    icon: <Layers size={20} className="text-accent" />,
    title: "Cross-Platform",
    desc: "Flutter & React Native let me ship to both platforms from a single codebase.",
  },
  {
    icon: <Code2 size={20} className="text-accent" />,
    title: "Clean Code",
    desc: "I write maintainable, well-structured code with clear documentation.",
  },
  {
    icon: <Zap size={20} className="text-accent" />,
    title: "Performance",
    desc: "Optimising startup time, frame rates, and bundle size is part of my process.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-28 px-6 relative">
      {/* Background accent */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent2/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeader
          label="About Me"
          title="Turning ideas into"
          titleAccent="apps people use"
        />

        <div className="grid lg:grid-cols-2 gap-16 items-center mt-16">
          {/* Left – Bio Text */}
          <div className="space-y-6">
            <p className="font-body text-text/80 text-lg leading-relaxed">
              Hey, I&apos;m{" "}
              <span className="text-text font-semibold">
                {PERSONAL_INFO.firstName}
              </span>
              {" "}— an App Developer passionate about crafting mobile
              experiences that are intuitive, performant, and genuinely useful.
            </p>
            <p className="font-body text-muted leading-relaxed">
              {PERSONAL_INFO.bio}
            </p>
            <p className="font-body text-muted leading-relaxed">
              When I&apos;m not writing code, I&apos;m studying UI/UX patterns,
              exploring new frameworks, or mentoring other developers in the
              South African tech community.
            </p>

            {/* Quick Facts */}
            <div className="pt-4 flex flex-wrap gap-4">
              {[
                ["📍", "South Africa"],
                ["📱", "Flutter & React Native"],
                ["🎯", "Mobile-First"],
                ["✅", "Available Now"],
              ].map(([emoji, fact]) => (
                <span
                  key={fact}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-body text-muted"
                >
                  <span>{emoji}</span>
                  {fact}
                </span>
              ))}
            </div>
          </div>

          {/* Right – Highlight Cards */}
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="glass rounded-2xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-display font-semibold text-text text-sm">
                  {item.title}
                </h3>
                <p className="font-body text-muted text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
