import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="grid-texture-full absolute inset-0 -z-10 opacity-40" />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[50vh]"
        style={{ background: "radial-gradient(50% 50% at 50% 0%, var(--glow), transparent 70%)" }}
      />
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-[var(--accent)]">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-[var(--muted)]">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonVariants({ size: "md" })}>
          Back home
        </Link>
        <Link href="/projects" className={buttonVariants({ variant: "secondary", size: "md" })}>
          View projects
        </Link>
      </div>
    </main>
  );
}
