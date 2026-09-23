import type { Metadata } from "next";
import "@/styles/globals.css";
import { PERSONAL_INFO } from "@/lib/data";
import CustomCursor from "@/components/ui/CustomCursor";
import PageIntro from "@/components/ui/PageIntro";
import ScrollProgress from "@/components/ui/ScrollProgress";

const themeInitScript = `
(() => {
  try {
    const storageKey = "mudau-theme";
    const stored = window.localStorage.getItem(storageKey);
    const theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

// ─── Page Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://mudau.me"),
  title: `${PERSONAL_INFO.name} — ${PERSONAL_INFO.title}`,
  description: `${PERSONAL_INFO.shortBio} ${PERSONAL_INFO.tagline}`,
  keywords: [
    "App Developer",
    "Flutter Developer",
    "React Native Developer",
    "Mobile Developer South Africa",
    "Mudau Rotondwa",
    "Mudau Rotondwa Agriment",
    "Portfolio",
  ],
  authors: [{ name: PERSONAL_INFO.name }],
  openGraph: {
    title: `${PERSONAL_INFO.name} — ${PERSONAL_INFO.title}`,
    description: PERSONAL_INFO.tagline,
    url: "https://mudau.me",
    siteName: PERSONAL_INFO.name,
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data (JSON-LD) for Google Knowledge Graph & Identity Matching
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSONAL_INFO.name,
    url: "https://mudau.me",
    jobTitle: PERSONAL_INFO.title,
    sameAs: [
      "https://github.com/25033865",
      "https://www.linkedin.com/in/mudau-rotondwa-agriment-924987383",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="noise grid-bg">
        <PageIntro />
        <ScrollProgress />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}