"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ExternalLink, Github, Smartphone, Joystick, Apple, QrCode, Monitor, Sparkles, Play, Wand2, Telescope } from "lucide-react";
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
  if (icon === "portfolio") return <Monitor size={size} className={className} />;
  if (icon === "space") return <Sparkles size={size} className={className} />;
  if (platform === "ios") return <Apple size={size} className={className} />;
  if (platform === "android") return <Smartphone size={size} className={className} />;
  if (platform === "web") return <Joystick size={size} className={className} />;
  return <Smartphone size={size} className={className} />;
}

function PlanetGeneratorBackdrop() {
  return (
    <div className="floating-planets-card-bg" aria-hidden="true">
      <span className="floating-star floating-star-a" />
      <span className="floating-star floating-star-b" />
      <span className="floating-star floating-star-c" />
      <span className="floating-planet floating-planet-a" />
      <span className="floating-planet floating-planet-b" />
    </div>
  );
}

function QRForgeBackdrop() {
  return (
    <div className="qrforge-card-bg" aria-hidden="true">
      <span className="qrforge-scanline" />
      <span className="qrforge-preview-panel">
        <span className="qrforge-preview-code" />
      </span>
      <span className="qrforge-control qrforge-control-a" />
      <span className="qrforge-control qrforge-control-b" />
      <span className="qrforge-control qrforge-control-c" />
      <span className="qrforge-chip qrforge-chip-a" />
      <span className="qrforge-chip qrforge-chip-b" />
    </div>
  );
}

function QRForgeIcon() {
  return (
    <div className="qrforge-icon" aria-hidden="true">
      <QrCode size={25} strokeWidth={2.4} />
    </div>
  );
}

function MiniMorabarabaBackdrop() {
  return (
    <div className="morabaraba-card-bg" aria-hidden="true">
      <span className="morabaraba-card-tag">Placing Phase</span>
      <span className="morabaraba-card-status">Your turn - place a piece</span>
      <span className="morabaraba-diff-pill morabaraba-diff-pill-a">Easy</span>
      <span className="morabaraba-diff-pill morabaraba-diff-pill-b">Hard</span>
      <svg className="morabaraba-card-board" viewBox="0 0 180 180" role="presentation">
        <rect width="180" height="180" rx="16" fill="#0d1220" />
        <g stroke="rgba(0,229,255,0.06)" strokeWidth="0.5">
          <line x1="0" y1="60" x2="180" y2="60" />
          <line x1="0" y1="120" x2="180" y2="120" />
          <line x1="60" y1="0" x2="60" y2="180" />
          <line x1="120" y1="0" x2="120" y2="180" />
        </g>
        <g stroke="#00bcd4" strokeLinecap="round" strokeWidth="2" opacity="0.62">
          <line x1="30" y1="30" x2="90" y2="30" />
          <line x1="90" y1="30" x2="150" y2="30" />
          <line x1="30" y1="90" x2="90" y2="90" />
          <line x1="90" y1="90" x2="150" y2="90" />
          <line x1="30" y1="150" x2="90" y2="150" />
          <line x1="90" y1="150" x2="150" y2="150" />
          <line x1="30" y1="30" x2="30" y2="90" />
          <line x1="30" y1="90" x2="30" y2="150" />
          <line x1="90" y1="30" x2="90" y2="90" />
          <line x1="90" y1="90" x2="90" y2="150" />
          <line x1="150" y1="30" x2="150" y2="90" />
          <line x1="150" y1="90" x2="150" y2="150" />
          <line x1="30" y1="30" x2="90" y2="90" />
          <line x1="90" y1="90" x2="150" y2="150" />
          <line x1="150" y1="30" x2="90" y2="90" />
          <line x1="90" y1="90" x2="30" y2="150" />
        </g>
        <g className="morabaraba-win-line" stroke="#00e5ff" strokeLinecap="round" strokeWidth="4">
          <line x1="30" y1="30" x2="150" y2="150" />
        </g>
        <g>
          {[30, 90, 150].flatMap((y) =>
            [30, 90, 150].map((x) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="rgba(255,255,255,0.05)" stroke="#1e293b" />
            ))
          )}
        </g>
        <g>
          <rect className="morabaraba-blue-piece" x="18" y="18" width="24" height="24" rx="4" />
          <rect className="morabaraba-blue-piece morabaraba-blue-piece-b" x="78" y="78" width="24" height="24" rx="4" />
          <rect className="morabaraba-blue-piece morabaraba-blue-piece-c" x="138" y="138" width="24" height="24" rx="4" />
          <polygon className="morabaraba-red-piece" points="150,15 136,42 164,42" />
          <polygon className="morabaraba-red-piece morabaraba-red-piece-b" points="30,135 16,162 44,162" />
        </g>
      </svg>
    </div>
  );
}

function MiniMorabarabaIcon() {
  return (
    <div className="morabaraba-icon" aria-hidden="true">
      <span className="morabaraba-icon-line morabaraba-icon-line-h" />
      <span className="morabaraba-icon-line morabaraba-icon-line-v" />
      <span className="morabaraba-icon-node morabaraba-icon-node-a" />
      <span className="morabaraba-icon-node morabaraba-icon-node-b" />
      <span className="morabaraba-icon-node morabaraba-icon-node-c" />
    </div>
  );
}

function PlanetGeneratorIcon() {
  return (
    <div className="floating-planets-icon" aria-hidden="true">
      <span className="floating-icon-star floating-icon-star-a" />
      <span className="floating-icon-star floating-icon-star-b" />
      <span className="floating-icon-planet floating-icon-planet-a" />
      <span className="floating-icon-planet floating-icon-planet-b" />
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const projectUrl = project.liveUrl ?? project.appStoreUrl ?? project.playStoreUrl;
  const isClickable = Boolean(project.detailUrl ?? projectUrl);
  const hasPlanetGeneratorPreview = project.icon === "space";
  const hasQrForgePreview = project.detailUrl === "/projects/qrforge";
  const hasMiniMorabarabaPreview = project.detailUrl === "/projects/mini-morabaraba";
  const hasPlayButton = project.detailUrl === "/projects/mini-morabaraba";
  const hasGenerateButton = project.detailUrl === "/projects/qrforge";
  const hasExploreButton = project.detailUrl === "/projects/planet-generator";

  const handleCardClick = () => {
    if (project.detailUrl) {
      router.push(project.detailUrl);
      return;
    }

    if (projectUrl) {
      window.open(projectUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  const handleInnerLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  const handlePlayButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleCardClick();
  };

  return (
    <div
      className={cn(
        "glass group relative h-full min-w-0 overflow-hidden rounded-2xl p-5 transition-all hover:border-accent/20 sm:p-6",
        hasMiniMorabarabaPreview && "border-accent/20 bg-[#0a0e1a]",
        hasQrForgePreview && "border-accent/20 bg-[#071016]",
        hasPlanetGeneratorPreview && "border-accent2/20 bg-[#080b14]",
        isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      )}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `${project.title} details` : undefined}
    >
      {hasMiniMorabarabaPreview && <MiniMorabarabaBackdrop />}
      {hasQrForgePreview && <QRForgeBackdrop />}
      {hasPlanetGeneratorPreview && <PlanetGeneratorBackdrop />}

      <div className="relative z-10 flex h-full min-w-0 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-accent/20 to-accent2/20 sm:h-12 sm:w-12">
          {hasPlanetGeneratorPreview ? (
            <PlanetGeneratorIcon />
          ) : hasMiniMorabarabaPreview ? (
            <MiniMorabarabaIcon />
          ) : hasQrForgePreview ? (
            <QRForgeIcon />
          ) : project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={`${project.title} icon`}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <ProjectIcon platform={project.platform} icon={project.icon} size={22} className="text-accent" />
          )}
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
          {projectUrl && (
            <a
              href={projectUrl}
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
          <span>{project.platformLabel ?? getPlatformLabel(project.platform)}</span>
          <span>·</span>
          <span>{project.year}</span>
        </div>
      </div>

      <p className="font-body text-sm text-muted leading-relaxed flex-1">
        {project.description}
      </p>

      {(hasPlayButton || hasGenerateButton || hasExploreButton) && (
        <button
          type="button"
          onClick={handlePlayButtonClick}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-4 py-2 font-body text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          aria-label={`${hasPlayButton ? "Play" : hasExploreButton ? "Explore" : "Generate with"} ${project.title}`}
        >
          {hasPlayButton ? (
            <Play size={15} fill="currentColor" />
          ) : hasExploreButton ? (
            <Telescope size={15} />
          ) : (
            <Wand2 size={15} />
          )}
          {hasPlayButton ? "Play" : hasExploreButton ? "Explore" : "Generate"}
        </button>
      )}

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
    </div>
  );
}

type ProjectGalleryProps = {
  projects: Project[];
  showFilters?: boolean;
};

export default function ProjectGallery({ projects, showFilters = true }: ProjectGalleryProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = projects.filter((p) => {
    if (!showFilters) return true;
    if (filter === "all") return true;
    if (filter === "featured") return p.featured;
    return p.status === filter;
  });

  return (
    <>
      {showFilters && (
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
                  ? projects.length
                  : f.value === "featured"
                  ? projects.filter((p) => p.featured).length
                  : projects.filter((p) => p.status === f.value).length})
              </span>
            </button>
          ))}
        </ScrollReveal>
      )}

      <div className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3",
        showFilters ? "mt-10" : "mt-10 sm:mt-12"
      )}>
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
