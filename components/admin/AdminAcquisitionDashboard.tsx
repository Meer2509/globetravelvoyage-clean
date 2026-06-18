"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { AcquisitionDashboardReport } from "@/lib/provider-acquisition/types";
import { sendIncompleteOnboardingRecoveryBatch } from "@/lib/provider-acquisition/emails";

export function AdminAcquisitionDashboard({
  initialReport,
  fetchError,
}: {
  initialReport: AcquisitionDashboardReport | null;
  fetchError?: string;
}) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (fetchError || !initialReport) {
    return (
      <div className="min-h-screen bg-soft p-8">
        <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
          ← Command center
        </Link>
        <p className="mt-4 text-red-600">{fetchError ?? "Unable to load acquisition report."}</p>
      </div>
    );
  }

  const report = initialReport;

  function handleRecoveryBatch() {
    setMessage("");
    startTransition(async () => {
      const sent = await sendIncompleteOnboardingRecoveryBatch(25);
      setMessage(`Sent ${sent} onboarding recovery email(s).`);
    });
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Provider acquisition</h1>
          <p className="mt-1 text-sm text-muted">
            New providers, approvals, referrers, and conversion — last {report.periodDays} days
          </p>
        </div>
      </div>

      <div className="container-px py-8 space-y-8">
        {message && (
          <div className="rounded-xl border border-blue/20 bg-blue/5 px-4 py-3 text-sm text-navy">{message}</div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/providers" className="btn-outline px-4 py-2 text-sm">
            Verification queue
          </Link>
          <Link href="/providers" className="btn-outline px-4 py-2 text-sm">
            Provider landing pages
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={handleRecoveryBatch}
            className="btn-gold px-4 py-2 text-sm disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send onboarding recovery emails"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <p className="text-xs font-bold uppercase text-charcoal/45">Added this week</p>
            <p className="mt-1 text-3xl font-extrabold text-navy">{report.providersAddedThisWeek}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold uppercase text-charcoal/45">Pending approvals</p>
            <p className="mt-1 text-3xl font-extrabold text-gold">{report.pendingApprovals}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold uppercase text-charcoal/45">Landing → signup</p>
            <p className="mt-1 text-3xl font-extrabold text-navy">{report.conversionRates.landingToSignup}%</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold uppercase text-charcoal/45">Onboarding → verified</p>
            <p className="mt-1 text-3xl font-extrabold text-navy">{report.conversionRates.onboardingToVerified}%</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="font-extrabold text-navy">Providers by role</h3>
            <ul className="mt-4 space-y-2">
              {report.byRole.map((row) => (
                <li key={row.role} className="flex justify-between rounded-xl bg-soft px-4 py-3 text-sm">
                  <span className="capitalize text-navy">{row.role.replace(/_/g, " ")}</span>
                  <span className="text-charcoal/55">
                    {row.count} new · <span className="text-gold">{row.pending} pending</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="font-extrabold text-navy">Top referrers</h3>
            {report.topReferrers.length === 0 ? (
              <p className="mt-4 text-sm text-charcoal/50">No provider referrals yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {report.topReferrers.map((r) => (
                  <li key={r.userId} className="flex justify-between rounded-xl bg-soft px-4 py-3 text-sm">
                    <span className="font-semibold text-navy">{r.name}</span>
                    <span className="text-charcoal/55">
                      {r.referrals} refs · ${r.rewardsUsd.toFixed(0)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 px-5 py-4">
            <h3 className="font-extrabold text-navy">Recent provider referrals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-200 bg-soft/50 text-left text-xs uppercase text-charcoal/45">
                  <th className="px-5 py-3 font-bold">Email</th>
                  <th className="px-5 py-3 font-bold">Role</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Reward</th>
                  <th className="px-5 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {report.recentReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-charcoal/50">
                      No referrals recorded yet.
                    </td>
                  </tr>
                ) : (
                  report.recentReferrals.map((row) => (
                    <tr key={row.id} className="border-b border-soft-100 last:border-0">
                      <td className="px-5 py-3 text-navy">{row.referred_email ?? "—"}</td>
                      <td className="px-5 py-3 capitalize text-charcoal/65">{row.provider_role.replace(/_/g, " ")}</td>
                      <td className="px-5 py-3 capitalize text-gold">{row.status}</td>
                      <td className="px-5 py-3">${Number(row.reward_usd).toFixed(0)}</td>
                      <td className="px-5 py-3 text-xs text-charcoal/50">
                        {new Date(row.created_at).toLocaleDateString()}
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
