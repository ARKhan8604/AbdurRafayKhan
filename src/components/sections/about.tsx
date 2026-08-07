import Image from "next/image";
import { MapPin, Sparkles } from "lucide-react";
import type { SettingsView } from "@/types/content";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-3xl font-semibold tracking-tight sm:text-4xl">
        <Counter to={value} suffix={suffix} />
      </span>
      <span className="text-sm text-[var(--muted)]">{label}</span>
    </div>
  );
}

export function About({ settings }: { settings: SettingsView }) {
  const paragraphs = (settings.aboutBody ?? "").split("\n\n").filter(Boolean);

  return (
    <Section id="about" eyebrow="About" title={settings.aboutHeading ?? "About me"}>
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Reveal className="flex flex-col gap-6">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-pretty text-lg leading-relaxed text-[var(--muted)]">
              {p}
            </p>
          ))}

          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {settings.location && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[var(--muted)]">
                <MapPin className="h-4 w-4 text-[var(--accent)]" />
                {settings.location}
              </span>
            )}
            {settings.availableForWork && (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[var(--muted)]">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Open to opportunities
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-8">
            <Stat value={5} suffix="+" label="Shipped products" />
            <Stat value={6} suffix="+" label="Project domains" />
            <Stat value={100} suffix="%" label="Care per pixel" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lift)]">
            {settings.profileImageUrl ? (
              <Image
                src={settings.profileImageUrl}
                alt={settings.heroTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 384px"
                className="object-cover"
              />
            ) : (
              <div className="grid-texture-full flex h-full w-full items-center justify-center">
                <div
                  className="absolute inset-0"
                  style={{ background: "radial-gradient(70% 60% at 50% 30%, var(--glow), transparent 70%)" }}
                />
                <span className="relative font-mono text-6xl font-semibold text-[var(--text)]">AR</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
