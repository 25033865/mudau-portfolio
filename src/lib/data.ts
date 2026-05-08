import type { Project, Experience, ContactInfo, NavItem } from "@/types";

// ─── Personal Info ────────────────────────────────────────────────────────────
// ✏️  Edit your personal details here
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
  projectsCompleted: 12,
  location: "South Africa",
  availability: "Available for freelance & full-time opportunities",
  profileImage: "https://firebasestorage.googleapis.com/v0/b/mudau-1d1cb.firebasestorage.app/o/musa.jpeg?alt=media&token=e25605e8-e9df-4990-836a-edd2f2f11ff8", // replace with your actual photo
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
// ✏️  Add / remove skills as needed
export const SKILLS = {
  mobile: [
    { name: "Flutter", icon: "📱" },
    { name: "React Native", icon: "⚛️" },
    { name: "Kotlin (basics)", icon: "🤖" },
  ],
  frontend: [
    { name: "React.js", icon: "⚛️" },
    { name: "Next.js", icon: "▲" },
    { name: "TypeScript", icon: "🔷" },
    { name: "Tailwind CSS", icon: "🎨" },
    { name: "HTML5 / CSS3", icon: "🌐" },
  ],
  backend: [
    { name: "Firebase", icon: "🔥" },
    { name: "Supabase", icon: "⚡" },
    { name: "Node.js", icon: "🟢" },
  ],
  tools: [
    { name: "Git & GitHub", icon: "🐙" },
    { name: "VS Code", icon: "💻" },
    { name: "Android Studio", icon: "🤖" },
    { name: "NetBeans", icon: "🧑‍💻" },
  ],
  design: [
    { name: "Figma", icon: "✏️" },
    { name: "DaisyUI", icon: "🌼" },
    { name: "UI/UX Design", icon: "🖼️" },
  ],
};

// ─── Projects ─────────────────────────────────────────────────────────────────
// ✏️  Replace these with your real projects
export const PROJECTS: Project[] = [
  {
    id: "proj-01",
    title: "AgriSense",
    description: "Smart farming companion app helping South African farmers track soil health, weather, and crop cycles in real-time.",
    longDescription: "Built with Flutter and Firebase, AgriSense connects to IoT sensors to deliver real-time soil and weather data. Includes push notifications, offline mode, and crop advisory powered by ML.",
    tags: ["Flutter", "Firebase", "IoT", "Machine Learning"],
    platform: "cross-platform",
    status: "live",
    year: 2024,
    featured: true,
  },
  {
    id: "proj-02",
    title: "PayFlow",
    description: "Peer-to-peer payment app with instant transfers, split bills, and transaction analytics for everyday users.",
    longDescription: "A React Native fintech app featuring biometric authentication, end-to-end encryption, and beautiful spending dashboards. Integrated with Stripe and supports ZAR / USD.",
    tags: ["React Native", "Stripe", "Supabase", "TypeScript"],
    platform: "cross-platform",
    status: "live",
    year: 2024,
    featured: true,
  },
  {
    id: "proj-03",
    title: "StudyBuddy",
    description: "AI-powered study planner that generates personalised schedules, flashcards, and quizzes from your notes.",
    tags: ["Flutter", "OpenAI API", "Firebase", "Dart"],
    platform: "cross-platform",
    status: "in-progress",
    year: 2025,
    featured: true,
  },
  {
    id: "proj-04",
    title: "FitTrack Pro",
    description: "Workout tracker with custom plans, progress analytics, and social challenges for fitness enthusiasts.",
    tags: ["React Native", "GraphQL", "Node.js", "TypeScript"],
    platform: "cross-platform",
    status: "live",
    year: 2023,
    featured: false,
  },
  {
    id: "proj-05",
    title: "LocalBites",
    description: "Food discovery app connecting users with authentic local restaurants and hidden gems across South Africa.",
    tags: ["Flutter", "Google Maps API", "Firebase"],
    platform: "android",
    status: "live",
    year: 2023,
    featured: false,
  },
  {
    id: "proj-06",
    title: "TaskFlow",
    description: "Minimal yet powerful task management app with kanban boards, team collaboration, and deadline reminders.",
    tags: ["React Native", "Supabase", "TypeScript", "Expo"],
    platform: "cross-platform",
    status: "concept",
    year: 2025,
    featured: false,
  },
];

// ─── Experience ───────────────────────────────────────────────────────────────
// ✏️  Replace with your real work history
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
// ✏️  Update with your real contact info
export const CONTACT_INFO: ContactInfo = {
  email: "mudaurotondwaagriment2007@gmail.com", // replace with your email
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
      url: "https://linkedin.com/in/mudaurotondwa", // replace
      handle: "Rotondwa Mudau",
      icon: "linkedin",
    },
    {
      platform: "Twitter / X",
      url: "https://twitter.com/mudaurotondwa", // replace
      handle: "@mudaurotondwa",
      icon: "twitter",
    },
  ],
};
