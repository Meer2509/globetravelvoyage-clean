import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminUsersConsole } from "@/components/admin/AdminUsersConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminProfiles } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Users — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { profiles, error, tableMissing } = await fetchAdminProfiles();

  return (
    <AdminUsersConsole profiles={profiles} error={error} tableMissing={tableMissing} />
  );
}
