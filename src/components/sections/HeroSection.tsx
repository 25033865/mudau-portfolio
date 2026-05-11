"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, MapPin, Smartphone } from "lucide-react";
import { PERSONAL_INFO } from "@/lib/data";

// ─── Hero Section ─────────────────────────────────────────────────────────────
// The first thing visitors see. Edit PERSONAL_INFO in /src/lib/data.ts
const HERO_ROLES = ["App Developer", "Next.Js Developer", "React Native Developer"];
const MAX_ROLE_LENGTH = Math.max(...HERO_ROLES.map((role) => role.length));
const HERO_BIOS = [
  "I'm a Mobile App Developer crafting high-performance. Specializing in React Native and cross-platform development, I turn concepts into polished, scalable mobile experiences that users love.",
  "My journey in app development started in high school where curiosity sparked a passion for building. Today, with 2+ years of professional experience, I craft high-performance mobile applications.",
];

export default function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [bioIndex, setBioIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBioIndex((prev) => (prev + 1) % HERO_BIOS.length);
    }, 16000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for rotating roles
  useEffect(() => {
    const current = HERO_ROLES[roleIndex];

    if (!isDeleting && displayText === current) {
      const pause = setTimeout(() => setIsDeleting(true), 1400);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayText === "") {
      const pause = setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % HERO_ROLES.length);
      }, 300);
      return () => clearTimeout(pause);
    }

    const timeout = setTimeout(() => {
      const nextLength = isDeleting ? displayText.length - 1 : displayText.length + 1;
      setDisplayText(current.slice(0, nextLength));
    }, isDeleting ? 50 : 90);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, roleIndex]);

  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTiltMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    const inner = card.querySelector(".tilt-card-inner") as HTMLDivElement | null;
    if (!inner) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) * 2 - 1) * 26;
    const rotateX = (1 - (y / rect.height) * 2) * 20;

    inner.style.setProperty("--tilt-rotate-x", `${rotateX}deg`);
    inner.style.setProperty("--tilt-rotate-y", `${rotateY}deg`);
  };

  const handleTiltLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    const inner = event.currentTarget.querySelector(".tilt-card-inner") as HTMLDivElement | null;
    if (!inner) return;
    inner.style.setProperty("--tilt-rotate-x", "0deg");
    inner.style.setProperty("--tilt-rotate-y", "0deg");
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden grid-bg px-4 pb-28 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:items-start lg:px-8 lg:pt-32"
    >
      {/* Animated Blob Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent2/5 rounded-full blur-[80px] animate-blob animation-delay-2" />
        <div className="absolute top-3/4 left-1/2 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[60px] animate-blob animation-delay-4" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
          <div className="w-full lg:max-w-2xl text-center lg:text-left">
            {/* Availability Badge */}
            <div
              className="mb-7 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-border px-3 py-2 text-center font-mono text-xs leading-relaxed text-muted glass transition-colors hover:border-accent/60 hover:bg-accent/10 hover:text-accent sm:mb-8 sm:px-4 sm:text-sm"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {PERSONAL_INFO.availability}
            </div>

            {/* Name */}
            <h1 className="mb-4 font-display font-bold leading-[1.05]">
              <span className="block text-4xl min-[360px]:text-5xl sm:text-7xl md:text-8xl text-text">
                {PERSONAL_INFO.firstName}
              </span>
              <span className="block text-4xl min-[360px]:text-5xl sm:text-7xl md:text-8xl gradient-text glow-text">
                {PERSONAL_INFO.lastName}
              </span>
            </h1>

            {/* Typewriter Role */}
            <div className="mb-6 flex h-9 max-w-full items-center justify-center overflow-hidden sm:h-10 lg:justify-start">
              <span className="max-w-full font-mono text-base text-accent min-[360px]:text-lg sm:text-2xl">
                <span
                  className="inline-block max-w-full overflow-hidden whitespace-nowrap align-bottom text-left"
                  style={{ width: `${MAX_ROLE_LENGTH}ch` }}
                >
                  {displayText}
                </span>
                <span className="animate-pulse">|</span>
              </span>
            </div>

            {/* Mobile Profile Image */}
            <div className="mx-auto mb-7 h-36 w-36 overflow-hidden rounded-full border border-border/70 bg-surface/60 shadow-[0_0_40px_rgba(0,229,255,0.12)] sm:h-44 sm:w-44 lg:hidden">
              <div className="relative h-full w-full">
                <Image
                  src={PERSONAL_INFO.profileImage}
                  alt={`${PERSONAL_INFO.firstName} ${PERSONAL_INFO.lastName}`}
                  fill
                  priority
                  sizes="(min-width: 640px) 11rem, 9rem"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Bio */}
            <p
              key={bioIndex}
              className="mx-auto mb-9 max-w-2xl animate-fade-in-up font-body text-sm leading-relaxed text-muted sm:mb-10 sm:text-lg lg:mx-0"
            >
              {HERO_BIOS[bioIndex]}
            </p>

            {/* Stats Row */}
            <div className="mx-auto mb-10 grid w-full max-w-md grid-cols-3 items-start gap-3 sm:mb-12 sm:gap-8 lg:mx-0">
              {[
                { value: `${PERSONAL_INFO.yearsOfExperience}+`, label: "Years Exp" },
                { value: `${PERSONAL_INFO.projectsCompleted}+`, label: "Apps Built" },
                { value: "∞", label: "Ideas" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group min-w-0 text-center transition-colors hover:text-accent"
                >
                  <div className="font-display text-3xl font-bold text-text group-hover:text-accent sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-body text-[10px] uppercase tracking-[0.16em] text-muted group-hover:text-accent/80 sm:text-xs sm:tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="mb-10 flex items-center justify-center gap-2 font-body text-sm text-muted sm:mb-12 lg:justify-start">
              <MapPin size={14} className="text-accent" />
              {PERSONAL_INFO.location}
            </div>

            {/* CTAs */}
            <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4 lg:justify-start">
              <button
                onClick={() =>
                  document.querySelector("#show-ofs")?.scrollIntoView({ behavior: "smooth" })
                }
                className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3.5 font-display text-sm font-semibold text-bg glow transition-all hover:bg-accent/90 sm:w-auto"
              >
                <Smartphone size={16} />
                See My Work
              </button>
              <button
                onClick={() =>
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-border bg-surface/80 px-7 py-3.5 font-body text-sm text-text shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all hover:border-accent/40 hover:bg-surface hover:text-accent sm:w-auto"
              >
                Get In Touch
              </button>
            </div>
          </div>

          <div
            className="hidden h-[480px] w-full max-w-lg tilt-card lg:block"
            onMouseMove={handleTiltMove}
            onMouseLeave={handleTiltLeave}
          >
            <div className="tilt-card-inner rounded-3xl border border-border/60 bg-surface/50 overflow-hidden">
              <Image
                src={PERSONAL_INFO.profileImage}
                alt={`${PERSONAL_INFO.firstName} ${PERSONAL_INFO.lastName}`}
                fill
                priority
                sizes="(min-width: 1024px) 32rem, 0px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4 sm:bottom-10">
        <button
          onClick={scrollToAbout}
          className="pointer-events-auto flex flex-col items-center gap-2 text-muted transition-colors hover:text-accent animate-float"
          aria-label="Scroll down"
        >
          <span className="font-mono text-xs tracking-widest uppercase">Scroll</span>
          <ArrowDown size={16} />
        </button>
      </div>
    </section>
  );
}
