import { adminGetCategories } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await adminGetCategories();
  return (
    <div>
      <AdminHeader title="Categories" description="Used to filter projects on the site." />
      <CategoryManager categories={categories} />
    </div>
  );
}
