import { adminGetExperience } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { ExperienceManager } from "@/components/admin/experience-manager";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const items = await adminGetExperience();
  return (
    <div>
      <AdminHeader title="Experience" description="Your work history timeline." />
      <ExperienceManager items={items} />
    </div>
  );
}
