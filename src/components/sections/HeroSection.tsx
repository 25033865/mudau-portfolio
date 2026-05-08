"use client";

import { useEffect, useState } from "react";
import { ArrowDown, MapPin, Smartphone } from "lucide-react";
import { PERSONAL_INFO, CONTACT_INFO } from "@/lib/data";

// ─── Hero Section ─────────────────────────────────────────────────────────────
// The first thing visitors see. Edit PERSONAL_INFO in /src/lib/data.ts
export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const roles = ["App Developer", "Flutter Expert", "React Native Dev", "UI/UX Enthusiast"];
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Typewriter effect for rotating roles
  useEffect(() => {
    const current = roles[roleIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.slice(0, displayText.length + 1));
        if (displayText === current) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setDisplayText(current.slice(0, displayText.length - 1));
        if (displayText === "") {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, isDeleting ? 50 : 90);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, roleIndex]);

  const scrollToAbout = () => {
    document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 grid-bg overflow-hidden"
    >
      {/* Animated Blob Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent2/5 rounded-full blur-[80px] animate-blob animation-delay-2" />
        <div className="absolute top-3/4 left-1/2 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[60px] animate-blob animation-delay-4" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Availability Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border glass mb-8 text-sm font-mono text-muted"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {PERSONAL_INFO.availability}
        </div>

        {/* Name */}
        <h1 className="font-display font-bold leading-[1.05] mb-4">
          <span className="block text-5xl sm:text-7xl md:text-8xl text-text">
            {PERSONAL_INFO.firstName}
          </span>
          <span className="block text-5xl sm:text-7xl md:text-8xl gradient-text glow-text">
            {PERSONAL_INFO.lastName}
          </span>
        </h1>

        {/* Typewriter Role */}
        <div className="h-10 flex items-center justify-center mb-6">
          <span className="font-mono text-xl sm:text-2xl text-accent">
            {displayText}
            <span className="animate-pulse">|</span>
          </span>
        </div>

        {/* Bio */}
        <p className="font-body text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed mb-10">
          {PERSONAL_INFO.tagline}
          {" "}I build cross-platform mobile apps that are fast, beautiful, and
          loved by users — from concept to deployment.
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mb-12">
          {[
            { value: `${PERSONAL_INFO.yearsOfExperience}+`, label: "Years Exp" },
            { value: `${PERSONAL_INFO.projectsCompleted}+`, label: "Apps Built" },
            { value: "∞", label: "Ideas" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-bold text-3xl sm:text-4xl text-text">
                {stat.value}
              </div>
              <div className="font-body text-xs text-muted mt-1 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="flex items-center justify-center gap-2 text-muted text-sm font-body mb-12">
          <MapPin size={14} className="text-accent" />
          {PERSONAL_INFO.location}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() =>
              document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })
            }
            className="group flex items-center gap-2 px-7 py-3.5 bg-accent text-bg font-display font-semibold text-sm rounded-xl hover:bg-accent/90 transition-all glow"
          >
            <Smartphone size={16} />
            See My Work
          </button>
          <button
            onClick={() =>
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2 px-7 py-3.5 border border-border text-text font-body text-sm rounded-xl hover:border-accent/40 hover:text-accent transition-all"
          >
            Get In Touch
          </button>
        </div>
      </div>

      {/* Scroll Hint */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted hover:text-accent transition-colors animate-float"
        aria-label="Scroll down"
      >
        <span className="font-mono text-xs tracking-widest uppercase">Scroll</span>
        <ArrowDown size={16} />
      </button>
    </section>
  );
}
