"use client";

import Link from "next/link";
import { Panel, ProgressBar, TimelineItem } from "@/components/DashboardLayout";
import { DocumentUploadPanel } from "@/components/DocumentUploadPanel";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";

const VISA_STEPS = [
  "Payment confirmed",
  "Expert assignment",
  "Document collection",
  "Application review",
  "Submission ready",
  "Decision tracking",
];

export function VisaCasePanel({ visaCase }: { visaCase: VisaCaseData | null }) {
  if (!visaCase) {
    return (
      <Panel title="My Visa Case" subtitle="Premium visa support">
        <div className="py-8 text-center">
          <p className="text-4xl mb-4">🛂</p>
          <p className="font-bold text-navy">No active visa case</p>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Purchase Full Visa Application Support or a premium consultation to unlock your personal visa case dashboard.
          </p>
          <Link href="/services#premium" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
            View premium visa services
          </Link>
        </div>
      </Panel>
    );
  }

  const step = visaCase.progressStep ?? 1;
  const progressPct = Math.round((step / VISA_STEPS.length) * 100);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-hero-gradient p-6 sm:p-8 shadow-[var(--shadow-premium)]">
        <span className="eyebrow-gold">Premium visa case</span>
        <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{visaCase.visaType}</h2>
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
            <p className="text-xs text-white/50">Assigned expert</p>
            <p className="mt-1 font-bold text-gold">{visaCase.assignedExpert ?? "Assignment in progress"}</p>
          </div>
        </div>
      </div>

      <Panel title="Visa progress tracker" subtitle={`Step ${step} of ${VISA_STEPS.length}`}>
        <ProgressBar pct={progressPct} label={`${progressPct}% complete`} color="gold" />
        <div className="mt-6 space-y-1">
          {VISA_STEPS.map((label, i) => (
            <TimelineItem
              key={label}
              title={label}
              date=""
              status={i + 1 < step ? "done" : i + 1 === step ? "active" : "upcoming"}
              last={i === VISA_STEPS.length - 1}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Document checklist" subtitle="Upload required documents for your visa case">
        <ul className="mb-5 space-y-2">
          {(visaCase.checklist ?? []).map((doc, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-soft px-4 py-3 text-sm">
              <span className={doc.status === "uploaded" ? "text-emerald-500" : "text-muted"}>
                {doc.status === "uploaded" ? "✓" : "○"}
              </span>
              <span className="text-navy">{doc.name}</span>
              <span className="ml-auto text-xs capitalize text-muted">{doc.status}</span>
            </li>
          ))}
        </ul>
        <DocumentUploadPanel />
      </Panel>

      <Panel title="Case details" subtitle={`Opened ${formatPaymentDate(visaCase.createdAt)}`}>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-xl bg-soft p-4">
            <p className="text-xs text-muted">Case ID</p>
            <p className="font-mono font-semibold text-navy">{visaCase.id.slice(0, 12)}…</p>
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
            <p className="text-xs text-muted">Case status</p>
            <p className="font-semibold text-navy capitalize">{visaCase.status.replace(/_/g, " ")}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
