import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminPaymentsConsole } from "@/components/admin/AdminPaymentsConsole";
import { requireAdmin } from "@/lib/auth-server";
import {
  fetchAdminPaymentsExtended,
  fetchAdminPremiumRequests,
  fetchAdminFeaturedListings,
} from "@/lib/supabase/premium-actions";

export const metadata: Metadata = {
  title: "Payments — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPaymentsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const [
    { rows: payments, error: paymentsError },
    { rows: premiumRequests, error: requestsError },
    { rows: featuredListings, error: listingsError },
  ] = await Promise.all([
    fetchAdminPaymentsExtended(),
    fetchAdminPremiumRequests(),
    fetchAdminFeaturedListings(),
  ]);

  return (
    <AdminPaymentsConsole
      payments={payments}
      premiumRequests={premiumRequests}
      featuredListings={featuredListings}
      paymentsError={paymentsError}
      requestsError={requestsError}
      listingsError={listingsError}
    />
  );
}
