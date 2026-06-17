import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminPropertyConsole } from "@/components/admin/AdminPropertyConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminIntakeRows } from "@/lib/admin/fetch-intake";
import { fetchPropertyInquiriesForAdmin } from "@/lib/supabase/property-actions";

export const metadata: Metadata = {
  title: "Properties — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPropertiesPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const [{ rows: listings, error: listingsError }, { rows: inquiries, error: inquiriesError }] =
    await Promise.all([
      fetchAdminIntakeRows("property_listings"),
      fetchPropertyInquiriesForAdmin(),
    ]);

  return (
    <AdminPropertyConsole
      listings={listings}
      inquiries={inquiries}
      listingsError={listingsError}
      inquiriesError={inquiriesError}
    />
  );
}
