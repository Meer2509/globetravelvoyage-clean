import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminReviewsConsole } from "@/components/admin/AdminReviewsConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminReviews } from "@/lib/admin/phase1-actions";

export const metadata: Metadata = {
  title: "Reviews — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReviewsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { rows, error } = await fetchAdminReviews();

  return <AdminReviewsConsole initialRows={rows} fetchError={error} />;
}
