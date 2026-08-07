import Image from "next/image";
import { Star, GitFork, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { getGithubData } from "@/lib/github";
import { getSettings } from "@/server/queries";
import { SITE } from "@/lib/constants";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const LEVEL_BG = [
  "var(--surface-2)",
  "color-mix(in oklab, var(--accent) 25%, var(--surface-2))",
  "color-mix(in oklab, var(--accent) 45%, var(--surface-2))",
  "color-mix(in oklab, var(--accent) 70%, var(--surface-2))",
  "var(--accent)",
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
  Vue: "#41b883",
};

export async function GithubActivity() {
  const settings = await getSettings();
  const { profile, repos, languages, calendar } = await getGithubData(SITE.githubUser, settings.featuredRepos);

  return (
    <Section
      id="github"
      eyebrow="GitHub"
      title="What I've been building lately"
      description="Live from my GitHub — recent repositories, the languages I reach for, and my contribution activity."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Profile + contributions */}
        <Reveal className="lg:col-span-2">
          <Card className="flex h-full flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.login}
                    width={56}
                    height={56}
                    className="rounded-full border border-[var(--border)]"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)]">
                    <GithubIcon className="h-6 w-6" />
                  </span>
                )}
                <div>
                  <p className="font-semibold">{profile?.name ?? SITE.name}</p>
                  <p className="text-sm text-[var(--muted)]">@{profile?.login ?? SITE.githubUser}</p>
                </div>
              </div>
              <a
                href={profile?.url ?? `https://github.com/${SITE.githubUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Follow
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {profile && (
              <div className="flex gap-6 text-sm">
                <span className="text-[var(--muted)]">
                  <strong className="text-[var(--text)]">{profile.publicRepos}</strong> repos
                </span>
                <span className="text-[var(--muted)]">
                  <strong className="text-[var(--text)]">{profile.followers}</strong> followers
                </span>
                <span className="text-[var(--muted)]">
                  <strong className="text-[var(--text)]">{profile.following}</strong> following
                </span>
              </div>
            )}

            {/* Contribution calendar */}
            {calendar ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--muted)]">
                    <strong className="text-[var(--text)]">{calendar.total.toLocaleString()}</strong> contributions in
                    the last year
                  </p>
                  <div className="hidden items-center gap-1 text-xs text-[var(--subtle)] sm:flex">
                    Less
                    {LEVEL_BG.map((bg, i) => (
                      <span key={i} className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: bg }} />
                    ))}
                    More
                  </div>
                </div>
                <div className="no-scrollbar overflow-x-auto">
                  <div className="flex gap-[3px]">
                    {calendar.weeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((day) => (
                          <span
                            key={day.date}
                            title={`${day.count} on ${day.date}`}
                            className="h-2.5 w-2.5 rounded-[3px]"
                            style={{ backgroundColor: LEVEL_BG[day.level] }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
                Add a <code className="font-mono text-[var(--accent)]">GITHUB_TOKEN</code> to display the live
                contribution graph.
              </div>
            )}
          </Card>
        </Reveal>

        {/* Top languages */}
        <Reveal delay={0.1}>
          <Card className="flex h-full flex-col gap-4 p-6 sm:p-8">
            <h3 className="text-sm font-medium text-[var(--muted)]">Top languages</h3>
            {languages.length ? (
              <ul className="flex flex-col gap-4">
                {languages.map((lang) => (
                  <li key={lang.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: LANG_COLORS[lang.name] ?? "var(--accent)" }}
                        />
                        {lang.name}
                      </span>
                      <span className="font-mono text-xs text-[var(--subtle)]">{lang.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${lang.pct}%`, backgroundColor: LANG_COLORS[lang.name] ?? "var(--accent)" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">Language data unavailable right now.</p>
            )}
          </Card>
        </Reveal>
      </div>

      {/* Latest repos */}
      {repos.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo, i) => (
            <Reveal key={repo.name} delay={i * 0.04}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-sm font-medium">
                    <GithubIcon className="h-4 w-4 text-[var(--muted)]" />
                    {repo.name}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" />
                </div>
                <p className="line-clamp-2 flex-1 text-sm text-[var(--muted)]">
                  {repo.description ?? "No description provided."}
                </p>
                <div className="flex items-center gap-4 text-xs text-[var(--subtle)]">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: LANG_COLORS[repo.language] ?? "var(--accent)" }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" />
                    {repo.forks}
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
