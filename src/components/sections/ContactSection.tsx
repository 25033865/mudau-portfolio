"use client";

import { useState } from "react";
import { Mail, MapPin, Github, Linkedin, MessageCircle, Send, CheckCircle } from "lucide-react";
import { CONTACT_INFO, PERSONAL_INFO } from "@/lib/data";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

// ─── Contact Section ──────────────────────────────────────────────────────────
// Edit contact details in CONTACT_INFO inside /src/lib/data.ts
// The form below is a mailto form — wire it to a backend (Resend, EmailJS, etc.) if needed.

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={18} />,
  linkedin: <Linkedin size={18} />,
  whatsapp: <MessageCircle size={18} />,
};

export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Replace this with your preferred email handler (EmailJS, Resend, Formspree, etc.).
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio Inquiry from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[360px] h-[200px] sm:w-[480px] sm:h-[240px] lg:w-[600px] lg:h-[300px] bg-accent2/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeader
          label="Contact"
          title="Let's build something"
          titleAccent="together"
        />

        <div className="mt-12 sm:mt-16 grid gap-10 lg:gap-12 lg:grid-cols-2 items-start">
          {/* Left – Info */}
          <ScrollReveal className="space-y-8">
            <p className="font-body text-muted text-base sm:text-lg leading-relaxed">
              Have an app idea? Want to collaborate? Or just want to say hi?
              I&apos;d love to hear from you. I typically reply within 24 hours.
            </p>

            {/* Contact Details */}
            <div className="space-y-3 sm:space-y-4">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-4 p-4 sm:p-5 glass rounded-xl hover:border-accent/30 transition-all group"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
                  <Mail size={18} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-body text-xs text-muted mb-0.5 uppercase tracking-wider">Email</p>
                  <p className="font-body text-text text-sm break-all sm:break-normal">{CONTACT_INFO.email}</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 sm:p-5 glass rounded-xl hover:border-accent/30 transition-all group">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
                  <MapPin size={18} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-body text-xs text-muted mb-0.5 uppercase tracking-wider">Location</p>
                  <p className="font-body text-sm text-text">{CONTACT_INFO.location}</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="font-body text-xs text-muted uppercase tracking-widest mb-4">
                Find me on
              </p>
              <div className="flex flex-wrap gap-3">
                {CONTACT_INFO.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    className="w-12 h-12 glass rounded-xl flex items-center justify-center text-muted hover:text-accent hover:border-accent/30 hover:shadow-[0_0_24px_rgba(0,229,255,0.35)] transition-all"
                  >
                    {iconMap[social.icon] ?? social.platform[0]}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right – Contact Form */}
          <ScrollReveal className="glass rounded-2xl p-6 sm:p-8" delay={0.1}>
            <h3 className="font-display font-bold text-text text-xl mb-6">
              Send a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block font-body text-xs text-muted uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Mudau Rotondwa"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-body text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-body text-xs text-muted uppercase tracking-wider mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="hello@example.com"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-body text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-body text-xs text-muted uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or idea..."
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-body text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 bg-accent text-bg font-display font-semibold text-sm rounded-xl hover:bg-accent/90 transition-all glow"
              >
                {sent ? (
                  <>
                    <CheckCircle size={16} />
                    Email Client Opened!
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
