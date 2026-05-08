"use client";

import { useState } from "react";
import { ExternalLink, Github, Smartphone, Globe, Apple } from "lucide-react";
import { PROJECTS } from "@/lib/data";
import { cn, getPlatformLabel, getStatusColor } from "@/lib/utils";
import type { Project } from "@/types";
import SectionHeader from "@/components/ui/SectionHeader";

// ─── Projects Section ─────────────────────────────────────────────────────────
// Edit, add or remove projects in PROJECTS inside /src/lib/data.ts
type FilterType = "all" | "featured" | "live" | "in-progress";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Featured", value: "featured" },
  { label: "Live", value: "live" },
  { label: "In Progress", value: "in-progress" },
];

function PlatformIcon({ platform }: { platform: Project["platform"] }) {
  if (platform === "ios") return <Apple size={14} />;
  if (platform === "android") return <Smartphone size={14} />;
  if (platform === "web") return <Globe size={14} />;
  return <Smartphone size={14} />;
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-4 hover:border-accent/20 transition-all group h-full">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent2/20 border border-border flex items-center justify-center text-xl flex-shrink-0">
          📱
        </div>
        <div className="flex gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-text transition-colors"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
          )}
          {(project.appStoreUrl || project.playStoreUrl) && (
            <a
              href={project.appStoreUrl ?? project.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
              aria-label="Live link"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Title & Status */}
      <div>
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h3 className="font-display font-bold text-text text-lg">
            {project.title}
          </h3>
          <span
            className={cn(
              "text-xs font-mono px-2 py-0.5 rounded-full border",
              getStatusColor(project.status)
            )}
          >
            {project.status === "in-progress" ? "In Progress" : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted text-xs font-body">
          <PlatformIcon platform={project.platform} />
          <span>{getPlatformLabel(project.platform)}</span>
          <span>·</span>
          <span>{project.year}</span>
        </div>
      </div>

      {/* Description */}
      <p className="font-body text-sm text-muted leading-relaxed flex-1">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-mono text-accent/70 bg-accent/5 px-2 py-0.5 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = PROJECTS.filter((p) => {
    if (filter === "all") return true;
    if (filter === "featured") return p.featured;
    return p.status === filter;
  });

  return (
    <section id="projects" className="py-28 px-6 relative">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-accent2/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeader
          label="Portfolio"
          title="Apps I've"
          titleAccent="shipped"
        />

        {/* Filter Tabs */}
        <div className="mt-12 flex flex-wrap gap-2 justify-center">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-body transition-all",
                filter === f.value
                  ? "bg-accent text-bg font-semibold"
                  : "border border-border text-muted hover:text-text hover:border-accent/30"
              )}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-60">
                ({f.value === "all"
                  ? PROJECTS.length
                  : f.value === "featured"
                  ? PROJECTS.filter((p) => p.featured).length
                  : PROJECTS.filter((p) => p.status === f.value).length})
              </span>
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted font-body">
            No projects in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
