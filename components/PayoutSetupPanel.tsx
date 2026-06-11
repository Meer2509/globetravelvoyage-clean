"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/DashboardLayout";
import { fetchPayoutAccount, type PayoutAccountRow } from "@/lib/supabase/mvp-queries";

import { isStripeConfigured } from "@/lib/stripe";

export function PayoutSetupPanel() {
  const [account, setAccount] = useState<PayoutAccountRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/supabase/client").then(async ({ createClient }) => {
      const client = createClient();
      if (!client) {
        setLoading(false);
        return;
      }
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const row = await fetchPayoutAccount(user.id);
      setAccount(row);
      setLoading(false);
    });
  }, []);

  return (
    <Panel title="Payout setup" subtitle="Provider earnings and payouts">
      {loading ? (
        <p className="text-sm text-charcoal/50">Loading payout status…</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-charcoal/70">
            Payout system coming soon — platform currently collects payments. Provider payouts via Stripe Connect will be enabled in the next phase.
          </div>
          {account ? (
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Onboarding</p>
                <p className="font-semibold text-navy capitalize">{account.onboarding_status.replace(/_/g, " ")}</p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Charges</p>
                <p className="font-semibold text-navy">{account.charges_enabled ? "Enabled" : "Not enabled"}</p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs text-charcoal/50">Payouts</p>
                <p className="font-semibold text-navy">{account.payouts_enabled ? "Enabled" : "Not enabled"}</p>
              </div>
            </div>
          ) : null}
          <Link href="/dashboard/payouts" className="btn-primary inline-flex px-5 py-2.5 text-sm">
            View payout policy
          </Link>
          {!isStripeConfigured && (
            <p className="text-xs text-charcoal/50">
              Stripe Connect onboarding will be enabled in the next phase. Add Stripe keys in{" "}
              <a href="/admin/setup" className="font-semibold text-blue hover:underline">setup</a>.
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
