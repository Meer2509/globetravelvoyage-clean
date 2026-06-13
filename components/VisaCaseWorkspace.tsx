"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Panel, ProgressBar } from "@/components/DashboardLayout";
import { CaseDocumentChecklist } from "@/components/CaseDocumentChecklist";
import { CaseTimeline } from "@/components/CaseTimeline";
import { CaseSupportForm } from "@/components/CaseSupportForm";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";
import { fetchCustomerVisaCaseById } from "@/lib/supabase/visa-case-queries";
import { printCaseChecklist } from "@/lib/visa-case-checklist-download";
import { downloadChecklistUrl } from "@/lib/visa-case-document-client";
import { computeCaseProgress } from "@/lib/visa-case-progress";
import { dashboardPaymentsPath, visaCaseWorkspacePath } from "@/lib/visa-case-routes";
import { customerDashboardPath } from "@/lib/dashboard-routes";

function scrollToSection(id: string) {
  window.setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 150);
}

export function VisaCaseWorkspace({
  initialCase,
  storageReady,
}: {
  initialCase: VisaCaseData;
  storageReady: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visaCase, setVisaCase] = useState(initialCase);
  const [checklistBusy, setChecklistBusy] = useState(false);

  const reload = useCallback(() => {
    setChecklistBusy(true);
    fetchCustomerVisaCaseById(initialCase.id).then((data) => {
      if (data) setVisaCase(data);
      setChecklistBusy(false);
    });
  }, [initialCase.id]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "documents" || section === "support") {
      scrollToSection(section);
    }
  }, [searchParams]);

  function goToSection(section: "documents" | "support") {
    router.push(visaCaseWorkspacePath(visaCase.id, section));
    scrollToSection(section);
  }

  function applyProgress(progress?: { progressPercent: number; currentStep: string; status: string }) {
    if (!progress) return;
    setVisaCase((prev) => ({
      ...prev,
      progressPercent: progress.progressPercent,
      currentStep: progress.currentStep,
      status: progress.status,
    }));
  }

  const liveProgress = computeCaseProgress(visaCase.checklist);
  const progressPct = visaCase.progressPercent ?? liveProgress.progressPercent;
  const stepLabel = visaCase.currentStep || liveProgress.currentStep;

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-8 sm:py-10">
        <div className="container-px">
          <button
            type="button"
            onClick={() => router.push(customerDashboardPath())}
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
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goToSection("documents")}
              className="btn-gold px-4 py-2 text-xs sm:text-sm"
            >
              Upload documents
            </button>
            <button
              type="button"
              onClick={() => goToSection("support")}
              className="rounded-lg border border-white/25 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/10"
            >
              Message support
            </button>
          </div>
        </div>
      </div>

      <div className="container-px py-8 space-y-6 max-w-4xl mx-auto">
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
            <p className="text-xs text-muted">Next step</p>
            <p className="mt-1 font-bold text-gold">{stepLabel}</p>
          </div>
        </div>

        <Panel title="Case progress" subtitle={`${progressPct}% complete · ${liveProgress.done}/${liveProgress.total} documents ready`}>
          <ProgressBar pct={progressPct} label={`${progressPct}% complete`} color="gold" />
          <div className="mt-6">
            <CaseTimeline visaCase={visaCase} />
          </div>
        </Panel>

        <div id="documents">
          <Panel
            title="Document checklist"
            subtitle="Required and optional items for your case"
            action={
              <div className="flex flex-wrap gap-2">
                <a
                  href={downloadChecklistUrl(visaCase.id)}
                  className="btn-outline px-3 py-1.5 text-xs"
                  download
                >
                  Download checklist
                </a>
                <button
                  type="button"
                  onClick={() => printCaseChecklist(visaCase)}
                  className="btn-outline px-3 py-1.5 text-xs"
                >
                  Print checklist
                </button>
              </div>
            }
          >
            {checklistBusy && (
              <p className="text-xs text-muted mb-3">Refreshing your checklist…</p>
            )}
            <CaseDocumentChecklist
              caseId={visaCase.id}
              items={visaCase.checklist}
              storageReady={storageReady}
              onUpdated={reload}
              onProgress={applyProgress}
            />
          </Panel>
        </div>

        <Panel title="Payment receipt" subtitle="Your purchase record">
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Service</p>
              <p className="font-semibold text-navy">
                {paymentServiceLabel(visaCase.serviceProductKey, visaCase.serviceName)}
              </p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Amount</p>
              <p className="font-semibold text-navy">
                {visaCase.amount != null ? formatPaymentAmount(visaCase.amount, visaCase.currency) : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Date</p>
              <p className="font-semibold text-navy">{formatPaymentDate(visaCase.createdAt)}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Status</p>
              <p className="font-semibold text-emerald-600 capitalize">{visaCase.paymentStatus}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {visaCase.paymentId ? (
              <a
                href={`/api/receipt/${visaCase.paymentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-5 py-2.5 text-sm"
              >
                View receipt
              </a>
            ) : (
              <p className="text-sm text-muted rounded-lg border border-soft-200 bg-soft px-4 py-3">
                Stripe receipt will be available once finalized.
              </p>
            )}
            <Link href={dashboardPaymentsPath()} className="btn-outline px-5 py-2.5 text-sm">
              Payment history
            </Link>
          </div>
        </Panel>

        <div id="support">
          <Panel title="Support" subtitle={`Case ${visaCase.caseNumber}`}>
            <CaseSupportForm caseId={visaCase.id} caseNumber={visaCase.caseNumber} />
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
