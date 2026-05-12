"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import ProjectGallery from "@/components/sections/ProjectGallery";
import { PROJECTS } from "@/lib/data";

const showOfsProjects = PROJECTS.filter((project) => project.section !== "projects");

export default function ShowOfsSection() {
  return (
    <section id="show-ofs" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="absolute right-1/2 top-0 h-[220px] w-[360px] translate-x-1/2 rounded-full bg-accent/4 blur-[100px] pointer-events-none sm:h-[300px] sm:w-[600px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeader
          label="Portfolio"
          title="Show"
          titleAccent="OFS"
        />
        <ProjectGallery projects={showOfsProjects} />
      </div>
    </section>
  );
}
