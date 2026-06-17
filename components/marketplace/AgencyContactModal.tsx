"use client";

import Link from "next/link";
import { ProviderMarketplacePanel } from "@/components/marketplace/ProviderMarketplacePanel";

export function AgencyContactModal({
  open,
  onClose,
  agency,
  targetType = "agency",
}: {
  open: boolean;
  onClose: () => void;
  agency: {
    id: string;
    userId: string;
    name: string;
    city: string;
    country: string;
  } | null;
  targetType?: "agency" | "visa_agent";
}) {
  if (!open || !agency) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-premium)] max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-navy">{agency.name}</h2>
            <p className="text-sm text-muted">{agency.city}, {agency.country}</p>
          </div>
          <button type="button" onClick={onClose} className="text-charcoal/40 hover:text-navy text-xl" aria-label="Close">
            ×
          </button>
        </div>
        <ProviderMarketplacePanel
          targetType={targetType}
          targetId={agency.id}
          providerUserId={agency.userId}
          providerName={agency.name}
        />
        <div className="mt-4 border-t border-soft-200 pt-4">
          <Link href="/lead/contact" className="text-sm font-semibold text-blue hover:underline">
            Request a formal custom quote →
          </Link>
        </div>
      </div>
    </div>
  );
}
