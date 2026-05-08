import { PERSONAL_INFO, CONTACT_INFO } from "@/lib/data";
import { Github, Linkedin, MessageCircle } from "lucide-react";

// ─── Footer ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();

  const iconMap: Record<string, React.ReactNode> = {
    github: <Github size={16} />,
    linkedin: <Linkedin size={16} />,
    whatsapp: <MessageCircle size={16} />,
  };

  return (
    <footer className="border-t border-border px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        {/* Name & Credit */}
        <p className="font-body text-sm text-muted text-center md:text-left">
          © {year}{" "}
          <span className="text-text font-medium">{PERSONAL_INFO.name}</span>
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          {CONTACT_INFO.socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:text-accent"
            >
              {iconMap[social.icon] ?? social.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
