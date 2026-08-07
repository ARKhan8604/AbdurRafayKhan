import Image from "next/image";
import type { ProjectView } from "@/types/content";
import { cn, hueFromString } from "@/lib/utils";

/**
 * Project cover. Uses the first available image; otherwise renders a
 * premium, on-brand placeholder (grid + accent glow + monogram) whose
 * glow position is derived deterministically from the title.
 */
export function ProjectCover({
  project,
  className,
  sizes,
  priority,
}: {
  project: ProjectView;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = project.coverImageUrl ?? project.images[0]?.url ?? null;
  const initials = project.title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const h = hueFromString(project.slug);
  const gx = 30 + (h % 40);
  const gy = 20 + (h % 30);

  if (src) {
    return (
      <Image
        src={src}
        alt={project.images[0]?.alt ?? project.title}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div className={cn("grid-texture-full relative h-full w-full overflow-hidden bg-[var(--surface-2)]", className)}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(50% 55% at ${gx}% ${gy}%, var(--glow), transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[clamp(3rem,10vw,6rem)] font-semibold text-[var(--text)]/10">
          {initials}
        </span>
      </div>
    </div>
  );
}
