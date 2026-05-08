# 🚀 Mudau Rotondwa Agriment — Portfolio

A personal developer portfolio built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx          ← Root layout + <head> metadata (SEO title, description)
│   └── page.tsx            ← Main page — assembles all sections in order
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      ← Top navigation bar (sticky, responsive, scroll-aware)
│   │   └── Footer.tsx      ← Footer with social links and copyright
│   │
│   ├── sections/
│   │   ├── HeroSection.tsx       ← Landing screen (name, tagline, typewriter role, CTAs)
│   │   ├── AboutSection.tsx      ← Bio, highlights, quick facts
│   │   ├── SkillsSection.tsx     ← Marquee ticker + categorised skill cards
│   │   ├── ProjectsSection.tsx   ← Filterable project grid
│   │   ├── ExperienceSection.tsx ← Timeline of work experience
│   │   └── ContactSection.tsx    ← Contact info + email form
│   │
│   └── ui/
│       ├── SectionHeader.tsx  ← Reusable heading block (label + gradient title)
│       ├── Badge.tsx          ← Pill badge component
│       └── Button.tsx         ← Consistent button component
│
├── lib/
│   ├── data.ts    ← ⭐ ALL YOUR PERSONAL DATA LIVES HERE — edit this first!
│   └── utils.ts   ← Utility functions (cn, formatDateRange, etc.)
│
├── styles/
│   └── globals.css  ← Global CSS, fonts, CSS variables, animations
│
└── types/
    └── index.ts   ← TypeScript interfaces for all data shapes
```

---

## ✏️ How to Customise

### 1. Update Your Info (`src/lib/data.ts`)
This is the **one file** you need to edit most. It contains:
- `PERSONAL_INFO` — your name, bio, stats, location
- `NAV_ITEMS` — navigation links
- `SKILLS` — your skills by category
- `PROJECTS` — your portfolio projects
- `EXPERIENCES` — your work history
- `CONTACT_INFO` — email, location, social links

### 2. Add Your Photo
Place your profile photo at:
```
public/images/profile.jpg
```

### 3. Add Your CV
Place your CV PDF at:
```
public/resume.pdf
```

### 4. Update Metadata (`src/app/layout.tsx`)
Edit the `metadata` object for SEO — title, description, keywords.

### 5. Wire Up the Contact Form (`src/components/sections/ContactSection.tsx`)
Currently uses `mailto:`. Replace with **EmailJS**, **Resend**, or **Formspree** for a proper backend.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| **Next.js 14** | React framework (App Router) |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations (ready to use) |
| **Lucide React** | Icons |
| **Clash Display** | Display font |
| **Satoshi** | Body font |
| **JetBrains Mono** | Code/mono font |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see your portfolio.

---

## 🌐 Deploy

Deploy to **Vercel** (recommended — works out of the box):

```bash
npm i -g vercel
vercel
```

Or push to GitHub and connect your repo to [vercel.com](https://vercel.com).

---

## 📄 License

MIT — feel free to use and adapt this for your personal portfolio.
