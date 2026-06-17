import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminProviderQueue } from "@/components/admin/AdminProviderQueue";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminVerificationQueue } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Providers — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProvidersPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const queue = await fetchAdminVerificationQueue();

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Provider applications</h1>
          <p className="mt-1 text-sm text-muted">
            Review, approve, or reject pending agency, visa expert, guide, and host applications.
          </p>
        </div>
      </div>
      <div className="container-px py-8">
        <AdminProviderQueue initialItems={queue} />
      </div>
    </div>
  );
}
