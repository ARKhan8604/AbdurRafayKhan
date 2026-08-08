"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CategoryView, SettingsView, SocialView } from "@/types/content";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { ExploreDropdown } from "@/components/hero/explore-dropdown";
import { ScrollIndicator } from "@/components/hero/scroll-indicator";
import { SocialRail } from "@/components/hero/social-rail";
import { MOTION } from "@/lib/constants";

const ParticleBackground = dynamic(
  () => import("@/components/hero/particle-background").then((m) => m.ParticleBackground),
  { ssr: false }
);

export function Hero({
  settings,
  socials,
  categories,
}: {
  settings: SettingsView;
  socials: SocialView[];
  categories: CategoryView[];
}) {
  const roleParts = settings.heroSubtitle.split("•").map((s) => s.trim());
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: MOTION.slow, delay: 0.1 + i * 0.09, ease: MOTION.ease },
    }),
  };

  return (
    <section id="top" className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden pt-[4.5rem] sm:pt-20">
      {/* Backgrounds */}
      <div className="absolute inset-0 -z-10">
        <ParticleBackground className="absolute inset-0 opacity-90" />
        <div className="grid-texture-full absolute inset-0 opacity-40" />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[60vh]"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, var(--glow) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)]" />
      </div>

      <SocialRail socials={socials} />

      <Container className="relative flex flex-col items-center text-center">
        {settings.availableForWork && (
          <motion.div custom={0} variants={item} initial="hidden" animate="show">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-1.5 text-xs font-medium text-[var(--muted)] backdrop-blur sm:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available for new projects
            </span>
          </motion.div>
        )}

        <motion.h1
          custom={1}
          variants={item}
          initial="hidden"
          animate="show"
          className="text-gradient max-w-4xl text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-6xl md:text-7xl lg:text-[5.25rem] lg:leading-[0.95]"
        >
          {settings.heroTitle}
        </motion.h1>

        <motion.div
          custom={2}
          variants={item}
          initial="hidden"
          animate="show"
          className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-[var(--muted)] sm:mt-6 sm:text-base"
        >
          {roleParts.map((part, i) => (
            <span key={part} className="inline-flex items-center gap-3">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />}
              {part}
            </span>
          ))}
        </motion.div>

        {settings.heroTagline && (
          <motion.p
            custom={3}
            variants={item}
            initial="hidden"
            animate="show"
            className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--muted)] sm:mt-6 sm:text-lg"
          >
            {settings.heroTagline}
          </motion.p>
        )}

        <motion.div
          custom={4}
          variants={item}
          initial="hidden"
          animate="show"
          className="mt-7 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
        >
          <Magnetic>
            <Link href="#projects" className={buttonVariants({ size: "lg", className: "group" })}>
              View my work
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Magnetic>
          <ExploreDropdown categories={categories} />
        </motion.div>

        <motion.div
          custom={5}
          variants={item}
          initial="hidden"
          animate="show"
          className="mt-4 flex items-center gap-4 text-sm text-[var(--muted)] sm:mt-6"
        >
          <Link href="#contact" className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--text)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Get in touch
          </Link>
        </motion.div>
      </Container>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 [@media(max-height:640px)]:hidden sm:bottom-8">
        <ScrollIndicator />
      </div>
    </section>
  );
}
