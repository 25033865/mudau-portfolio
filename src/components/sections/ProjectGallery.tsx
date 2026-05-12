"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Github, Smartphone, Joystick, Apple, QrCode } from "lucide-react";
import { PROJECTS } from "@/lib/data";
import { cn, getPlatformLabel, getStatusColor } from "@/lib/utils";
import type { Project } from "@/types";
import ScrollReveal from "@/components/ui/ScrollReveal";

type FilterType = "all" | "featured" | "live" | "in-progress";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Featured", value: "featured" },
  { label: "Live", value: "live" },
  { label: "In Progress", value: "in-progress" },
];

function ProjectIcon({
  platform,
  icon,
  size = 14,
  className,
}: {
  platform: Project["platform"];
  icon?: Project["icon"];
  size?: number;
  className?: string;
}) {
  if (icon === "qr-code") return <QrCode size={size} className={className} />;
  if (platform === "ios") return <Apple size={size} className={className} />;
  if (platform === "android") return <Smartphone size={size} className={className} />;
  if (platform === "web") return <Joystick size={size} className={className} />;
  return <Smartphone size={size} className={className} />;
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-accent/20 to-accent2/20 sm:h-12 sm:w-12">
          <ProjectIcon platform={project.platform} icon={project.icon} size={22} className="text-accent" />
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
          <ProjectIcon platform={project.platform} icon={project.icon} />
          <span>{getPlatformLabel(project.platform)}</span>
          <span>·</span>
          <span>{project.year}</span>
        </div>
      </div>

      <p className="font-body text-sm text-muted leading-relaxed flex-1">
        {project.description}
      </p>

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

export default function ProjectGallery() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = PROJECTS.filter((p) => {
    if (filter === "all") return true;
    if (filter === "featured") return p.featured;
    return p.status === filter;
  });

  return (
    <>
      <ScrollReveal className="mt-10 grid grid-cols-2 gap-2 sm:mt-12 sm:flex sm:flex-wrap sm:justify-center">
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
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {filtered.map((project, index) => (
          <ScrollReveal
            key={project.id}
            className="h-full"
            delay={index * 0.06}
          >
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted font-body">
          No projects in this category yet.
        </div>
      )}
    </>
  );
}
