import Link from "next/link";
import { PayoutSetupPanel } from "@/components/PayoutSetupPanel";
import {
  fetchProviderPayoutSummary,
  fetchProviderBookingsList,
  fetchProviderTransactionsList,
} from "@/lib/supabase/payout-queries";
import { formatPaymentAmount } from "@/lib/payments-display";

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default async function PayoutsPage() {
  const [summary, bookings, transactions] = await Promise.all([
    fetchProviderPayoutSummary(),
    fetchProviderBookingsList(),
    fetchProviderTransactionsList(),
  ]);

  const currency = summary?.currency ?? "USD";

  return (
    <div className="min-h-screen bg-soft/30">
      <div className="bg-hero-gradient py-10">
        <div className="container-px">
          <Link href="/dashboard" className="text-xs text-muted-dark hover:text-white transition-colors">
            ← Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold text-white">Provider payouts</h1>
          <p className="mt-1 text-sm text-muted-dark">Earnings from Stripe payments and booked services</p>
        </div>
      </div>

      <div className="container-px py-8 space-y-6 max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Total earnings</p>
            <p className="mt-2 text-2xl font-extrabold text-navy">
              {formatMoney(summary?.totalEarnings ?? 0, currency)}
            </p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Pending payouts</p>
            <p className="mt-2 text-2xl font-extrabold text-gold">
              {formatMoney(summary?.pendingPayouts ?? 0, currency)}
            </p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Completed payouts</p>
            <p className="mt-2 text-2xl font-extrabold text-navy">
              {formatMoney(summary?.completedPayouts ?? 0, currency)}
            </p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Booked services</p>
            <p className="mt-2 text-2xl font-extrabold text-navy">{summary?.bookedServices ?? 0}</p>
          </div>
        </div>

        <PayoutSetupPanel />

        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 px-5 py-4">
            <h2 className="font-bold text-navy">Booked services</h2>
            <p className="text-xs text-muted mt-0.5">Confirmed bookings from paid Stripe checkouts</p>
          </div>
          {bookings.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted text-center">No booked services yet.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                  <div>
                    <p className="font-semibold text-navy">{b.listing_title ?? b.booking_type}</p>
                    <p className="text-xs text-muted capitalize">{b.booking_type.replace(/_/g, " ")} · {b.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">
                      {b.total_amount != null ? formatMoney(Number(b.total_amount), b.currency ?? currency) : "—"}
                    </p>
                    <p className="text-xs text-muted">{new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 px-5 py-4">
            <h2 className="font-bold text-navy">Payment transactions</h2>
            <p className="text-xs text-muted mt-0.5">Stripe payment records linked to your provider account</p>
          </div>
          {transactions.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted text-center">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-soft-200">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                  <div>
                    <p className="font-semibold text-navy">{t.description ?? "Payment"}</p>
                    <p className="text-xs text-muted">{t.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">
                      {formatPaymentAmount(Number(t.provider_amount ?? t.amount), t.currency ?? currency)}
                    </p>
                    <p className="text-xs text-muted">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 text-sm text-muted space-y-2">
          <p className="font-bold text-navy">How payouts work</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Customers pay via secure Stripe Checkout for consultations, plans, tours, and properties.</li>
            <li>Payments, bookings, and transactions are saved in Supabase automatically.</li>
            <li>Provider earnings show your share after the 15% platform fee on marketplace services.</li>
            <li>Automated Stripe Connect payouts will transfer pending balances to your bank account.</li>
          </ul>
          <Link href="/legal/payment-terms" className="inline-block mt-2 text-blue font-semibold hover:underline text-sm">
            Read payment terms →
          </Link>
        </div>
      </div>
    </div>
  );
}
