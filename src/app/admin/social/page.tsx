import { adminGetSocials } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { SocialManager } from "@/components/admin/social-manager";

export const dynamic = "force-dynamic";

export default async function AdminSocialPage() {
  const socials = await adminGetSocials();
  return (
    <div>
      <AdminHeader title="Social Links" description="Links shown in the hero rail, contact section, and footer." />
      <SocialManager socials={socials} />
    </div>
  );
}
