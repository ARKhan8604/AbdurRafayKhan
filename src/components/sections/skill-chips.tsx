"use client";

import { motion, useReducedMotion } from "motion/react";
import type { SkillView } from "@/types/content";

export function SkillChips({ items, startIndex = 0 }: { items: SkillView[]; startIndex?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s, i) => (
        <motion.span
          key={s.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, delay: ((startIndex + i) % 10) * 0.03 }}
          className="cursor-default rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[13px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
        >
          {s.name}
        </motion.span>
      ))}
    </div>
  );
}
