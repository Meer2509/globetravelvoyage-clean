"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Panel, ProgressBar, TimelineItem } from "@/components/DashboardLayout";
import { CaseDocumentChecklist } from "@/components/CaseDocumentChecklist";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";
import { fetchCustomerVisaCaseById } from "@/lib/supabase/visa-case-queries";
import { VISA_CASE_STATUSES } from "@/lib/visa-case-constants";

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
  "Upload required documents": "Upload required documents",
};

export function VisaCaseWorkspace({
  initialCase,
  storageReady,
}: {
  initialCase: VisaCaseData;
  storageReady: boolean;
}) {
  const router = useRouter();
  const [visaCase, setVisaCase] = useState(initialCase);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    fetchCustomerVisaCaseById(initialCase.id).then((data) => {
      if (data) setVisaCase(data);
      setRefreshKey((k) => k + 1);
    });
  }, [initialCase.id]);

  useEffect(() => {
    if (window.location.hash === "#documents") {
      document.getElementById("documents")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const progressPct = visaCase.progressPercent ?? 15;
  const currentIdx = VISA_CASE_STATUSES.indexOf(visaCase.status as (typeof VISA_CASE_STATUSES)[number]);
  const stepLabel = STATUS_LABELS[visaCase.currentStep] ?? visaCase.currentStep;

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-8 sm:py-10">
        <div className="container-px">
          <button
            type="button"
            onClick={() => router.push("/dashboard/customer")}
            className="text-sm text-white/70 hover:text-white mb-4 inline-flex items-center gap-1"
          >
            ← Back to dashboard
          </button>
          <span className="eyebrow-gold">Visa case workspace</span>
          <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{visaCase.visaType}</h1>
          <p className="mt-1 font-mono text-sm text-gold">{visaCase.caseNumber}</p>
          <p className="mt-2 text-sm text-white/70">
            {paymentServiceLabel(visaCase.serviceProductKey, visaCase.serviceName)}
          </p>
        </div>
      </div>

      <div className="container-px py-8 space-y-6 max-w-4xl mx-auto" key={refreshKey}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-xs text-muted">Payment status</p>
            <p className="mt-1 font-bold text-emerald-600 capitalize">{visaCase.paymentStatus}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">Amount paid</p>
            <p className="mt-1 font-bold text-navy">
              {visaCase.amount != null ? formatPaymentAmount(visaCase.amount, visaCase.currency) : "—"}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">Current step</p>
            <p className="mt-1 font-bold text-gold">{stepLabel}</p>
          </div>
        </div>

        <Panel title="Case progress" subtitle={`${progressPct}% complete`}>
          <ProgressBar pct={progressPct} label={`${progressPct}% complete`} color="gold" />
          <div className="mt-6 space-y-1">
            {VISA_CASE_STATUSES.filter((s) => s !== "cancelled").map((status, i) => (
              <TimelineItem
                key={status}
                title={STATUS_LABELS[status] ?? status}
                date=""
                status={currentIdx > i ? "done" : currentIdx === i ? "active" : "upcoming"}
                last={i === VISA_CASE_STATUSES.length - 2}
              />
            ))}
          </div>
        </Panel>

        <div id="documents">
          <Panel title="Document checklist" subtitle="Required and optional items for your case">
            <CaseDocumentChecklist
              caseId={visaCase.id}
              items={visaCase.checklist}
              storageReady={storageReady}
              onUpdated={reload}
            />
          </Panel>
        </div>

        <div id="support">
          <Panel title="Support" subtitle="Questions about your case">
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/customer?tab=support" className="btn-primary px-5 py-2.5 text-sm">
                Message support
              </Link>
              {visaCase.paymentStatus === "paid" && visaCase.invoiceNumber && (
                <Link href="/dashboard/customer?tab=billing" className="btn-outline px-5 py-2.5 text-sm">
                  View receipt
                </Link>
              )}
            </div>
          </Panel>
        </div>

        <Panel title="Case details" subtitle={`Opened ${formatPaymentDate(visaCase.createdAt)}`}>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Case number</p>
              <p className="font-mono font-semibold text-navy">{visaCase.caseNumber}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Invoice</p>
              <p className="font-mono font-semibold text-navy">{visaCase.invoiceNumber ?? "—"}</p>
            </div>
          </div>
        </Panel>

        <p className="text-xs text-muted text-center pb-8">
          Visa approval is never guaranteed. Globe Travel Voyage assists with preparation only.
        </p>
      </div>
    </div>
  );
}
