"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/DashboardLayout";
import { formatPaymentAmount, paymentServiceLabel } from "@/lib/payments-display";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";
import { visaCaseWorkspacePath } from "@/lib/visa-case-routes";
import { customerDashboardPath } from "@/lib/dashboard-routes";

const STATUS_LABELS: Record<string, string> = {
  documents_needed: "Documents needed",
  documents_uploaded: "Documents uploaded",
  under_review: "Under review",
  expert_assigned: "Expert assigned",
  prep_in_progress: "In progress",
  ready_for_submission: "Ready for submission",
  completed: "Completed",
};

export function VisaCasesList({ cases }: { cases: VisaCaseData[] }) {
  if (cases.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="card max-w-lg w-full p-10 text-center">
          <p className="text-4xl mb-4">🛂</p>
          <h1 className="text-2xl font-extrabold text-navy">No visa cases yet</h1>
          <p className="mt-3 text-sm text-muted">
            When you purchase a premium visa service, your case workspace will appear here with document tracking and expert support.
          </p>
          <Link href="/services#premium" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
            Start new service
          </Link>
          <Link href={customerDashboardPath()} className="mt-3 block text-sm font-semibold text-blue hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-8 sm:py-10">
        <div className="container-px">
          <Link href={customerDashboardPath("visa-cases")} className="text-sm text-white/70 hover:text-white mb-4 inline-block">
            ← Dashboard
          </Link>
          <span className="eyebrow-gold">Your cases</span>
          <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">Visa cases</h1>
          <p className="mt-2 text-sm text-white/70">{cases.length} active case{cases.length === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="container-px py-8 space-y-4 max-w-3xl mx-auto">
        {cases.map((c) => {
          const done = c.checklist.filter((d) =>
            ["prepared", "uploaded", "reviewed"].includes(d.status)
          ).length;
          const total = c.checklist.length || 1;
          return (
            <div key={c.id} className="card p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-gold">{c.caseNumber}</p>
                  <h2 className="text-lg font-extrabold text-navy mt-1">{c.visaType}</h2>
                  <p className="text-sm text-muted mt-1">
                    {paymentServiceLabel(c.serviceProductKey, c.serviceName)}
                  </p>
                </div>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-navy capitalize">
                  {STATUS_LABELS[c.status] ?? c.status.replace(/_/g, " ")}
                </span>
              </div>
              <ProgressBar
                pct={c.progressPercent ?? 15}
                label={`${done}/${total} documents ready`}
                color="gold"
              />
              <p className="text-sm text-muted">Next: {c.currentStep}</p>
              {c.amount != null && (
                <p className="text-sm text-navy font-semibold">
                  Paid {formatPaymentAmount(c.amount, c.currency)}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Link href={visaCaseWorkspacePath(c.id)} className="btn-primary px-5 py-2.5 text-sm">
                  Open case
                </Link>
                <Link href={visaCaseWorkspacePath(c.id, "documents")} className="btn-gold px-5 py-2.5 text-sm">
                  Upload documents
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
