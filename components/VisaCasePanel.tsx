"use client";

import Link from "next/link";
import { Panel, ProgressBar, TimelineItem } from "@/components/DashboardLayout";
import { CaseDocumentUpload } from "@/components/CaseDocumentUpload";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";
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
};

export function VisaCasePanel({ visaCase }: { visaCase: VisaCaseData | null }) {
  if (!visaCase) {
    return (
      <Panel title="My Visa Case" subtitle="Premium visa support">
        <div className="py-10 text-center">
          <p className="text-4xl mb-4">🛂</p>
          <p className="font-bold text-navy text-lg">No active visa case yet</p>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Start a paid visa service to unlock case tracking, document checklist, and expert preparation support.
            Visa approval is never guaranteed.
          </p>
          <Link href="/services#premium" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
            Start Visa Service
          </Link>
        </div>
      </Panel>
    );
  }

  const progressPct = visaCase.progressPercent ?? 10;
  const currentIdx = VISA_CASE_STATUSES.indexOf(visaCase.status as (typeof VISA_CASE_STATUSES)[number]);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-hero-gradient p-6 sm:p-8 shadow-[var(--shadow-premium)]">
        <span className="eyebrow-gold">My Visa Case</span>
        <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{visaCase.visaType}</h2>
        <p className="mt-1 font-mono text-sm text-gold">{visaCase.caseNumber}</p>
        <p className="mt-2 text-sm text-white/70">
          Service: {paymentServiceLabel(visaCase.serviceProductKey, visaCase.serviceName)}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">Payment status</p>
            <p className="mt-1 font-bold text-emerald-300 capitalize">{visaCase.paymentStatus}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">Amount paid</p>
            <p className="mt-1 font-bold text-white">
              {visaCase.amount != null ? formatPaymentAmount(visaCase.amount, visaCase.currency) : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">Case status</p>
            <p className="mt-1 font-bold text-gold capitalize">
              {STATUS_LABELS[visaCase.status] ?? visaCase.status.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>

      <Panel title="Status timeline" subtitle={`${progressPct}% complete`}>
        <ProgressBar pct={progressPct} label={`${progressPct}% complete`} color="gold" />
        <div className="mt-6 space-y-1">
          {VISA_CASE_STATUSES.filter((s) => s !== "cancelled").map((status, i) => (
            <TimelineItem
              key={status}
              title={STATUS_LABELS[status] ?? status}
              date=""
              status={
                currentIdx > i ? "done" : currentIdx === i ? "active" : "upcoming"
              }
              last={i === VISA_CASE_STATUSES.length - 2}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Document checklist" subtitle="Upload required documents for your visa case">
        <ul className="mb-5 space-y-2">
          {(visaCase.checklist.length ? visaCase.checklist : [
            { name: "Passport", status: "pending" },
            { name: "Photo", status: "pending" },
            { name: "Bank statement", status: "pending" },
            { name: "Employment letter", status: "pending" },
            { name: "Travel itinerary", status: "pending" },
          ]).map((doc, i) => (
            <li key={doc.name + i} className="flex items-center gap-3 rounded-xl bg-soft px-4 py-3 text-sm">
              <span className={doc.status === "uploaded" ? "text-emerald-500" : "text-muted"}>
                {doc.status === "uploaded" ? "✓" : "○"}
              </span>
              <span className="text-navy">{doc.name}</span>
              <span className="ml-auto text-xs capitalize text-muted">{doc.status}</span>
            </li>
          ))}
        </ul>
        <CaseDocumentUpload caseId={visaCase.id} />
      </Panel>

      <Panel title="Support" subtitle="Message our team about your case">
        <p className="text-sm text-muted mb-4">
          Support is available through your dashboard. We do not provide legal advice or guarantee visa approval.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/customer?tab=support" className="btn-outline px-5 py-2.5 text-sm">
            Message support
          </Link>
          <Link href="/dashboard/customer?tab=documents" className="btn-gold px-5 py-2.5 text-sm">
            Upload documents
          </Link>
        </div>
      </Panel>

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
          <div className="rounded-xl bg-soft p-4">
            <p className="text-xs text-muted">Destination</p>
            <p className="font-semibold text-navy">{visaCase.destinationCountry}</p>
          </div>
          <div className="rounded-xl bg-soft p-4">
            <p className="text-xs text-muted">Current step</p>
            <p className="font-semibold text-navy capitalize">
              {STATUS_LABELS[visaCase.currentStep] ?? visaCase.currentStep.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
