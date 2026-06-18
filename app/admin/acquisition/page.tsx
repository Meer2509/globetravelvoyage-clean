import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminAcquisitionDashboard } from "@/components/admin/AdminAcquisitionDashboard";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAcquisitionDashboardReport } from "@/lib/provider-acquisition/acquisition-dashboard";

export const metadata: Metadata = {
  title: "Provider Acquisition — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAcquisitionPage() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) {
    return <AdminAccessRequired message={adminAuth.error} />;
  }

  const result = await fetchAcquisitionDashboardReport(30);

  if ("error" in result) {
    return <AdminAcquisitionDashboard initialReport={null} fetchError={result.error} />;
  }

  return <AdminAcquisitionDashboard initialReport={result} />;
}
