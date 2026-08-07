"use client";

import { Copy, Check, ArrowUpRight, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SettingsView, SocialView } from "@/types/content";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { SocialIcon } from "@/components/ui/social-icon";
import { capture } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function Contact({ settings, socials }: { settings: SettingsView; socials: SocialView[] }) {
  const [copied, setCopied] = useState(false);
  const email = settings.email ?? "";

  async function copyEmail() {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email copied to clipboard");
      capture("contact_clicked", { method: "copy-email" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — try again");
    }
  }

  return (
    <Section id="contact" className="pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-lift)] sm:p-12 lg:p-16">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(60% 80% at 50% 0%, var(--glow), transparent 70%)" }}
          />
          <div className="grid-texture-full pointer-events-none absolute inset-0 -z-10 opacity-40" />

          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Contact
            </span>
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Let&apos;s build something people remember.
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-lg text-[var(--muted)]">
              {settings.availableForWork
                ? "I'm currently open to new projects and opportunities. Have an idea, a role, or just want to say hi? My inbox is always open."
                : "Want to talk shop, collaborate, or just say hi? My inbox is always open."}
            </p>

            {email && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={copyEmail}
                  className="group inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 font-mono text-sm text-[var(--text)] transition-colors hover:border-[var(--accent)]"
                >
                  {email}
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-[var(--muted)] group-hover:text-[var(--accent)]" />
                  )}
                </button>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <a
                  href={email ? `mailto:${email}` : "#"}
                  onClick={() => capture("contact_clicked", { method: "email" })}
                  className={buttonVariants({ size: "lg" })}
                >
                  Send an email
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Magnetic>
              {settings.resumeUrl && (
                <a
                  href={settings.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => capture("resume_downloaded")}
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  <FileText className="h-4 w-4" />
                  Download résumé
                </a>
              )}
            </div>

            {socials.length > 0 && (
              <div className="mt-10 flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target={s.url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    onClick={() => capture("external_link_clicked", { platform: s.platform, url: s.url })}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    )}
                  >
                    <SocialIcon name={s.icon ?? s.platform} className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
