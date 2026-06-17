import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminIntakeConsole } from "@/components/admin/AdminIntakeConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminIntakeRows } from "@/lib/admin/fetch-intake";

export const metadata: Metadata = {
  title: "Support — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSupportPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { rows, error } = await fetchAdminIntakeRows("support_messages");

  return (
    <AdminIntakeConsole
      title="Support tickets"
      subtitle="Customer support messages from Supabase."
      table="support_messages"
      initialRows={rows}
      fetchError={error}
      primaryFields={[
        { label: "Subject", key: "subject" },
        { label: "Category", key: "category" },
        { label: "Body", key: "body" },
      ]}
    />
  );
}
