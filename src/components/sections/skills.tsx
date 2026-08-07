import type { SkillView } from "@/types/content";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { SkillChips } from "@/components/sections/skill-chips";

function groupSkills(skills: SkillView[]) {
  const groups = new Map<string, SkillView[]>();
  for (const s of skills) {
    if (!groups.has(s.group)) groups.set(s.group, []);
    groups.get(s.group)!.push(s);
  }
  return Array.from(groups.entries());
}

export function Skills({ skills }: { skills: SkillView[] }) {
  const grouped = groupSkills(skills);

  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="A toolkit I actually reach for"
      description="The languages, frameworks, and tools I use to design and ship — from the browser to the database."
    >
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          {/* terminal header */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-xs text-[var(--subtle)]">arkhan@portfolio — ~/skills</span>
          </div>
          {/* terminal body */}
          <div className="space-y-8 p-6 font-mono text-sm sm:p-8">
            {grouped.map(([group, items], gi) => (
              <div key={group} className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <span className="text-[var(--accent)]">$</span>
                  <span className="text-[var(--subtle)]">ls</span>
                  <span className="text-[var(--text)]">{group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</span>
                </div>
                <SkillChips items={items} startIndex={gi * 7} />
              </div>
            ))}
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <span className="text-[var(--accent)]">$</span>
              <span className="inline-block h-4 w-2 animate-pulse bg-[var(--accent)]" aria-hidden />
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
