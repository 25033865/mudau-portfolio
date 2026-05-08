"use client";

import { Briefcase, Calendar } from "lucide-react";
import { EXPERIENCES } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import SectionHeader from "@/components/ui/SectionHeader";

// ─── Experience Section ───────────────────────────────────────────────────────
// Edit experiences in EXPERIENCES inside /src/lib/data.ts
export default function ExperienceSection() {
  return (
    <section id="experience" className="py-28 px-6 relative">
      <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <SectionHeader
          label="Experience"
          title="Where I've"
          titleAccent="worked"
        />

        {/* Timeline */}
        <div className="mt-16 relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-accent/40 via-border to-transparent hidden sm:block" />

          <div className="flex flex-col gap-10">
            {EXPERIENCES.map((exp, idx) => (
              <div key={exp.id} className="relative sm:pl-20">
                {/* Timeline Dot */}
                <div className="absolute left-0 top-5 hidden sm:flex w-12 h-12 rounded-full bg-surface border border-border items-center justify-center">
                  <Briefcase size={16} className="text-accent" />
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-6 sm:p-8 hover:border-accent/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-display font-bold text-text text-xl">
                        {exp.role}
                      </h3>
                      <p className="font-body text-accent font-medium text-sm mt-0.5">
                        {exp.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted text-sm font-mono flex-shrink-0">
                      <Calendar size={13} />
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </div>
                  </div>

                  <p className="font-body text-muted text-sm leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-5">
                    {exp.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-sm font-body text-muted"
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
                        className="text-xs font-mono text-accent/70 bg-accent/5 px-2.5 py-1 rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
