"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/DashboardLayout";
import { formatPaymentAmount, paymentServiceLabel } from "@/lib/payments-display";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";
import { visaCaseWorkspacePath } from "@/lib/visa-case-routes";

const STATUS_LABELS: Record<string, string> = {
  intake_started: "Intake started",
  documents_needed: "Documents needed",
  documents_uploaded: "Documents uploaded",
  under_review: "Under review",
  expert_assigned: "Expert assigned",
  prep_in_progress: "Preparation in progress",
  ready_for_submission: "Ready for submission",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function VisaCaseSummaryCard({ visaCase }: { visaCase: VisaCaseData }) {
  const progressPct = visaCase.progressPercent ?? 15;
  const stepLabel = STATUS_LABELS[visaCase.currentStep] ?? visaCase.currentStep;
  const requiredCount = visaCase.checklist.filter((d) => d.required !== false).length;
  const doneCount = visaCase.checklist.filter((d) =>
    ["uploaded", "prepared", "reviewed"].includes(d.status)
  ).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-soft-200 bg-white shadow-[var(--shadow-premium)]">
      <div className="bg-hero-gradient px-6 py-5">
        <span className="eyebrow-gold">My Visa Case</span>
        <h3 className="mt-1 text-xl font-extrabold text-white">{visaCase.visaType}</h3>
        <p className="font-mono text-sm text-gold">{visaCase.caseNumber}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted">Service purchased</p>
            <p className="font-semibold text-navy">
              {paymentServiceLabel(visaCase.serviceProductKey, visaCase.serviceName)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Status</p>
            <p className="font-semibold text-navy capitalize">
              {STATUS_LABELS[visaCase.status] ?? visaCase.status.replace(/_/g, " ")}
            </p>
          </div>
          {visaCase.amount != null && (
            <div>
              <p className="text-xs text-muted">Amount paid</p>
              <p className="font-semibold text-navy">
                {formatPaymentAmount(visaCase.amount, visaCase.currency)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted">Next step</p>
            <p className="font-semibold text-gold">{stepLabel}</p>
          </div>
        </div>
        <ProgressBar
          pct={progressPct}
          label={`${doneCount}/${requiredCount || visaCase.checklist.length} documents ready · ${progressPct}%`}
          color="gold"
        />
        <div className="flex flex-wrap gap-3">
          <Link href={visaCaseWorkspacePath(visaCase.id)} className="btn-primary px-5 py-2.5 text-sm">
            Open case
          </Link>
          <Link
            href={visaCaseWorkspacePath(visaCase.id, "documents")}
            className="btn-gold px-5 py-2.5 text-sm"
          >
            Upload documents
          </Link>
        </div>
      </div>
    </div>
  );
}
