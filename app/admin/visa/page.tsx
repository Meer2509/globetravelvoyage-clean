import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminIntakeConsole } from "@/components/admin/AdminIntakeConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminIntakeRows } from "@/lib/admin/fetch-intake";

export const metadata: Metadata = {
  title: "Visa requests — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminVisaPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { rows, error } = await fetchAdminIntakeRows("visa_requests");

  return (
    <AdminIntakeConsole
      title="Visa requests"
      subtitle="All public visa intake submissions. A specialist will review each request."
      table="visa_requests"
      initialRows={rows}
      fetchError={error}
      primaryFields={[
        { label: "Name", key: "full_name" },
        { label: "Email", key: "email" },
        { label: "Nationality", key: "nationality" },
        { label: "Destination", key: "destination" },
        { label: "Purpose", key: "purpose" },
      ]}
    />
  );
}
