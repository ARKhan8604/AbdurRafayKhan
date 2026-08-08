"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import type { SocialView } from "@/types/content";
import { Container } from "@/components/ui/container";
import { SECTIONS, SITE } from "@/lib/constants";
import { SocialIcon } from "@/components/ui/social-icon";

export function Footer({ socials }: { socials: SocialView[] }) {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/40">
      <Container className="py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href={sectionHref("top")} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] font-mono text-sm font-semibold">
                AR
              </span>
              <span className="text-sm font-medium">{SITE.name}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              Computer Science student, full-stack developer, and AI builder — crafting fast, thoughtful web products.
            </p>
          </div>

          <div className="flex gap-14">
            <nav className="flex flex-col gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--subtle)]">Navigate</p>
              {SECTIONS.slice(0, 5).map((s) => (
                <Link
                  key={s.id}
                  href={sectionHref(s.id)}
                  className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                >
                  {s.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--subtle)]">Elsewhere</p>
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target={s.url.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                >
                  <SocialIcon name={s.icon ?? s.platform} className="h-4 w-4" />
                  {s.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--subtle)]">
            © {year} {SITE.name}. Built with Next.js, Tailwind & Prisma.
          </p>
          <Link
            href={sectionHref("top")}
            className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Container>
    </footer>
  );
}
