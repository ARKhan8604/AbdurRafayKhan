"use client";

import { motion, useReducedMotion } from "motion/react";

export function ScrollIndicator() {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href="#about"
      aria-label="Scroll to content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="group flex flex-col items-center gap-2 text-[var(--subtle)]"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Scroll</span>
      <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-[var(--border-strong)] p-1">
        <motion.span
          className="h-1.5 w-1 rounded-full bg-[var(--accent)]"
          animate={reduce ? {} : { y: [0, 12, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.a>
  );
}
