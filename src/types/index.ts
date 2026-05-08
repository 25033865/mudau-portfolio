// ─── Project Types ───────────────────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  platform: "ios" | "android" | "cross-platform" | "web";
  status: "live" | "in-progress" | "concept";
  year: number;
  imageUrl?: string;
  detailUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

// ─── Skill Types ─────────────────────────────────────────────────────────────
export interface Skill {
  name: string;
  icon: string;
  category: "mobile" | "frontend" | "backend" | "tools" | "design";
  level: number; // 1-5
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

// ─── Experience Types ─────────────────────────────────────────────────────────
export interface Experience {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  startDate: string;
  endDate?: string; // undefined means "Present"
  description: string;
  highlights: string[];
  technologies: string[];
}

// ─── Social / Contact Types ───────────────────────────────────────────────────
export interface SocialLink {
  platform: string;
  url: string;
  handle: string;
  icon: string;
}

export interface ContactInfo {
  email: string;
  location: string;
  availability: string;
  socials: SocialLink[];
}

// ─── Navigation Types ─────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
}

// ─── Testimonial Types ───────────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  avatar?: string;
}
