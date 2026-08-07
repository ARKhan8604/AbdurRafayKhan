"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { capture } from "@/lib/analytics";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    capture("theme_toggled", { theme: next });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] transition-colors hover:border-[var(--border-strong)]",
        className
      )}
    >
      {mounted && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
