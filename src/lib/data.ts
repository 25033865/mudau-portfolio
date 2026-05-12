import type { Project, Experience, ContactInfo, NavItem } from "@/types";

// ─── Personal Info ────────────────────────────────────────────────────────────
// Edit your personal details here.
export const PERSONAL_INFO = {
  name: "Mudau Rotondwa Agriment",
  firstName: "Rotondwa",
  lastName: "Mudau",
  title: "App Developer",
  tagline: "Crafting mobile experiences that users love.",
  bio: `I'm a passionate App Developer based in South Africa, specialising in building
        polished, high-performance mobile applications for iOS and Android. From concept
        to deployment, I turn ideas into intuitive digital products that make a real impact.`,
  shortBio: "App Developer · South Africa · Building apps people love.",
  yearsOfExperience: 2,
  projectsCompleted: 3,
  location: "South Africa",
  availability: "Available for freelance & full-time opportunities",
  profileImage: "https://firebasestorage.googleapis.com/v0/b/mudau-1d1cb.firebasestorage.app/o/Mudau.PNG?alt=media&token=d4d82d50-4a87-4c9e-b81c-3e2c580901b1", // replace with your actual photo
  resumeUrl: "/resume.pdf",            // place your CV in /public/resume.pdf
};

// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

// ─── Skills ───────────────────────────────────────────────────────────────────
// Add / remove skills as needed.
export const SKILLS = {
  mobile: [
    { name: "Flutter", icon: "flutter" },
    { name: "React Native", icon: "react" },
    { name: "Kotlin (basics)", icon: "kotlin" },
  ],
  frontend: [
    { name: "React.js", icon: "react" },
    { name: "Next.js", icon: "nextjs" },
    { name: "TypeScript", icon: "typescript" },
    { name: "Tailwind CSS", icon: "tailwindcss" },
    { name: "HTML5 / CSS3", icon: "html5" },
  ],
  backend: [
    { name: "Firebase", icon: "firebase" },
    { name: "Supabase", icon: "supabase" },
    { name: "Node.js", icon: "nodejs" },
  ],
  tools: [
    { name: "Git & GitHub", icon: "git" },
    { name: "VS Code", icon: "vscode" },
    { name: "Android Studio", icon: "androidstudio" },
    { name: "NetBeans", icon: "netbeans" },
  ],
  design: [
    { name: "Figma", icon: "figma" },
    { name: "DaisyUI", icon: "daisyui" },
    { name: "UI/UX Design", icon: "uiux" },
  ],
};

// ─── Projects ─────────────────────────────────────────────────────────────────
// Replace these with your real projects.
export const PROJECTS: Project[] = [
  {
    id: "proj-01",
    title: "Mini Morabaraba",
    description: "A web game that will test your brain with strategic moves, careful planning, and quick decisions.",
    longDescription: "Mini Morabaraba is a web game that challenges players to think ahead, protect their pieces, and outsmart their opponent with every move.",
    detailUrl: "/projects/mini-morabaraba",
    tags: ["Web Game", "Strategy", "JavaScript", "HTML5"],
    platform: "web",
    status: "live",
    year: 2025,
    featured: true,
  },
  {
    id: "proj-02",
    title: "QR Code Generator",
    description: "QR code generator app for links, text, and contact cards with instant preview and export.",
    longDescription: "A cross-platform QR code generator with size and color controls, saved history, and PNG/SVG export for sharing.",
    tags: ["React Native", "Expo", "TypeScript", "QR Code"],
    icon: "qr-code",
    platform: "cross-platform",
    status: "in-progress",
    year: 2024,
    featured: true,
  },
  {
    id: "proj-03",
    title: "RoomRadar",
    description: "RoomRadar is a booking-style app for discovering, comparing, and reserving rooms and stays.",
    longDescription: "RoomRadar is an accommodation booking app under development, built to help users search for rooms, compare options, view details, and reserve stays with a smooth mobile-first experience.",
    tags: ["Room Booking", "Search", "Reservations", "UI/UX"],
    platform: "cross-platform",
    status: "in-progress",
    year: 2025,
    imageUrl: "/projects/roomradar-icon.svg",
    section: "projects",
    featured: true,
  },
  {
    id: "proj-04",
    title: "StudyBuddy",
    description: "AI-powered study planner that generates personalised schedules, flashcards, and quizzes from your notes.",
    detailUrl: "/projects/studybuddy",
    tags: ["Flutter", "OpenAI API", "Firebase", "Dart"],
    platform: "cross-platform",
    status: "in-progress",
    year: 2025,
    featured: true,
  },
  {
    id: "proj-05",
    title: "FitTrack Pro",
    description: "Workout tracker with custom plans, progress analytics, and social challenges for fitness enthusiasts.",
    tags: ["React Native", "GraphQL", "Node.js", "TypeScript"],
    platform: "cross-platform",
    status: "in-progress",
    year: 2023,
    featured: false,
  },
  {
    id: "proj-06",
    title: "LocalBites",
    description: "Food discovery app connecting users with authentic local restaurants and hidden gems across South Africa.",
    tags: ["Flutter", "Google Maps API", "Firebase"],
    platform: "android",
    status: "in-progress",
    year: 2023,
    featured: false,
  },
  {
    id: "proj-07",
    title: "TaskFlow",
    description: "Minimal yet powerful task management app with kanban boards, team collaboration, and deadline reminders.",
    tags: ["React Native", "Supabase", "TypeScript", "Expo"],
    platform: "cross-platform",
    status: "in-progress",
    year: 2025,
    featured: false,
  },
  {
    id: "proj-08",
    title: "Personal Portfolio",
    description: "My personal portfolio website showcasing my work, skills, experience, and contact details in one polished web presence.",
    longDescription: "A personal portfolio website built to present my developer profile, featured projects, technical skills, and ways to get in touch.",
    tags: ["Next.js", "Portfolio", "Tailwind CSS", "Responsive"],
    platform: "web",
    platformLabel: "Website",
    icon: "portfolio",
    status: "live",
    year: 2026,
    liveUrl: "https://mudau.me/",
    section: "projects",
    featured: true,
  },
];

// ─── Experience ───────────────────────────────────────────────────────────────
// Replace with your real work history.
export const EXPERIENCES: Experience[] = [
  {
    id: "exp-01",
    role: "App Developer",
    company: "Freelance",
    startDate: "Jan 2022",
    description: "Building custom mobile apps for startups and businesses across various industries.",
    highlights: [
      "Delivered 12+ cross-platform applications for clients in SA and internationally",
      "Specialised in Flutter and React Native with Firebase/Supabase backends",
      "Managed full project lifecycle from discovery to App Store deployment",
    ],
    technologies: ["Flutter", "React Native", "Firebase", "TypeScript", "Figma"],
  },
  {
    id: "exp-02",
    role: "Junior App Developer",
    company: "TechStartup SA",
    startDate: "Jun 2022",
    endDate: "Dec 2023",
    description: "Contributed to the development of consumer-facing mobile apps used by thousands of daily active users.",
    highlights: [
      "Built and maintained 3 production React Native apps",
      "Improved app startup performance by 40% through bundle optimisation",
      "Collaborated with UI/UX team to implement design systems",
    ],
    technologies: ["React Native", "TypeScript", "Supabase", "Figma", "Git"],
  },
];

// ─── Contact ──────────────────────────────────────────────────────────────────
// Update with your real contact info.
export const CONTACT_INFO: ContactInfo = {
  email: "mudaurotondwaagriment2007@gmail.com", // replace with your email
  phone: "+27 64 624 3837",
  location: "South Africa (Remote-Friendly)",
  availability: "Open to freelance projects & full-time roles",
  socials: [
    {
      platform: "GitHub",
      url: "https://github.com/25033865", // replace
      handle: "@25033865",
      icon: "github",
    },
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/mudau-rotondwa-agriment-924987383", // replace
      handle: "Rotondwa Mudau",
      icon: "linkedin",
    },
    {
      platform: "WhatsApp",
      url: "https://wa.me/27646243837", // replace
      handle: "+27 64 624 3837",
      icon: "whatsapp",
    },
  ],
};
