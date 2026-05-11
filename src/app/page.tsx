import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ShowOfsSection from "@/components/sections/ShowOfsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import ContactSection from "@/components/sections/ContactSection";

// ─── Home Page ────────────────────────────────────────────────────────────────
// This is the entry point of the portfolio.
// Each section is a separate component — easy to edit individually.
export default function Home() {
  return (
    <main className="page-shell-enter relative min-h-screen bg-bg grid-bg">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ShowOfsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
