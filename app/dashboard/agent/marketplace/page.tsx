"use client";

import Link from "next/link";
import { TravelAgentMarketplacePanel } from "@/components/travel-agents/TravelAgentMarketplacePanel";
import { useDashboardUser } from "@/hooks/useDashboardUser";

export default function AgentMarketplacePage() {
  const user = useDashboardUser();
  const userId = user.result?.ok ? user.result.profile.id : "";

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/agent" className="text-xs font-semibold text-blue hover:underline">
            ← Agent dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Travel agent marketplace</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your public profile, services, inquiries, and bookings.
          </p>
        </div>
      </div>
      <div className="container-px py-8">
        {userId ? (
          <TravelAgentMarketplacePanel userId={userId} />
        ) : (
          <p className="text-sm text-muted">Sign in to manage your marketplace profile.</p>
        )}
      </div>
    </div>
  );
}
