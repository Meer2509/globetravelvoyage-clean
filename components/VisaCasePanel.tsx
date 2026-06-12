"use client";

import Link from "next/link";
import { useState } from "react";
import { Panel, ProgressBar, TimelineItem } from "@/components/DashboardLayout";
import { CaseDocumentChecklist } from "@/components/CaseDocumentChecklist";
import { VisaCaseSummaryCard } from "@/components/VisaCaseSummaryCard";
import { formatPaymentDate } from "@/lib/payments-display";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";
import { VISA_CASE_STATUSES } from "@/lib/visa-case-constants";
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
  "Upload required documents": "Upload required documents",
};

export function VisaCasePanel({
  visaCases,
  onRefresh,
}: {
  visaCases: VisaCaseData[];
  onRefresh?: () => void;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleUpdated() {
    setRefreshKey((k) => k + 1);
    onRefresh?.();
  }

  if (visaCases.length === 0) {
    return (
      <Panel title="My visa cases" subtitle="Premium visa support">
        <div className="py-10 text-center">
          <p className="text-4xl mb-4">🛂</p>
          <p className="font-bold text-navy text-lg">No active visa cases yet</p>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Purchase a visa service to unlock case tracking, document checklist, and preparation support.
            Visa approval is never guaranteed.
          </p>
          <Link href="/services#premium" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
            Start visa service
          </Link>
        </div>
      </Panel>
    );
  }

  const primaryCase = visaCases[0];

  return (
    <div className="space-y-6" key={refreshKey}>
      <VisaCaseSummaryCard visaCase={primaryCase} />

      {visaCases.length > 1 && (
        <Panel title="All visa cases" subtitle={`${visaCases.length} active cases`}>
          <div className="space-y-3">
            {visaCases.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-soft-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-navy">{c.visaType}</p>
                  <p className="text-xs font-mono text-muted">{c.caseNumber}</p>
                </div>
                <Link href={visaCaseWorkspacePath(c.id)} className="btn-outline px-4 py-2 text-xs">
                  Open case
                </Link>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Quick checklist" subtitle="Open your workspace for full upload controls">
        <CaseDocumentChecklist
          caseId={primaryCase.id}
          items={primaryCase.checklist.slice(0, 4)}
          onUpdated={handleUpdated}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={visaCaseWorkspacePath(primaryCase.id, "documents")} className="btn-primary px-5 py-2.5 text-sm">
            View full checklist
          </Link>
        </div>
      </Panel>

      <Panel title="Case timeline" subtitle={`Opened ${formatPaymentDate(primaryCase.createdAt)}`}>
        <ProgressBar pct={primaryCase.progressPercent ?? 15} label={`${primaryCase.progressPercent ?? 15}% complete`} color="gold" />
        <div className="mt-6 space-y-1">
          {VISA_CASE_STATUSES.filter((s) => s !== "cancelled").slice(0, 5).map((status, i) => {
            const currentIdx = VISA_CASE_STATUSES.indexOf(primaryCase.status as (typeof VISA_CASE_STATUSES)[number]);
            return (
              <TimelineItem
                key={status}
                title={STATUS_LABELS[status] ?? status}
                date=""
                status={currentIdx > i ? "done" : currentIdx === i ? "active" : "upcoming"}
                last={i === 4}
              />
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
