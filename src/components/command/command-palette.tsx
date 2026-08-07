"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Home,
  FolderGit2,
  User,
  Wrench,
  Briefcase,
  GraduationCap,
  Mail,
  FileText,
  Sun,
  Moon,
  ArrowRight,
  Copy,
} from "lucide-react";
import type { SocialView } from "@/types/content";
import { GithubIcon } from "@/components/ui/brand-icons";
import { SECTIONS } from "@/lib/constants";
import { capture } from "@/lib/analytics";

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  about: User,
  skills: Wrench,
  projects: FolderGit2,
  experience: Briefcase,
  education: GraduationCap,
  github: GithubIcon,
  contact: Mail,
};

export function CommandPalette({
  projects,
  socials,
  email,
  resumeUrl,
}: {
  projects: { slug: string; title: string }[];
  socials: SocialView[];
  email?: string | null;
  resumeUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("command-palette:open", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("command-palette:open", onOpen);
    };
  }, []);

  const run = useCallback((fn: () => void, action?: string) => {
    setOpen(false);
    capture("command_palette_used", { action });
    // let the dialog close before navigating
    setTimeout(fn, 10);
  }, []);

  function goToSection(id: string) {
    if (window.location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  }

  const github = socials.find((s) => s.icon === "github" || s.platform.toLowerCase() === "github");
  const linkedin = socials.find((s) => s.icon === "linkedin" || s.platform.toLowerCase() === "linkedin");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lift)]"
          >
            <Command label="Command palette" className="flex flex-col">
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
                <span className="text-[var(--subtle)]">⌘</span>
                <Command.Input
                  autoFocus
                  placeholder="Jump to a section, project, or action…"
                  className="h-14 w-full bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--subtle)]"
                />
                <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--subtle)]">
                  ESC
                </kbd>
              </div>
              <Command.List className="max-h-[52vh] overflow-y-auto p-2">
                <Command.Empty className="py-10 text-center text-sm text-[var(--muted)]">
                  No results found.
                </Command.Empty>

                <Group heading="Navigation">
                  <Item icon={Home} label="Home / Top" onSelect={() => run(() => goToSection("top"), "nav:top")} />
                  {SECTIONS.map((s) => (
                    <Item
                      key={s.id}
                      icon={SECTION_ICONS[s.id] ?? ArrowRight}
                      label={s.label}
                      onSelect={() => run(() => goToSection(s.id), `nav:${s.id}`)}
                    />
                  ))}
                  <Item
                    icon={FolderGit2}
                    label="All projects"
                    onSelect={() => run(() => router.push("/projects"), "nav:projects-index")}
                  />
                </Group>

                {projects.length > 0 && (
                  <Group heading="Projects">
                    {projects.map((p) => (
                      <Item
                        key={p.slug}
                        icon={ArrowRight}
                        label={p.title}
                        onSelect={() =>
                          run(() => {
                            capture("project_opened", { slug: p.slug, from: "command" });
                            router.push(`/projects/${p.slug}`);
                          }, "project")
                        }
                      />
                    ))}
                  </Group>
                )}

                <Group heading="Actions">
                  <Item
                    icon={resolvedTheme === "dark" ? Sun : Moon}
                    label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
                    onSelect={() =>
                      run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"), "theme")
                    }
                  />
                  {email && (
                    <Item
                      icon={Copy}
                      label="Copy email address"
                      onSelect={() =>
                        run(async () => {
                          await navigator.clipboard.writeText(email);
                          toast.success("Email copied to clipboard");
                        }, "copy-email")
                      }
                    />
                  )}
                  {email && (
                    <Item
                      icon={Mail}
                      label="Send an email"
                      onSelect={() => run(() => (window.location.href = `mailto:${email}`), "email")}
                    />
                  )}
                  {resumeUrl && (
                    <Item
                      icon={FileText}
                      label="Download résumé"
                      onSelect={() =>
                        run(() => {
                          capture("resume_downloaded");
                          window.open(resumeUrl, "_blank");
                        }, "resume")
                      }
                    />
                  )}
                  {github && (
                    <Item
                      icon={GithubIcon}
                      label="Open GitHub"
                      onSelect={() => run(() => window.open(github.url, "_blank"), "github")}
                    />
                  )}
                  {linkedin && (
                    <Item
                      icon={ArrowRight}
                      label="Open LinkedIn"
                      onSelect={() => run(() => window.open(linkedin.url, "_blank"), "linkedin")}
                    />
                  )}
                </Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-[var(--subtle)]"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  icon: Icon,
  label,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition-colors data-[selected=true]:bg-[var(--surface-2)] data-[selected=true]:text-[var(--text)]"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1">{label}</span>
    </Command.Item>
  );
}
