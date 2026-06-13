"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/DashboardLayout";
import { getPlatformFeePercent } from "@/lib/stripe/connect-config";

interface ConnectEarnings {
  grossSales: number;
  platformFees: number;
  estimatedPayout: number;
  completedPayouts: number;
  pendingPayouts: number;
  currency: string;
}

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function ProviderEarningsSummary({ compact = false }: { compact?: boolean }) {
  const [earnings, setEarnings] = useState<ConnectEarnings | null>(null);
  const [connectReady, setConnectReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const feePercent = getPlatformFeePercent();

  useEffect(() => {
    fetch("/api/stripe/connect/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.earnings) setEarnings(data.earnings);
        setConnectReady(Boolean(data?.connectReady));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-charcoal/50">Loading earnings…</p>;
  }

  if (!earnings || (earnings.grossSales === 0 && earnings.estimatedPayout === 0)) {
    return (
      <Panel title="Earnings" subtitle={`Platform fee: ${feePercent}% per paid booking`}>
        <p className="text-sm text-muted">
          No paid bookings linked to your provider account yet. Earnings appear here after customers complete checkout.
        </p>
      </Panel>
    );
  }

  const cards = [
    { label: "Gross sales", value: formatMoney(earnings.grossSales, earnings.currency), color: "text-navy" },
    { label: "Platform fees", value: formatMoney(earnings.platformFees, earnings.currency), color: "text-gold" },
    { label: "Estimated payout", value: formatMoney(earnings.estimatedPayout, earnings.currency), color: "text-navy" },
    {
      label: connectReady ? "Transferred" : "Pending setup",
      value: connectReady
        ? formatMoney(earnings.completedPayouts, earnings.currency)
        : formatMoney(earnings.pendingPayouts, earnings.currency),
      color: connectReady ? "text-emerald-700" : "text-gold",
    },
  ];

  if (compact) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-soft-200 bg-white px-4 py-3">
            <p className="text-xs text-muted">{c.label}</p>
            <p className={`mt-1 text-lg font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Panel
      title="Earnings summary"
      subtitle={`Platform fee: ${feePercent}% · Provider receives remaining balance after Stripe fees`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-soft p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{c.label}</p>
            <p className={`mt-2 text-xl font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
      {!connectReady && (
        <p className="mt-4 text-sm text-muted rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
          Payout setup pending — payments are recorded but transfers require a connected Stripe account.
        </p>
      )}
    </Panel>
  );
}
