import { GraduationCap } from "lucide-react";
import type { EducationView } from "@/types/content";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { formatRange } from "@/lib/utils";

export function Education({ items }: { items: EducationView[] }) {
  if (!items.length) return null;
  return (
    <Section id="education" eyebrow="Education" title="Foundations">
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.05}>
            <Card className="flex h-full flex-col gap-3 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-[var(--subtle)]">
                  {formatRange(item.startDate, item.endDate, item.current)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{item.degree}</h3>
                <p className="text-sm text-[var(--muted)]">{item.institution}</p>
                {item.field && <p className="text-sm text-[var(--subtle)]">{item.field}</p>}
              </div>
              {item.description && (
                <p className="mt-auto text-sm leading-relaxed text-[var(--muted)]">{item.description}</p>
              )}
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
