"use client";

import Link from "next/link";
import { Panel } from "@/components/DashboardLayout";
import { VisaCaseSummaryCard } from "@/components/VisaCaseSummaryCard";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import type { ActiveServiceRow } from "@/lib/supabase/payment-queries";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";
import { visaCaseWorkspacePath } from "@/lib/visa-case-routes";

export function CustomerActiveServices({
  services,
  visaCase,
}: {
  services: ActiveServiceRow[];
  visaCase: VisaCaseData | null;
}) {
  if (services.length === 0 && !visaCase) {
    return (
      <Panel title="My active services" subtitle="Premium services unlocked after payment">
        <div className="py-8 text-center">
          <p className="text-3xl mb-3">✨</p>
          <p className="font-bold text-navy">No active services yet</p>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            When you purchase a premium service, it will appear here with next steps.
          </p>
          <Link href="/services#premium" className="btn-primary mt-5 inline-flex px-5 py-2.5 text-sm">
            Browse premium services
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <Panel title="My active services" subtitle="Unlocked after successful payment">
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-soft-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-semibold text-navy">{s.serviceName}</p>
                <p className="text-xs text-muted mt-0.5">
                  {formatPaymentDate(s.purchasedAt)}
                  {s.amount != null ? ` · ${formatPaymentAmount(s.amount, s.currency)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 capitalize">
                  {s.status}
                </span>
                {s.isVisa && visaCase && (
                  <Link
                    href={visaCaseWorkspacePath(visaCase.id)}
                    className="text-xs font-semibold text-blue hover:underline"
                  >
                    Open case →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {visaCase && (
        <>
          <VisaCaseSummaryCard visaCase={visaCase} />
          <Panel title="Next steps" subtitle={`Case ${visaCase.caseNumber}`}>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                <span className="text-navy">
                  <strong>Payment confirmed</strong> — {paymentServiceLabel(visaCase.serviceProductKey, visaCase.serviceName)}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">2</span>
                <span className="text-navy"><strong>Upload required documents</strong> — use your case workspace checklist</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-bold text-muted">3</span>
                <span className="text-muted">Expert review begins after documents are submitted. Visa approval is never guaranteed.</span>
              </li>
            </ol>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={visaCaseWorkspacePath(visaCase.id)} className="btn-primary px-5 py-2.5 text-sm">
                Open visa case
              </Link>
              <Link
                href={visaCaseWorkspacePath(visaCase.id, "documents")}
                className="btn-gold px-5 py-2.5 text-sm"
              >
                Upload documents
              </Link>
              <Link href="/dashboard/customer?tab=support" className="btn-outline px-5 py-2.5 text-sm">
                Message support
              </Link>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
