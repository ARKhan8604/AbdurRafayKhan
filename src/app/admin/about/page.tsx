import { adminGetSettings } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { AboutForm } from "@/components/admin/settings-forms";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const settings = await adminGetSettings();
  return (
    <div>
      <AdminHeader title="About" description="The narrative shown in your About section." />
      <AboutForm settings={settings} />
    </div>
  );
}
