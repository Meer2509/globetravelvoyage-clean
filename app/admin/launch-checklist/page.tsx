import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminLaunchChecklist } from "@/components/admin/AdminLaunchChecklist";
import { requireAdmin } from "@/lib/auth-server";
import { getLaunchChecklistReport } from "@/lib/launch-checklist";

export const metadata: Metadata = {
  title: "Launch Checklist — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLaunchChecklistPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const report = await getLaunchChecklistReport();

  return <AdminLaunchChecklist report={report} />;
}
