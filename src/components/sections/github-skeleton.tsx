import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";

export function GithubSkeleton() {
  return (
    <Section id="github" eyebrow="GitHub" title="What I've been building lately">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="h-64 animate-pulse lg:col-span-2" />
        <Card className="h-64 animate-pulse" />
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="h-40 animate-pulse" />
        ))}
      </div>
    </Section>
  );
}
