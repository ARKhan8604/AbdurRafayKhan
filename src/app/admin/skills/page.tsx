import { adminGetSkills } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { SkillManager } from "@/components/admin/skill-manager";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const skills = await adminGetSkills();
  return (
    <div>
      <AdminHeader title="Skills" description="Grouped skills shown in the terminal panel." />
      <SkillManager skills={skills} />
    </div>
  );
}
