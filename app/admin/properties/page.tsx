import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminIntakeConsole } from "@/components/admin/AdminIntakeConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminIntakeRows } from "@/lib/admin/fetch-intake";

export const metadata: Metadata = {
  title: "Properties — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPropertiesPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { rows, error } = await fetchAdminIntakeRows("property_listings");

  return (
    <AdminIntakeConsole
      title="Property listing requests"
      subtitle="Pending property intake submissions from hosts."
      table="property_listings"
      initialRows={rows}
      fetchError={error}
      primaryFields={[
        { label: "Title", key: "title" },
        { label: "City", key: "city" },
        { label: "Contact", key: "contact_name" },
        { label: "Email", key: "contact_email" },
        { label: "Type", key: "listing_type" },
      ]}
    />
  );
}
