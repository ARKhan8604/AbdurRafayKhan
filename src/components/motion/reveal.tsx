"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { MOTION } from "@/lib/constants";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
}

/** Fade + rise into view. Honors prefers-reduced-motion. */
export function Reveal({ children, delay = 0, y = 16, once = true, className, ...props }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce)
    return (
      <div className={className as string | undefined}>{children}</div>
    );
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: MOTION.slow, delay, ease: MOTION.ease }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container — direct Reveal/motion children animate in sequence. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export const revealItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: MOTION.base, ease: MOTION.ease } },
};
