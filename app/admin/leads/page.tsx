import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminIntakeConsole } from "@/components/admin/AdminIntakeConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminIntakeRows } from "@/lib/admin/fetch-intake";

export const metadata: Metadata = {
  title: "Leads — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { rows, error } = await fetchAdminIntakeRows("lead_requests");

  return (
    <AdminIntakeConsole
      title="Contact & lead requests"
      subtitle="All contact, partner, and expert enquiry submissions from Supabase."
      table="lead_requests"
      initialRows={rows}
      fetchError={error}
      primaryFields={[
        { label: "Name", key: "full_name" },
        { label: "Email", key: "email" },
        { label: "Phone", key: "phone" },
        { label: "Type", key: "lead_type" },
        { label: "Message", key: "message" },
      ]}
    />
  );
}
