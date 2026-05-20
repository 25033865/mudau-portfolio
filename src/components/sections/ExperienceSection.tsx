"use client";

import { Briefcase, Calendar } from "lucide-react";
import { EXPERIENCES } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

// ─── Experience Section ───────────────────────────────────────────────────────
export default function ExperienceSection() {
  return (
    <section id="experience" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-accent/4 blur-[100px] pointer-events-none sm:h-[400px] sm:w-[400px]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <SectionHeader
          label="Experience"
          title="What I've"
          titleAccent="Achieved"
        />

        {/* Timeline */}
        <div className="relative mt-12 sm:mt-16">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-accent/40 via-border to-transparent hidden sm:block" />

          <div className="flex flex-col gap-6 sm:gap-10">
            {EXPERIENCES.map((exp, index) => (
              <ScrollReveal
                key={exp.id}
                className="relative sm:pl-20"
                delay={index * 0.08}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 top-5 hidden sm:flex w-12 h-12 rounded-full bg-surface border border-border items-center justify-center">
                  <Briefcase size={16} className="text-accent" />
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-5 transition-all hover:border-accent/20 sm:p-8">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-text sm:text-xl">
                        {exp.role}
                      </h3>
                      <p className="font-body text-accent font-medium text-sm mt-0.5">
                        {exp.company}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5 font-mono text-xs text-muted sm:text-sm">
                      <Calendar size={13} />
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </div>
                  </div>

                  <p className="mb-4 font-body text-sm leading-relaxed text-muted">
                    {exp.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-5">
                    {exp.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 font-body text-sm text-muted"
                      >
                        <span className="text-accent mt-0.5 flex-shrink-0">▸</span>
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-accent/5 px-2.5 py-1 font-mono text-xs text-accent/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
