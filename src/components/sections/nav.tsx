"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Command, Menu, X, FileText } from "lucide-react";
import { SECTIONS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { capture } from "@/lib/analytics";

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function openCommandPalette() {
  window.dispatchEvent(new Event("command-palette:open"));
  capture("command_palette_opened");
}

export function Nav({ resumeUrl }: { resumeUrl?: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = useScrollSpy(SECTIONS.map((s) => s.id));
  const pathname = usePathname();
  // Section anchors (#about, #top, ...) only exist in the home page's DOM.
  // From any other route, prefix with "/" so Next.js navigates home first,
  // then scrolls to the section — a bare "#about" href just no-ops there.
  const isHome = pathname === "/";
  const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "border-b border-[var(--border)] glass" : "border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href={sectionHref("top")}
          className="group flex items-center gap-2.5"
          aria-label={SITE.name}
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] font-mono text-sm font-semibold tracking-tight text-[var(--text)] transition-colors group-hover:border-[var(--accent)]">
            AR
          </span>
          <span className="hidden text-sm font-medium sm:block">{SITE.name}</span>
        </Link>

        {/* Desktop links */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 p-1 backdrop-blur md:flex">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                href={sectionHref(s.id)}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active === s.id ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                )}
              >
                {active === s.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-[var(--surface-2)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {s.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            className="hidden h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] pl-3 pr-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] sm:flex"
          >
            <Command className="h-3.5 w-3.5" />
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>

          <ThemeToggle />

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => capture("resume_downloaded")}
              className={buttonVariants({ variant: "secondary", size: "sm", className: "hidden sm:inline-flex" })}
            >
              <FileText className="h-4 w-4" />
              Résumé
            </a>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass border-b border-[var(--border)] md:hidden"
          >
            <ul className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <Link
                    href={sectionHref(s.id)}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base transition-colors",
                      active === s.id
                        ? "bg-[var(--surface-2)] text-[var(--text)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openCommandPalette();
                  }}
                  className={buttonVariants({ variant: "secondary", size: "sm", className: "flex-1" })}
                >
                  <Command className="h-4 w-4" /> Search
                </button>
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => capture("resume_downloaded")}
                    className={buttonVariants({ size: "sm", className: "flex-1" })}
                  >
                    <FileText className="h-4 w-4" /> Résumé
                  </a>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
