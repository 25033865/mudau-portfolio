"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, PERSONAL_INFO } from "@/lib/data";
import { cn } from "@/lib/utils";

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Sticky top nav. Becomes solid on scroll, collapses to hamburger on mobile.
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Track scroll for background + active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    const sections = ["hero", ...NAV_ITEMS.map((item) => item.href.replace("#", ""))]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.35, 0.6] }
    );

    sections.forEach((section) => observer.observe(section));
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "py-3 bg-bg/90 backdrop-blur-xl border-b border-border"
          : "py-4 sm:py-6 bg-transparent"
      )}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Name */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display font-bold text-lg tracking-tight text-text hover:text-accent transition-colors"
        >
          <span className="gradient-text">RM</span>
          <span className="ml-2 text-muted font-body font-normal text-sm hidden sm:inline">
            Mudau
          </span>
        </button>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-5 lg:gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "font-body text-sm font-medium transition-colors hover:text-accent",
                  activeSection === item.href.replace("#", "")
                    ? "text-accent"
                    : "text-muted"
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={() => handleNavClick("#contact")}
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium font-body border border-accent/40 text-accent rounded-lg hover:bg-accent/10 transition-all"
        >
          Let&apos;s Talk
        </button>

        {/* Mobile Menu Toggle */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:text-text md:hidden transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full flex max-h-[calc(100svh-72px)] flex-col gap-4 overflow-y-auto border-b border-border bg-surface/[0.98] px-4 py-5 shadow-2xl shadow-black/30 md:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-left font-body text-base text-muted hover:text-accent transition-colors py-1"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#contact")}
            className="mt-2 w-full text-center px-4 py-3 text-sm font-medium font-body border border-accent/40 text-accent rounded-lg hover:bg-accent/10 transition-all"
          >
            Let&apos;s Talk
          </button>
        </div>
      )}
    </header>
  );
}
