"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Globe2,
  Link2,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  QrCode,
  RefreshCcw,
  SlidersHorizontal,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";

type Mode = "url" | "phone" | "whatsapp" | "sms" | "email" | "text";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

type Theme = {
  label: string;
  fg: string;
  bg: string;
  ring: string;
};

const tabs: Array<{
  id: Mode;
  label: string;
  icon: LucideIcon;
  accent: string;
  helper: string;
}> = [
  {
    id: "url",
    label: "URL",
    icon: Link2,
    accent: "#00e5ff",
    helper: "Websites, profiles, stores, playlists, and campaigns.",
  },
  {
    id: "phone",
    label: "Call",
    icon: Phone,
    accent: "#2dd4bf",
    helper: "Tap-to-call links with South African number cleanup.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    accent: "#22c55e",
    helper: "Chat links with an optional ready-to-send message.",
  },
  {
    id: "sms",
    label: "SMS",
    icon: MessageSquare,
    accent: "#60a5fa",
    helper: "SMS links with an optional pre-filled message body.",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    accent: "#fbbf24",
    helper: "Mail links with optional subject and body fields.",
  },
  {
    id: "text",
    label: "Text",
    icon: FileText,
    accent: "#c084fc",
    helper: "Plain text, Wi-Fi strings, addresses, and promo codes.",
  },
];

const qrThemes: Theme[] = [
  { label: "Portfolio", fg: "#080B0F", bg: "#E8EDF5", ring: "#00E5FF" },
  { label: "Cyan", fg: "#00E5FF", bg: "#080B0F", ring: "#00E5FF" },
  { label: "Violet", fg: "#7B61FF", bg: "#080B0F", ring: "#7B61FF" },
  { label: "Ink", fg: "#E8EDF5", bg: "#0D1117", ring: "#8B9AB0" },
  { label: "Emerald", fg: "#34D399", bg: "#061512", ring: "#34D399" },
  { label: "Amber", fg: "#FBBF24", bg: "#151007", ring: "#FBBF24" },
];

const errorLevels: Array<{
  value: ErrorCorrectionLevel;
  label: string;
  detail: string;
}> = [
  { value: "L", label: "L", detail: "Small" },
  { value: "M", label: "M", detail: "Balanced" },
  { value: "Q", label: "Q", detail: "Reliable" },
  { value: "H", label: "H", detail: "Tough" },
];

const presets = [
  { label: "Portfolio", value: "https://mudau.me/" },
  { label: "TikTok", value: "https://www.tiktok.com/@yourname" },
  { label: "YouTube", value: "https://www.youtube.com/@yourchannel" },
  { label: "Instagram", value: "https://www.instagram.com/yourname" },
  { label: "WhatsApp", value: "https://wa.me/27646243837" },
];

const textPresets = [
  { label: "Wi-Fi", value: "WIFI:S:MyNetwork;T:WPA;P:password123;;" },
  { label: "Address", value: "123 Main Street, Cape Town, 8001, South Africa" },
  { label: "Promo", value: "SAVE20OFF" },
  { label: "Event", value: "Dev Meetup\nSaturday 15 June, 18:00\nSandton City" },
];

function normaliseSAPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("27") && digits.length >= 11) {
    return { e164: `+${digits}`, plain: digits };
  }

  if (digits.startsWith("0") && digits.length === 10) {
    const plain = `27${digits.slice(1)}`;
    return { e164: `+${plain}`, plain };
  }

  return { e164: `+${digits}`, plain: digits };
}

function buildUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function validatePhone(value: string) {
  if (!value.trim()) return "Phone number is required.";
  if (value.replace(/\D/g, "").length < 9) return "Number is too short.";
  return null;
}

function roundedRect(ctx: CanvasRenderingContext2D, size: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block font-mono text-[11px] font-medium uppercase text-muted">
      {children}
    </label>
  );
}

function FieldShell({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-center gap-2 font-mono text-xs text-rose-300">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
      {children}
    </div>
  );
}

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-lg border border-border bg-surface/80 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

export default function QRForgePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<Mode>("url");
  const [qrContent, setQrContent] = useState("");
  const [generatedCount, setGeneratedCount] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<Mode, string>>>({});
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qrSize, setQrSize] = useState(240);
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
  const [themeIndex, setThemeIndex] = useState(0);

  const [urlForm, setUrlForm] = useState({ url: "" });
  const [phoneForm, setPhoneForm] = useState({ phone: "" });
  const [whatsappForm, setWhatsappForm] = useState({ phone: "", message: "" });
  const [smsForm, setSmsForm] = useState({ phone: "", message: "" });
  const [emailForm, setEmailForm] = useState({
    email: "",
    subject: "",
    body: "",
  });
  const [textForm, setTextForm] = useState({ text: "" });

  useEffect(() => {
    document.title = "QRForge - QR Code Generator";
  }, []);

  const activeTab = tabs.find((tab) => tab.id === mode) ?? tabs[0];
  const ActiveIcon = activeTab.icon;
  const selectedTheme = qrThemes[themeIndex];

  const previewContent = useMemo(() => {
    if (mode === "url" && urlForm.url.trim()) return buildUrl(urlForm.url);

    if (mode === "phone" && phoneForm.phone.replace(/\D/g, "").length >= 6) {
      return `tel:${normaliseSAPhone(phoneForm.phone).e164}`;
    }

    if (mode === "whatsapp" && whatsappForm.phone.replace(/\D/g, "").length >= 6) {
      const { plain } = normaliseSAPhone(whatsappForm.phone);
      const message = whatsappForm.message.trim();
      return message ? `https://wa.me/${plain}?text=${encodeURIComponent(message)}` : `https://wa.me/${plain}`;
    }

    if (mode === "sms" && smsForm.phone.replace(/\D/g, "").length >= 6) {
      const { e164 } = normaliseSAPhone(smsForm.phone);
      const message = smsForm.message.trim();
      return message ? `sms:${e164}?body=${encodeURIComponent(message)}` : `sms:${e164}`;
    }

    if (mode === "email" && emailForm.email.includes("@")) {
      const params = new URLSearchParams();
      if (emailForm.subject.trim()) params.set("subject", emailForm.subject.trim());
      if (emailForm.body.trim()) params.set("body", emailForm.body.trim());
      const query = params.toString();
      return query ? `mailto:${emailForm.email.trim()}?${query}` : `mailto:${emailForm.email.trim()}`;
    }

    if (mode === "text" && textForm.text.trim()) return textForm.text.trim();

    return "";
  }, [emailForm, mode, phoneForm, smsForm, textForm, urlForm, whatsappForm]);

  function clearModeError(nextMode = mode) {
    setErrors((current) => {
      const next = { ...current };
      delete next[nextMode];
      return next;
    });
  }

  function setModeAndReset(nextMode: Mode) {
    setMode(nextMode);
    setQrContent("");
    setErrors({});
    setCopied(false);
    setDownloaded(false);
  }

  function getGeneratedContent() {
    if (mode === "url") {
      if (!urlForm.url.trim()) return { error: "URL is required.", content: "" };
      return { error: null, content: buildUrl(urlForm.url) };
    }

    if (mode === "phone") {
      const error = validatePhone(phoneForm.phone);
      return {
        error,
        content: error ? "" : `tel:${normaliseSAPhone(phoneForm.phone).e164}`,
      };
    }

    if (mode === "whatsapp") {
      const error = validatePhone(whatsappForm.phone);
      if (error) return { error, content: "" };
      const { plain } = normaliseSAPhone(whatsappForm.phone);
      const message = whatsappForm.message.trim();
      return {
        error: null,
        content: message ? `https://wa.me/${plain}?text=${encodeURIComponent(message)}` : `https://wa.me/${plain}`,
      };
    }

    if (mode === "sms") {
      const error = validatePhone(smsForm.phone);
      if (error) return { error, content: "" };
      const { e164 } = normaliseSAPhone(smsForm.phone);
      const message = smsForm.message.trim();
      return {
        error: null,
        content: message ? `sms:${e164}?body=${encodeURIComponent(message)}` : `sms:${e164}`,
      };
    }

    if (mode === "email") {
      const email = emailForm.email.trim();
      if (!email) return { error: "Email is required.", content: "" };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Enter a valid email address.", content: "" };
      }

      const params = new URLSearchParams();
      if (emailForm.subject.trim()) params.set("subject", emailForm.subject.trim());
      if (emailForm.body.trim()) params.set("body", emailForm.body.trim());
      const query = params.toString();
      return {
        error: null,
        content: query ? `mailto:${email}?${query}` : `mailto:${email}`,
      };
    }

    const text = textForm.text.trim();
    if (!text) return { error: "Text is required.", content: "" };
    if (text.length > 1800) return { error: "Keep text below 1800 characters.", content: "" };
    return { error: null, content: text };
  }

  function generate() {
    const result = getGeneratedContent();

    if (result.error) {
      setErrors({ [mode]: result.error });
      return;
    }

    setErrors({});
    setQrContent(result.content);
    setGeneratedCount((current) => current + 1);
    setCopied(false);
    setDownloaded(false);
  }

  function reset() {
    setQrContent("");
    setShowSettings(false);
    setCopied(false);
    setDownloaded(false);
    setErrors({});
  }

  async function copyEncodedContent() {
    if (!qrContent) return;

    try {
      await navigator.clipboard.writeText(qrContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 32;
    const size = canvas.width + padding * 2;
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;

    const context = offscreen.getContext("2d");
    if (!context) return;

    roundedRect(context, size, 20);
    context.clip();
    context.fillStyle = selectedTheme.bg;
    context.fillRect(0, 0, size, size);
    context.drawImage(canvas, padding, padding);

    const link = document.createElement("a");
    link.download = "qrforge.png";
    link.href = offscreen.toDataURL("image/png");
    link.click();

    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1800);
  }

  return (
    <main className="qrforge-page min-h-screen bg-bg text-text">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(0,229,255,0.12),transparent)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <Link
            href="/#projects"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-transparent bg-transparent px-3 text-sm text-muted transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
          >
            <ArrowLeft size={16} />
            Portfolio
          </Link>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/70 px-3 py-2 font-mono text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_rgba(0,229,255,0.8)]" />
            {generatedCount} generated
          </div>
        </header>

        <section className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:items-end">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 font-mono text-xs text-accent">
              <Zap size={14} />
              QRForge
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight text-text sm:text-5xl">
              Smart QR code generator<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-[15px]">
              Built as a fast portfolio tool with instant preview, PNG export, and clean QR actions for real-world sharing.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-surface/60 p-2">
            {[
              { label: "Modes", value: tabs.length },
              { label: "Export", value: "PNG" },
              { label: "Data", value: "Local" },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-md border border-border bg-bg/60 p-3 text-center">
                <div className="font-display text-lg font-bold text-accent">{item.value}</div>
                <div className="mt-1 font-mono text-[10px] uppercase text-muted">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
          <Panel className="self-start">
            <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const active = tab.id === mode;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModeAndReset(tab.id)}
                    className={cn(
                      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm transition",
                      active
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-border text-muted hover:border-accent/30 hover:text-text"
                    )}
                  >
                    <TabIcon size={16} style={{ color: active ? tab.accent : undefined }} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mb-5 rounded-lg border border-border bg-bg/50 p-4">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: `${activeTab.accent}55`,
                    backgroundColor: `${activeTab.accent}16`,
                    color: activeTab.accent,
                  }}
                >
                  <ActiveIcon size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-text">{activeTab.label} QR</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{activeTab.helper}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {mode === "url" && (
                <>
                  <FieldShell>
                    <SmallLabel>Quick presets</SmallLabel>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setUrlForm({ url: preset.value });
                            clearModeError("url");
                          }}
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-muted transition hover:border-accent/40 hover:text-accent"
                        >
                          <Wand2 size={14} />
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </FieldShell>

                  <FieldShell>
                    <SmallLabel>Website or social link</SmallLabel>
                    <div className="relative">
                      <Globe2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
                      <input
                        type="url"
                        value={urlForm.url}
                        onChange={(event) => {
                          setUrlForm({ url: event.target.value });
                          clearModeError("url");
                        }}
                        onKeyDown={(event) => event.key === "Enter" && generate()}
                        placeholder="https://example.com"
                        className="min-h-11 w-full rounded-lg border border-border bg-bg/80 py-3 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                      />
                    </div>
                    {errors.url && <ErrorText>{errors.url}</ErrorText>}
                  </FieldShell>
                </>
              )}

              {mode === "phone" && (
                <FieldShell>
                  <SmallLabel>Phone number</SmallLabel>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
                    <input
                      type="tel"
                      value={phoneForm.phone}
                      onChange={(event) => {
                        setPhoneForm({ phone: event.target.value });
                        clearModeError("phone");
                      }}
                      onKeyDown={(event) => event.key === "Enter" && generate()}
                      placeholder="0821234567 or +27821234567"
                      className="min-h-11 w-full rounded-lg border border-border bg-bg/80 py-3 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                    />
                  </div>
                  {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                </FieldShell>
              )}

              {mode === "whatsapp" && (
                <>
                  <FieldShell>
                    <SmallLabel>WhatsApp number</SmallLabel>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
                      <input
                        type="tel"
                        value={whatsappForm.phone}
                        onChange={(event) => {
                          setWhatsappForm((current) => ({ ...current, phone: event.target.value }));
                          clearModeError("whatsapp");
                        }}
                        placeholder="0821234567 or +27821234567"
                        className="min-h-11 w-full rounded-lg border border-border bg-bg/80 py-3 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                      />
                    </div>
                    {errors.whatsapp && <ErrorText>{errors.whatsapp}</ErrorText>}
                  </FieldShell>
                  <FieldShell>
                    <div className="flex items-center justify-between gap-3">
                      <SmallLabel>Message</SmallLabel>
                      <span className="font-mono text-xs text-muted">{whatsappForm.message.length}/200</span>
                    </div>
                    <textarea
                      rows={3}
                      value={whatsappForm.message}
                      onChange={(event) =>
                        setWhatsappForm((current) => ({
                          ...current,
                          message: event.target.value.slice(0, 200),
                        }))
                      }
                      placeholder="Optional WhatsApp message"
                      className="min-h-24 w-full resize-none rounded-lg border border-border bg-bg/80 p-3 text-sm leading-6 text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                    />
                  </FieldShell>
                </>
              )}

              {mode === "sms" && (
                <>
                  <FieldShell>
                    <SmallLabel>Phone number</SmallLabel>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
                      <input
                        type="tel"
                        value={smsForm.phone}
                        onChange={(event) => {
                          setSmsForm((current) => ({ ...current, phone: event.target.value }));
                          clearModeError("sms");
                        }}
                        placeholder="0821234567 or +27821234567"
                        className="min-h-11 w-full rounded-lg border border-border bg-bg/80 py-3 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                      />
                    </div>
                    {errors.sms && <ErrorText>{errors.sms}</ErrorText>}
                  </FieldShell>
                  <FieldShell>
                    <div className="flex items-center justify-between gap-3">
                      <SmallLabel>SMS body</SmallLabel>
                      <span className="font-mono text-xs text-muted">{smsForm.message.length}/160</span>
                    </div>
                    <textarea
                      rows={3}
                      value={smsForm.message}
                      onChange={(event) =>
                        setSmsForm((current) => ({
                          ...current,
                          message: event.target.value.slice(0, 160),
                        }))
                      }
                      placeholder="Optional SMS message"
                      className="min-h-24 w-full resize-none rounded-lg border border-border bg-bg/80 p-3 text-sm leading-6 text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                    />
                  </FieldShell>
                </>
              )}

              {mode === "email" && (
                <>
                  <FieldShell>
                    <SmallLabel>Email address</SmallLabel>
                    <div className="relative">
                      <AtSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
                      <input
                        type="email"
                        value={emailForm.email}
                        onChange={(event) => {
                          setEmailForm((current) => ({ ...current, email: event.target.value }));
                          clearModeError("email");
                        }}
                        placeholder="recipient@example.com"
                        className="min-h-11 w-full rounded-lg border border-border bg-bg/80 py-3 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                      />
                    </div>
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                  </FieldShell>
                  <FieldShell>
                    <SmallLabel>Subject</SmallLabel>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(event) =>
                        setEmailForm((current) => ({ ...current, subject: event.target.value }))
                      }
                      placeholder="Enquiry from QR code"
                      className="min-h-11 w-full rounded-lg border border-border bg-bg/80 px-3 py-3 text-sm text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                    />
                  </FieldShell>
                  <FieldShell>
                    <div className="flex items-center justify-between gap-3">
                      <SmallLabel>Body</SmallLabel>
                      <span className="font-mono text-xs text-muted">{emailForm.body.length}/500</span>
                    </div>
                    <textarea
                      rows={3}
                      value={emailForm.body}
                      onChange={(event) =>
                        setEmailForm((current) => ({
                          ...current,
                          body: event.target.value.slice(0, 500),
                        }))
                      }
                      placeholder="Optional email body"
                      className="min-h-24 w-full resize-none rounded-lg border border-border bg-bg/80 p-3 text-sm leading-6 text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                    />
                  </FieldShell>
                </>
              )}

              {mode === "text" && (
                <>
                  <FieldShell>
                    <div className="flex items-center justify-between gap-3">
                      <SmallLabel>Text content</SmallLabel>
                      <span className="font-mono text-xs text-muted">{textForm.text.length}/1800</span>
                    </div>
                    <textarea
                      rows={6}
                      value={textForm.text}
                      onChange={(event) => {
                        setTextForm({ text: event.target.value.slice(0, 1800) });
                        clearModeError("text");
                      }}
                      placeholder="Any text, Wi-Fi string, address, promo code, or event info"
                      className="min-h-40 w-full resize-none rounded-lg border border-border bg-bg/80 p-3 text-sm leading-6 text-text outline-none transition placeholder:text-muted/50 focus:border-accent/70"
                    />
                    {errors.text && <ErrorText>{errors.text}</ErrorText>}
                  </FieldShell>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {textPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setTextForm({ text: preset.value });
                          clearModeError("text");
                        }}
                        className="min-w-0 rounded-lg border border-border bg-bg/40 p-3 text-left transition hover:border-accent/40"
                      >
                        <span className="block text-sm font-semibold text-text">{preset.label}</span>
                        <span className="mt-1 block truncate font-mono text-xs text-muted">{preset.value}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {previewContent && (
                <div className="rounded-lg border border-border bg-bg/50 p-3">
                  <div className="mb-1 font-mono text-[11px] uppercase text-muted">Preview</div>
                  <p className="break-all font-mono text-xs leading-5 text-accent/90">{previewContent}</p>
                </div>
              )}

              <button
                type="button"
                onClick={generate}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-display text-sm font-bold text-bg shadow-[0_0_28px_rgba(0,229,255,0.18)] transition hover:bg-accent/90"
              >
                <ActiveIcon size={17} />
                Generate QR Code
              </button>
            </div>
          </Panel>

          <Panel className="self-start">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-text">QR Preview</h2>
                <p className="mt-1 text-sm text-muted">{qrContent ? "Ready to export" : "Waiting for content"}</p>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                  qrContent ? "border-accent/40 bg-accent/10 text-accent" : "border-border bg-bg/60 text-muted"
                )}
              >
                <QrCode size={21} />
              </div>
            </div>

            {qrContent ? (
              <div className="space-y-4">
                <div
                  className="mx-auto w-fit rounded-lg border p-4 shadow-[0_0_34px_rgba(0,229,255,0.12)]"
                  style={{
                    borderColor: `${selectedTheme.ring}66`,
                    backgroundColor: selectedTheme.bg,
                  }}
                >
                  <QRCodeCanvas
                    ref={canvasRef}
                    value={qrContent}
                    size={qrSize}
                    level={errorLevel}
                    fgColor={selectedTheme.fg}
                    bgColor={selectedTheme.bg}
                    marginSize={1}
                    title="Generated QR code"
                  />
                </div>

                <div className="rounded-lg border border-border bg-bg/50 p-3">
                  <div className="mb-1 font-mono text-[11px] uppercase text-muted">Encoded content</div>
                  <p className="line-clamp-3 break-all font-mono text-xs leading-5 text-text/80">{qrContent}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={downloadPng}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm transition",
                      downloaded
                        ? "border-emerald-300/40 text-emerald-300"
                        : "border-border text-text hover:border-accent/40 hover:text-accent"
                    )}
                  >
                    {downloaded ? <Check size={16} /> : <Download size={16} />}
                    {downloaded ? "Saved" : "PNG"}
                  </button>
                  <button
                    type="button"
                    onClick={copyEncodedContent}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm transition",
                      copied
                        ? "border-accent/50 text-accent"
                        : "border-border text-text hover:border-accent/40 hover:text-accent"
                    )}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSettings((current) => !current)}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted transition hover:border-accent/40 hover:text-accent"
                >
                  <SlidersHorizontal size={16} />
                  Customise
                  <ChevronDown
                    size={16}
                    className={cn("transition", showSettings && "rotate-180")}
                  />
                </button>

                {showSettings && (
                  <div className="space-y-5 border-t border-border pt-4">
                    <FieldShell>
                      <div className="flex items-center justify-between gap-3">
                        <SmallLabel>Size</SmallLabel>
                        <span className="font-mono text-xs text-accent">
                          {qrSize} x {qrSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={160}
                        max={340}
                        step={10}
                        value={qrSize}
                        onChange={(event) => setQrSize(Number(event.target.value))}
                        className="w-full"
                      />
                    </FieldShell>

                    <FieldShell>
                      <SmallLabel>Error correction</SmallLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {errorLevels.map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setErrorLevel(level.value)}
                            className={cn(
                              "min-h-14 rounded-lg border px-2 text-center transition",
                              errorLevel === level.value
                                ? "border-accent/60 bg-accent/10 text-accent"
                                : "border-border text-muted hover:border-accent/30 hover:text-text"
                            )}
                          >
                            <span className="block font-display text-sm font-bold">{level.label}</span>
                            <span className="mt-1 block text-[11px]">{level.detail}</span>
                          </button>
                        ))}
                      </div>
                    </FieldShell>

                    <FieldShell>
                      <SmallLabel>Color theme</SmallLabel>
                      <div className="flex flex-wrap gap-2">
                        {qrThemes.map((theme, index) => (
                          <button
                            key={theme.label}
                            type="button"
                            onClick={() => setThemeIndex(index)}
                            title={theme.label}
                            aria-label={theme.label}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg border transition",
                              themeIndex === index ? "border-accent" : "border-border hover:border-accent/40"
                            )}
                            style={{
                              background: `linear-gradient(135deg, ${theme.bg} 0 50%, ${theme.fg} 50% 100%)`,
                            }}
                          >
                            {themeIndex === index && (
                              <Check size={15} className="rounded-full bg-bg/80 text-accent" />
                            )}
                          </button>
                        ))}
                      </div>
                    </FieldShell>
                  </div>
                )}

                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg text-sm text-muted transition hover:text-text"
                >
                  <RefreshCcw size={16} />
                  Clear preview
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-bg/40 px-4 py-10 text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-lg border border-border bg-surface">
                  <Sparkles size={32} className="text-accent" />
                </div>
                <h3 className="font-display text-base font-bold text-text">Your QR lands here</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
                  Choose a mode, add your content, and generate a clean QR code.
                </p>
              </div>
            )}
          </Panel>
        </section>
      </div>

      <style jsx global>{`
        .qrforge-page input[type="range"] {
          accent-color: #00e5ff;
        }

        .qrforge-page canvas {
          display: block;
          border-radius: 6px;
          image-rendering: pixelated;
        }
      `}</style>
    </main>
  );
}
