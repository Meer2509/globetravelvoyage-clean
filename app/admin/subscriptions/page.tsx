import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminSubscriptionsConsole } from "@/components/admin/AdminSubscriptionsConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminSubscriptions } from "@/lib/supabase/premium-actions";

export const metadata: Metadata = {
  title: "Subscriptions — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSubscriptionsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { rows, error } = await fetchAdminSubscriptions();

  return <AdminSubscriptionsConsole subscriptions={rows} error={error} />;
}
