import { adminGetSettings } from "@/server/admin-queries";
import { fetchRepos } from "@/lib/github";
import { SITE } from "@/lib/constants";
import { AdminHeader } from "@/components/admin/parts";
import { GithubReposManager } from "@/components/admin/github-repos-manager";

export const dynamic = "force-dynamic";

export default async function AdminGithubPage() {
  const [settings, repos] = await Promise.all([adminGetSettings(), fetchRepos(SITE.githubUser)]);

  return (
    <div>
      <AdminHeader title="GitHub" description="Curate which repositories appear in the GitHub Activity section." />
      <GithubReposManager
        initialSelected={settings?.featuredRepos ?? []}
        available={repos.map((r) => ({ name: r.name, description: r.description, language: r.language }))}
      />
    </div>
  );
}
