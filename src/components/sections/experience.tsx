import type { ExperienceView } from "@/types/content";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { formatRange } from "@/lib/utils";

export function Experience({ items }: { items: ExperienceView[] }) {
  if (!items.length) return null;
  return (
    <Section id="experience" eyebrow="Experience" title="Where I've been building">
      <ol className="relative border-l border-[var(--border)] pl-8 sm:pl-10">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.05} className="relative pb-12 last:pb-0">
            <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] sm:-left-[49px]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold tracking-tight">{item.role}</h3>
                <span className="font-mono text-xs text-[var(--subtle)]">
                  {formatRange(item.startDate, item.endDate, item.current)}
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--accent)]">
                {item.company}
                {item.location && <span className="text-[var(--muted)]"> · {item.location}</span>}
              </p>
              {item.description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
