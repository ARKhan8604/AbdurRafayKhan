"use client";

import { motion } from "motion/react";
import type { SocialView } from "@/types/content";
import { SocialIcon } from "@/components/ui/social-icon";
import { capture } from "@/lib/analytics";

export function SocialRail({ socials }: { socials: SocialView[] }) {
  if (!socials.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="fixed bottom-0 left-6 z-30 hidden flex-col items-center gap-4 lg:flex"
    >
      <ul className="flex flex-col items-center gap-3">
        {socials.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              target={s.url.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={s.platform}
              onClick={() => capture("external_link_clicked", { platform: s.platform, url: s.url })}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            >
              <SocialIcon name={s.icon ?? s.platform} className="h-[18px] w-[18px]" />
            </a>
          </li>
        ))}
      </ul>
      <div className="h-20 w-px bg-gradient-to-b from-[var(--border-strong)] to-transparent" />
    </motion.div>
  );
}
