import Link from "next/link";
import { fetchAdminPayments } from "@/lib/supabase/queries";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import { StripeTrustBanner } from "@/components/ServicesCatalog";

export default async function AdminPaymentsPage() {
  const { payments, error, tableMissing } = await fetchAdminPayments();
  const paid = payments.filter((p) => p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending");
  const totalRevenue = paid.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-soft/30">
      <div className="bg-hero-gradient py-10">
        <div className="container-px">
          <Link href="/dashboard/admin" className="text-xs text-muted-dark hover:text-white transition-colors">
            ← Admin dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold text-white">Payments</h1>
          <p className="mt-1 text-sm text-muted-dark">Live Stripe payments from Supabase</p>
        </div>
      </div>

      <div className="container-px py-8 max-w-5xl space-y-6">
        {tableMissing && (
          <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-navy">
            Payments table not found. Run supabase migrations 002 and 004.
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Total payments</p>
            <p className="mt-2 text-2xl font-extrabold text-navy">{payments.length}</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Paid revenue</p>
            <p className="mt-2 text-2xl font-extrabold text-gold">{formatPaymentAmount(totalRevenue)}</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Pending</p>
            <p className="mt-2 text-2xl font-extrabold text-navy">{pending.length}</p>
          </div>
        </div>

        <StripeTrustBanner />

        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 px-5 py-4">
            <h2 className="font-bold text-navy">All payments</h2>
            <p className="text-xs text-muted mt-0.5">Updated via Stripe webhook on checkout.session.completed</p>
          </div>
          {payments.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted">
              No payments recorded yet. Completed checkouts from{" "}
              <Link href="/services" className="text-blue font-semibold hover:underline">/services</Link> appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-soft-200 bg-soft/50 text-left text-xs font-bold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-200">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-soft/30">
                      <td className="px-5 py-3 font-medium text-navy">
                        {paymentServiceLabel(p.service_type, p.description)}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {p.customer_name ?? p.customer_email ?? p.email ?? "—"}
                      </td>
                      <td className="px-5 py-3 font-bold text-navy">
                        {formatPaymentAmount(Number(p.amount), p.currency ?? "USD")}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            p.status === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gold/15 text-navy"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted text-xs">
                        {formatPaymentDate(p.paid_at ?? p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
