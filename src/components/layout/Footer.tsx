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
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Name & Credit */}
        <p className="font-body text-sm text-muted text-center md:text-left">
          © {year}{" "}
          <span className="text-text font-medium">{PERSONAL_INFO.name}</span>
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {CONTACT_INFO.socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.platform}
              className="text-muted hover:text-accent transition-colors"
            >
              {iconMap[social.icon] ?? social.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
