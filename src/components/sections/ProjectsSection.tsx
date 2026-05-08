"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const isClickable = Boolean(project.detailUrl);

  const handleCardClick = () => {
    if (project.detailUrl) {
      router.push(project.detailUrl);
    }
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!project.detailUrl) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(project.detailUrl);
    }
  };

  const handleInnerLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className={cn(
        "glass flex h-full min-w-0 flex-col gap-4 rounded-2xl p-5 transition-all hover:border-accent/20 group sm:p-6",
        isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      )}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `${project.title} details` : undefined}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-accent/20 to-accent2/20 text-xl sm:h-12 sm:w-12">
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
              onClick={handleInnerLinkClick}
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
              onClick={handleInnerLinkClick}
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
        <div className="flex flex-wrap items-center gap-2 font-body text-xs text-muted">
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
            className="max-w-full break-words rounded-md bg-accent/5 px-2 py-0.5 font-mono text-xs text-accent/70"
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
    <section id="projects" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="absolute left-1/2 top-0 h-[220px] w-[360px] -translate-x-1/2 rounded-full bg-accent2/4 blur-[100px] pointer-events-none sm:h-[300px] sm:w-[600px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          label="Portfolio"
          title="Apps I've"
          titleAccent="shipped"
        />

        {/* Filter Tabs */}
        <div className="mt-10 grid grid-cols-2 gap-2 sm:mt-12 sm:flex sm:flex-wrap sm:justify-center">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "w-full rounded-lg px-3 py-2.5 font-body text-sm transition-all sm:w-auto sm:px-4 sm:py-2",
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
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
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
