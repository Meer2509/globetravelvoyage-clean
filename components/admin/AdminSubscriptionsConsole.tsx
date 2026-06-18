"use client";

import Link from "next/link";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  canceled: "bg-red-50 text-red-600",
  past_due: "bg-gold/10 text-gold",
  incomplete: "bg-charcoal/10 text-charcoal/60",
};

export function AdminSubscriptionsConsole({
  subscriptions,
  error,
}: {
  subscriptions: Array<Record<string, unknown>>;
  error?: string;
}) {
  const active = subscriptions.filter((s) => s.status === "active");

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted">
            Active Stripe subscriptions for AI Concierge Plus and Agent Pro.
          </p>
        </div>
      </div>

      <div className="container-px py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase text-muted">Active</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-600">{active.length}</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase text-muted">Total records</p>
            <p className="mt-2 text-2xl font-extrabold text-navy">{subscriptions.length}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {subscriptions.length === 0 ? (
          <div className="card p-12 text-center text-sm text-muted">
            No subscriptions yet. Recurring checkouts create records after Stripe confirms.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-200 bg-soft/50 text-left text-xs font-bold uppercase text-muted">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Period end</th>
                  <th className="px-4 py-3">Stripe sub ID</th>
                  <th className="px-4 py-3">Customer ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-200">
                {subscriptions.map((row) => {
                  const s = row as {
                    id: string;
                    user_name: string;
                    plan_key: string;
                    status: string;
                    current_period_end: string | null;
                    stripe_subscription_id: string | null;
                    stripe_customer_id: string | null;
                    created_at: string;
                  };
                  return (
                    <tr key={s.id} className="hover:bg-soft/30">
                      <td className="px-4 py-3 font-medium text-navy">{s.user_name}</td>
                      <td className="px-4 py-3">{s.plan_key.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[s.status] ?? ""}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-charcoal/50">
                        {s.stripe_subscription_id?.slice(0, 20) ?? "—"}…
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-charcoal/50">
                        {s.stripe_customer_id?.slice(0, 16) ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
