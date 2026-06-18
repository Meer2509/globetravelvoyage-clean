import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminVerificationConsole } from "@/components/admin/AdminVerificationConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminVerificationQueue } from "@/lib/trust/verification-actions";
import { fetchOpenFraudFlags } from "@/lib/trust/fraud-monitor";

export const metadata: Metadata = {
  title: "Verification & Trust — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminVerificationPage() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) {
    return <AdminAccessRequired message={adminAuth.error} />;
  }

  const [queue, fraudFlags] = await Promise.all([
    fetchAdminVerificationQueue(),
    fetchOpenFraudFlags(30),
  ]);

  return <AdminVerificationConsole queue={queue} fraudFlags={fraudFlags} />;
}
