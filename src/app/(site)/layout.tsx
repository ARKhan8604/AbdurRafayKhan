import { Nav } from "@/components/sections/nav";
import { Footer } from "@/components/sections/footer";
import { CommandPalette } from "@/components/command/command-palette";
import { getSettings, getSocials, getProjects } from "@/server/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, socials, projects] = await Promise.all([
    getSettings(),
    getSocials(),
    getProjects(),
  ]);

  return (
    <>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:border focus:border-[var(--border)] focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Nav resumeUrl={settings.resumeUrl} />
      <main className="flex-1">{children}</main>
      <Footer socials={socials} />
      <CommandPalette
        projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
        socials={socials}
        email={settings.email}
        resumeUrl={settings.resumeUrl}
      />
    </>
  );
}
