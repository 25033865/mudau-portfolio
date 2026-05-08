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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          : "py-6 bg-transparent"
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">
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
        <ul className="hidden md:flex items-center gap-8">
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
        <a
          href={PERSONAL_INFO.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium font-body border border-accent/40 text-accent rounded-lg hover:bg-accent/10 transition-all"
        >
          Download CV
        </a>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-muted hover:text-text transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface border-b border-border px-6 py-6 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-left font-body text-base text-muted hover:text-accent transition-colors py-1"
            >
              {item.label}
            </button>
          ))}
          <a
            href={PERSONAL_INFO.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full text-center px-4 py-3 text-sm font-medium font-body border border-accent/40 text-accent rounded-lg hover:bg-accent/10 transition-all"
          >
            Download CV
          </a>
        </div>
      )}
    </header>
  );
}
