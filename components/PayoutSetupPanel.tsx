"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/DashboardLayout";
import { getPlatformFeePercent } from "@/lib/stripe/connect-config";
import { isStripeConfigured } from "@/lib/stripe";

interface ConnectStatusResponse {
  configured: boolean;
  isProvider: boolean;
  platformFeePercent: number;
  account: {
    stripeAccountId: string | null;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    onboardingStatus: string;
    providerRole: string | null;
  } | null;
  connectReady: boolean;
  pendingRequirements: string[];
}

export function PayoutSetupPanel({ showFullActions = false }: { showFullActions?: boolean }) {
  const [status, setStatus] = useState<ConnectStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const feePercent = getPlatformFeePercent();

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect/status");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      setError("Could not load payout status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function startOnboarding(endpoint: "create-account" | "account-link") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/stripe/connect/${endpoint}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start Stripe onboarding.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not connect to Stripe. Please try again.");
      setBusy(false);
    }
  }

  const account = status?.account;
  const connectReady = status?.connectReady ?? false;

  return (
    <Panel title="Payout setup" subtitle="Stripe Connect payouts for verified providers">
      {loading ? (
        <p className="text-sm text-charcoal/50">Loading payout status…</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-charcoal/75 space-y-2">
            <p>
              Stripe Connect payouts are being activated for verified providers. Platform fee:{" "}
              <strong>{feePercent}%</strong> per paid booking.
            </p>
            <p className="text-muted">
              Provider receives remaining balance after Stripe fees and platform fee.
            </p>
          </div>

          {!status?.configured && (
            <div className="rounded-xl border border-soft-200 bg-white px-4 py-3 text-sm text-muted">
              Stripe Connect is not configured yet. Add{" "}
              <code className="text-xs bg-soft px-1 py-0.5 rounded">STRIPE_SECRET_KEY</code> and optionally{" "}
              <code className="text-xs bg-soft px-1 py-0.5 rounded">STRIPE_CONNECT_CLIENT_ID</code> in your environment.
              {!isStripeConfigured && (
                <>
                  {" "}
                  See{" "}
                  <Link href="/admin/setup" className="font-semibold text-blue hover:underline">
                    setup
                  </Link>
                  .
                </>
              )}
            </div>
          )}

          {status?.isProvider === false && (
            <p className="text-sm text-muted">
              Payout setup is available for visa experts, agencies, guides, and property hosts.
            </p>
          )}

          {account && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Onboarding</p>
                <p className="font-semibold text-navy capitalize">
                  {account.onboardingStatus.replace(/_/g, " ")}
                </p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Charges</p>
                <p className="font-semibold text-navy">
                  {account.chargesEnabled ? "Enabled" : "Not enabled"}
                </p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Payouts</p>
                <p className="font-semibold text-navy">
                  {account.payoutsEnabled ? "Enabled" : "Not enabled"}
                </p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Details</p>
                <p className="font-semibold text-navy">
                  {account.detailsSubmitted ? "Submitted" : "Incomplete"}
                </p>
              </div>
            </div>
          )}

          {status?.pendingRequirements && status.pendingRequirements.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
              <p className="font-semibold text-amber-900">Pending requirements</p>
              <ul className="mt-2 list-disc pl-5 text-amber-800 space-y-0.5">
                {status.pendingRequirements.slice(0, 6).map((req) => (
                  <li key={req} className="text-xs">
                    {req.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {connectReady ? (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              Your Stripe account is connected. New paid bookings split automatically — platform fee {feePercent}%, remainder to your connected account.
            </p>
          ) : status?.isProvider ? (
            <p className="text-sm text-muted">
              Complete Stripe onboarding to receive automated payouts. Until then, earnings show as pending setup.
            </p>
          ) : null}

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          {showFullActions && status?.isProvider && status.configured && (
            <div className="flex flex-wrap gap-3">
              {!account?.stripeAccountId ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => startOnboarding("create-account")}
                  className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
                >
                  {busy ? "Connecting…" : "Set up Stripe payouts"}
                </button>
              ) : !connectReady ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => startOnboarding("account-link")}
                  className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
                >
                  {busy ? "Opening Stripe…" : "Continue Stripe setup"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => startOnboarding("account-link")}
                  className="btn-outline px-5 py-2.5 text-sm disabled:opacity-50"
                >
                  Update payout details
                </button>
              )}
            </div>
          )}

          {!showFullActions && (
            <Link href="/dashboard/payouts" className="btn-primary inline-flex px-5 py-2.5 text-sm">
              Manage payouts
            </Link>
          )}
        </div>
      )}
    </Panel>
  );
}
