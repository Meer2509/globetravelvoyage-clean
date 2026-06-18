import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminGrowthDashboard } from "@/components/admin/AdminGrowthDashboard";
import { requireAdmin } from "@/lib/auth-server";
import { fetchGrowthDashboardReport } from "@/lib/growth/growth-dashboard";

export const metadata: Metadata = {
  title: "Growth & Conversion — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGrowthPage() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) {
    return <AdminAccessRequired message={adminAuth.error} />;
  }

  const result = await fetchGrowthDashboardReport(30);

  if ("error" in result) {
    return <AdminGrowthDashboard initialReport={null} fetchError={result.error} />;
  }

  return <AdminGrowthDashboard initialReport={result} />;
}
