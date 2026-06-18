import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { requireAdmin } from "@/lib/auth-server";
import { getProductionAuditReport } from "@/lib/audit-status";

export const metadata: Metadata = {
  title: "Production Audit — Globe Travel Voyage",
  robots: { index: false, follow: false },
};

const STATUS_STYLES = {
  pass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warn: "bg-gold/10 text-navy border-gold/30",
  fail: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue/5 text-blue border-blue/20",
};

export default async function AdminAuditPage() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) {
    return <AdminAccessRequired message={adminAuth.error} />;
  }

  const report = await getProductionAuditReport();

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient px-5 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <Link href="/admin/setup" className="text-sm text-white/50 hover:text-white">← Setup</Link>
          <h1 className="mt-3 text-3xl font-extrabold">Production audit</h1>
          <p className="mt-2 text-sm text-white/65">
            Live checks for Supabase, Stripe, routes, and marketplace readiness.
          </p>
          <p className="mt-1 text-xs text-white/40">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10 space-y-8">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="card p-5 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide">Routes checked</p>
            <p className="mt-1 text-3xl font-extrabold text-navy">{report.routesChecked}</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide">Passing</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-600">{report.summary.pass}</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide">Warnings</p>
            <p className="mt-1 text-3xl font-extrabold text-gold">{report.summary.warn}</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide">Failures</p>
            <p className="mt-1 text-3xl font-extrabold text-red-600">{report.summary.fail}</p>
          </div>
        </div>

        {report.recordCounts && (
          <div className="grid gap-4 sm:grid-cols-5">
            {[
              { label: "Verified providers", value: report.recordCounts.verifiedProviders },
              { label: "Bookings", value: report.recordCounts.bookings },
              { label: "Reviews", value: report.recordCounts.reviews },
              { label: "Paid payments", value: report.recordCounts.payments },
              { label: "Leads", value: report.recordCounts.leads },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <p className="text-xs text-charcoal/50">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-navy">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {report.recommendedFixes.length > 0 && (
          <div className="card border border-gold/25 bg-gold/5 p-6">
            <h2 className="font-bold text-navy">Recommended next fixes</h2>
            <ul className="mt-3 space-y-2 text-sm text-charcoal/70">
              {report.recommendedFixes.map((fix) => (
                <li key={fix} className="flex gap-2">
                  <span className="text-gold">→</span>
                  {fix}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 px-6 py-4">
            <h2 className="font-bold text-navy">Audit checklist</h2>
            <p className="text-sm text-charcoal/55">Auth, payments, Supabase tables, Stripe, launch readiness</p>
          </div>
          <div className="divide-y divide-soft-200">
            {report.checks.map((check) => (
              <div key={check.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                  <p className="font-semibold text-navy">{check.label}</p>
                  <p className="mt-0.5 text-sm text-charcoal/55">{check.detail}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[check.status]}`}>
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 text-sm text-charcoal/65 space-y-2">
          <p><strong className="text-navy">Stripe:</strong> Checkout at /checkout · Webhook at /api/stripe/webhook · Success at /payment-success</p>
          <p><strong className="text-navy">Auth:</strong> Register/login via Supabase · Role dashboards at /dashboard/*</p>
          <p><strong className="text-navy">Intake:</strong> Visa /visa/start · Booking /booking/request · Contact /lead/contact</p>
          <p className="text-xs text-charcoal/45 pt-2">
            Globe Travel Voyage is not a government agency, embassy, immigration lawyer, airline, cruise company, travel supplier, real estate broker, or official visa authority.
          </p>
        </div>
      </div>
    </div>
  );
}
