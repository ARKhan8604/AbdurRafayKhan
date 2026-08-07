import { adminGetSettings } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { HeroForm } from "@/components/admin/settings-forms";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const settings = await adminGetSettings();
  return (
    <div>
      <AdminHeader title="Hero" description="Your name, roles, tagline, and contact details." />
      <HeroForm settings={settings} />
    </div>
  );
}
