"use client";

import {
  CheckCircle,
  Code2,
  Layers,
  MapPin,
  Smartphone,
  Target,
  Zap,
} from "lucide-react";
import { PERSONAL_INFO } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

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

const quickFacts = [
  { icon: MapPin, fact: "South Africa" },
  { icon: Smartphone, fact: "Flutter & React Native" },
  { icon: Target, fact: "Mobile-First" },
  { icon: CheckCircle, fact: "Available Now" },
];

export default function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      {/* Background accent */}
      <div className="absolute left-0 top-1/2 h-[240px] w-[240px] -translate-y-1/2 rounded-full bg-accent2/5 blur-[80px] pointer-events-none sm:h-[300px] sm:w-[300px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          label="About Me"
          title="Turning ideas into"
          titleAccent="apps people use"
        />

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          {/* Left – Bio Text */}
          <ScrollReveal className="space-y-5 sm:space-y-6">
            <p className="font-body text-sm leading-relaxed text-muted sm:text-base">
              Hey, I&apos;m{" "}
              <span className="text-text font-semibold">
                {PERSONAL_INFO.firstName}
              </span>
              {" "}— an App Developer passionate about crafting mobile
              experiences that are intuitive, performant, and genuinely useful.
            </p>
            <p className="font-body text-sm leading-relaxed text-muted sm:text-base">
              {PERSONAL_INFO.bio}
            </p>
            <p className="font-body text-sm leading-relaxed text-muted sm:text-base">
              When I&apos;m not writing code, I&apos;m studying UI/UX patterns,
              exploring new frameworks, or mentoring other developers in the
              South African tech community.
            </p>

            {/* Quick Facts */}
            <div className="flex flex-wrap gap-3 pt-4 sm:gap-4">
              {quickFacts.map(({ icon: Icon, fact }) => (
                <span
                  key={fact}
                  className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border px-3 py-1.5 font-body text-sm text-muted"
                >
                  <Icon aria-hidden="true" size={14} className="flex-shrink-0 text-accent" />
                  {fact}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* Right – Highlight Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <ScrollReveal
                key={item.title}
                className="h-full"
                delay={index * 0.07}
              >
                <div className="glass flex h-full flex-col gap-3 rounded-2xl p-4 transition-all hover:border-accent/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] group sm:p-5">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
