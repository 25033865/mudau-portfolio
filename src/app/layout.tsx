import type { Metadata } from "next";
import "@/styles/globals.css";
import { PERSONAL_INFO } from "@/lib/data";
import CustomCursor from "@/components/ui/CustomCursor";
import PageIntro from "@/components/ui/PageIntro";
import ScrollProgress from "@/components/ui/ScrollProgress";

// ─── Page Metadata ────────────────────────────────────────────────────────────
// Edit the metadata to match your personal info and SEO keywords.
export const metadata: Metadata = {
  title: `${PERSONAL_INFO.name} — ${PERSONAL_INFO.title}`,
  description: `${PERSONAL_INFO.shortBio} ${PERSONAL_INFO.tagline}`,
  keywords: [
    "App Developer",
    "Flutter Developer",
    "React Native Developer",
    "Mobile Developer South Africa",
    "Mudau Rotondwa",
    "Portfolio",
  ],
  authors: [{ name: PERSONAL_INFO.name }],
  openGraph: {
    title: `${PERSONAL_INFO.name} — ${PERSONAL_INFO.title}`,
    description: PERSONAL_INFO.tagline,
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
  return (
    <html lang="en">
      <body className="noise grid-bg">
        <PageIntro />
        <ScrollProgress />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
