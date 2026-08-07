import { adminGetEducation } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { EducationManager } from "@/components/admin/education-manager";

export const dynamic = "force-dynamic";

export default async function AdminEducationPage() {
  const items = await adminGetEducation();
  return (
    <div>
      <AdminHeader title="Education" description="Your education timeline." />
      <EducationManager items={items} />
    </div>
  );
}
