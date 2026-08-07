import "server-only";
import { SITE } from "@/lib/constants";

export interface GithubRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
}

export interface GithubProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  url: string;
}

export interface LanguageStat {
  name: string;
  count: number;
  pct: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubData {
  profile: GithubProfile | null;
  repos: GithubRepo[];
  languages: LanguageStat[];
  calendar: { weeks: ContributionDay[][]; total: number } | null;
}

const REVALIDATE = 3600;

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "arkhan-portfolio",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function fetchProfile(user: string): Promise<GithubProfile | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${user}`, {
      headers: ghHeaders(),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      login: d.login,
      name: d.name,
      avatarUrl: d.avatar_url,
      bio: d.bio,
      followers: d.followers,
      following: d.following,
      publicRepos: d.public_repos,
      url: d.html_url,
    };
  } catch {
    return null;
  }
}

export async function fetchRepos(user: string): Promise<GithubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`,
      { headers: ghHeaders(), next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return [];
    const data: Array<Record<string, unknown>> = await res.json();
    return data
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name as string,
        description: (r.description as string) ?? null,
        url: r.html_url as string,
        language: (r.language as string) ?? null,
        stars: (r.stargazers_count as number) ?? 0,
        forks: (r.forks_count as number) ?? 0,
        updatedAt: (r.pushed_at as string) ?? "",
      }));
  } catch {
    return [];
  }
}

function computeLanguages(repos: GithubRepo[]): LanguageStat[] {
  const counts = new Map<string, number>();
  for (const r of repos) {
    if (!r.language) continue;
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function levelFor(count: number): ContributionDay["level"] {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

async function fetchCalendar(user: string): Promise<GithubData["calendar"]> {
  if (!process.env.GITHUB_TOKEN) return null;
  try {
    const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...ghHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: user } }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return null;
    const weeks: ContributionDay[][] = cal.weeks.map(
      (w: { contributionDays: { date: string; contributionCount: number }[] }) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: levelFor(d.contributionCount),
        }))
    );
    return { weeks, total: cal.totalContributions };
  } catch {
    return null;
  }
}

/**
 * @param featuredRepos - exact repo names to feature, in order. Empty/omitted
 * shows the most recently pushed public repos instead.
 */
export async function getGithubData(
  user: string = SITE.githubUser,
  featuredRepos: string[] = []
): Promise<GithubData> {
  const [profile, allRepos] = await Promise.all([fetchProfile(user), fetchRepos(user)]);
  const calendar = await fetchCalendar(user);

  let repos: GithubRepo[];
  if (featuredRepos.length) {
    const byName = new Map(allRepos.map((r) => [r.name.toLowerCase(), r]));
    repos = featuredRepos
      .map((name) => byName.get(name.toLowerCase()))
      .filter((r): r is GithubRepo => Boolean(r));
  } else {
    repos = allRepos.slice(0, 6);
  }

  return {
    profile,
    repos,
    languages: computeLanguages(allRepos),
    calendar,
  };
}
