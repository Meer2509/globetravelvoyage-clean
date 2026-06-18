"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { GrowthDashboardReport, FunnelStage } from "@/lib/growth/types";
import {
  sendAbandonedInquiryRecovery,
  dismissAbandonedInquiry,
} from "@/lib/growth/abandoned-inquiry-actions";

function StatTile({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-soft-200 bg-white p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-bold uppercase tracking-widest text-charcoal/45">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-navy">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-charcoal/50">{sub}</p>}
    </div>
  );
}

function FunnelPanel({ title, stages }: { title: string; stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className="card p-5">
      <h3 className="font-extrabold text-navy">{title}</h3>
      <ul className="mt-4 space-y-3">
        {stages.map((stage, i) => (
          <li key={stage.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-navy">{stage.label}</span>
              <span className="text-charcoal/60">
                {stage.count.toLocaleString()}
                {stage.rateFromPrevious != null && (
                  <span className="ml-2 text-xs text-gold">({stage.rateFromPrevious}%)</span>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-soft">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-navy transition-all"
                style={{ width: `${Math.max(4, (stage.count / max) * 100)}%` }}
              />
            </div>
            {i < stages.length - 1 && (
              <p className="mt-1 text-[10px] text-charcoal/40">↓ conversion step</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminGrowthDashboard({
  initialReport,
  fetchError,
}: {
  initialReport: GrowthDashboardReport | null;
  fetchError?: string;
}) {
  const [report] = useState(initialReport);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();

  function handleRecovery(id: string) {
    setPendingId(id);
    setMessage("");
    startTransition(async () => {
      const result = await sendAbandonedInquiryRecovery(id);
      setPendingId(null);
      setMessage(result.ok ? "Recovery email sent." : result.error);
    });
  }

  function handleDismiss(id: string) {
    setPendingId(id);
    setMessage("");
    startTransition(async () => {
      const result = await dismissAbandonedInquiry(id);
      setPendingId(null);
      setMessage(result.ok ? "Inquiry dismissed." : result.error);
    });
  }

  if (fetchError || !report) {
    return (
      <div className="min-h-screen bg-soft p-8">
        <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
          ← Command center
        </Link>
        <p className="mt-4 text-red-600">{fetchError ?? "Unable to load growth report."}</p>
      </div>
    );
  }

  const { totals, funnels, sources, abandonedInquiries } = report;

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Growth & conversion</h1>
          <p className="mt-1 text-sm text-muted">
            Signups, inquiries, funnels, and source attribution — last {report.periodDays} days · updated{" "}
            {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="container-px py-8 space-y-8">
        {message && (
          <div className="rounded-xl border border-blue/20 bg-blue/5 px-4 py-3 text-sm text-navy">{message}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <StatTile label="Signups" value={totals.signups} />
          <StatTile label="Concierge usage" value={totals.conciergeUsage} />
          <StatTile label="Visa requests" value={totals.visaRequests} />
          <StatTile label="Flight requests" value={totals.flightRequests} />
          <StatTile label="Property inquiries" value={totals.propertyInquiries} />
          <StatTile label="Agent inquiries" value={totals.agentInquiries} />
          <StatTile label="Tour requests" value={totals.tourRequests} />
          <StatTile label="Email captures" value={totals.emailCaptures} />
          <StatTile label="Abandoned drafts" value={totals.abandonedDrafts} sub="Awaiting recovery" />
          <StatTile label="Recoveries sent" value={totals.recoveriesSent} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <FunnelPanel title="Visitor → signup" stages={funnels.visitorToSignup} />
          <FunnelPanel title="Signup → inquiry" stages={funnels.signupToInquiry} />
          <FunnelPanel title="Inquiry breakdown" stages={funnels.inquiryToConversion} />
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 px-5 py-4">
            <h3 className="font-extrabold text-navy">Source attribution</h3>
            <p className="mt-0.5 text-xs text-charcoal/50">UTM sessions mapped to signups and inquiry conversions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-200 bg-soft/50 text-left text-xs uppercase text-charcoal/45">
                  <th className="px-5 py-3 font-bold">Source</th>
                  <th className="px-5 py-3 font-bold">Medium</th>
                  <th className="px-5 py-3 font-bold">Campaign</th>
                  <th className="px-5 py-3 font-bold">Sessions</th>
                  <th className="px-5 py-3 font-bold">Signups</th>
                  <th className="px-5 py-3 font-bold">Conversions</th>
                  <th className="px-5 py-3 font-bold">Rate</th>
                </tr>
              </thead>
              <tbody>
                {sources.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-charcoal/50">
                      No attributed sessions yet — UTM links will populate this table.
                    </td>
                  </tr>
                ) : (
                  sources.map((row) => (
                    <tr key={`${row.source}-${row.medium}-${row.campaign}`} className="border-b border-soft-100 last:border-0">
                      <td className="px-5 py-3 font-semibold text-navy">{row.source}</td>
                      <td className="px-5 py-3 text-charcoal/65">{row.medium}</td>
                      <td className="px-5 py-3 text-charcoal/65">{row.campaign}</td>
                      <td className="px-5 py-3">{row.sessions}</td>
                      <td className="px-5 py-3">{row.signups}</td>
                      <td className="px-5 py-3">{row.conversions}</td>
                      <td className="px-5 py-3 font-semibold text-gold">{row.conversionRate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 px-5 py-4">
            <h3 className="font-extrabold text-navy">Abandoned inquiries</h3>
            <p className="mt-0.5 text-xs text-charcoal/50">Drafts with email — send recovery or dismiss</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-200 bg-soft/50 text-left text-xs uppercase text-charcoal/45">
                  <th className="px-5 py-3 font-bold">Type</th>
                  <th className="px-5 py-3 font-bold">Email</th>
                  <th className="px-5 py-3 font-bold">Source</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Created</th>
                  <th className="px-5 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {abandonedInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-charcoal/50">
                      No abandoned drafts in this period.
                    </td>
                  </tr>
                ) : (
                  abandonedInquiries.map((row) => (
                    <tr key={row.id} className="border-b border-soft-100 last:border-0">
                      <td className="px-5 py-3 capitalize text-navy">{row.inquiry_type.replace(/_/g, " ")}</td>
                      <td className="px-5 py-3 text-charcoal/65">{row.email ?? "—"}</td>
                      <td className="px-5 py-3 text-xs text-charcoal/50">{row.source_path ?? row.utm_source ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold capitalize text-gold">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-charcoal/50">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {row.status === "draft" && (
                            <button
                              type="button"
                              disabled={pendingId === row.id}
                              onClick={() => handleRecovery(row.id)}
                              className="text-xs font-semibold text-blue hover:underline disabled:opacity-50"
                            >
                              Send recovery
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={pendingId === row.id}
                            onClick={() => handleDismiss(row.id)}
                            className="text-xs font-semibold text-charcoal/45 hover:text-red-600 disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
