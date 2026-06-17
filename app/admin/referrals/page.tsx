import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminIntakeConsole } from "@/components/admin/AdminIntakeConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminIntakeRows } from "@/lib/admin/fetch-intake";

export const metadata: Metadata = {
  title: "Referrals — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReferralsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { rows, error } = await fetchAdminIntakeRows("referrals");

  return (
    <AdminIntakeConsole
      title="Referral commissions"
      subtitle="Live referral records from Supabase."
      table="referrals"
      initialRows={rows}
      fetchError={error}
      primaryFields={[
        { label: "Code", key: "referral_code" },
        { label: "Commission USD", key: "commission_usd" },
        { label: "Referrer ID", key: "referrer_id" },
        { label: "Referred ID", key: "referred_id" },
      ]}
    />
  );
}
