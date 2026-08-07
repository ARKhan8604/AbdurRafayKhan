import { adminGetSettings } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { ProfileResumeManager } from "@/components/admin/profile-resume";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const settings = await adminGetSettings();
  return (
    <div>
      <AdminHeader title="Profile & Résumé" description="Upload your profile photo and résumé (stored on Cloudinary)." />
      <ProfileResumeManager
        profileImageUrl={settings?.profileImageUrl ?? null}
        resumeUrl={settings?.resumeUrl ?? null}
      />
    </div>
  );
}
