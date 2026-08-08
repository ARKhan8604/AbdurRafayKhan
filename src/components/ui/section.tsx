import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.05]">
        {title}
      </h2>
      {description && (
        <p className={cn("max-w-2xl text-pretty text-base leading-relaxed text-[var(--muted)]", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </Reveal>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  align,
  className,
  containerClassName,
  headerClassName,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-14 sm:py-20 md:py-28", className)}>
      <Container className={containerClassName}>
        {title && (
          <div className={cn("mb-8 sm:mb-12 md:mb-16", headerClassName)}>
            <SectionHeading eyebrow={eyebrow} title={title} description={description} align={align} />
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
