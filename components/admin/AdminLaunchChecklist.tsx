"use client";

import Link from "next/link";
import type { LaunchChecklistReport } from "@/lib/launch-checklist";

const STATUS_STYLE: Record<string, string> = {
  pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-gold/10 text-gold border-gold/30",
  fail: "bg-red-50 text-red-700 border-red-200",
  info: "bg-soft text-charcoal/60 border-soft-200",
};

export function AdminLaunchChecklist({ report }: { report: LaunchChecklistReport }) {
  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Launch checklist</h1>
          <p className="mt-1 text-sm text-muted">
            Environment, integrations, and production readiness — updated {new Date(report.generatedAt).toLocaleString()}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-gold/30 bg-gold/5 px-5 py-3">
              <p className="text-xs font-bold uppercase text-gold">Launch readiness</p>
              <p className="text-3xl font-extrabold text-navy">{report.launchReadyScore}%</p>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="text-emerald-600 font-semibold">{report.summary.pass} pass</span>
              <span className="text-gold font-semibold">{report.summary.warn} warn</span>
              <span className="text-red-600 font-semibold">{report.summary.fail} fail</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-8 max-w-3xl space-y-8">
        <div className="card p-6">
          <h2 className="font-extrabold text-navy">Required production environment</h2>
          <p className="mt-1 text-sm text-muted">
            Secret values are never shown — only configured vs missing.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-200 text-left text-xs uppercase text-charcoal/45">
                  <th className="pb-2 pr-4 font-bold">Variable</th>
                  <th className="pb-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.requiredEnv.map((item) => (
                  <tr key={item.id} className="border-b border-soft-100 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-mono text-xs font-semibold text-navy">{item.envKey}</p>
                      <p className="mt-0.5 text-xs text-charcoal/55">{item.label}</p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                          item.configured
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "fail"
                              ? "bg-red-50 text-red-700"
                              : "bg-gold/10 text-gold"
                        }`}
                      >
                        {item.configured ? "Configured" : "Missing"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-extrabold text-navy">Full checklist</h2>
          {report.items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border px-5 py-4 ${STATUS_STYLE[item.status] ?? STATUS_STYLE.info}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-bold text-navy">{item.label}</p>
                <span className="text-xs font-bold uppercase">{item.status}</span>
              </div>
              <p className="mt-1 text-sm opacity-80">{item.detail}</p>
              {item.envKey && (
                <p className="mt-2 font-mono text-[10px] opacity-60">{item.envKey}</p>
              )}
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="font-extrabold text-navy">Deploy commands</h2>
          <p className="mt-1 text-sm text-muted">Run from project root before production launch.</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-navy p-4 text-xs text-white/90 leading-relaxed">
            {report.deployCommands.join("\n")}
          </pre>
        </div>

        <div className="card p-6">
          <h2 className="font-extrabold text-navy">Admin consoles</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              "/admin/bookings",
              "/admin/visa",
              "/admin/leads",
              "/admin/providers",
              "/admin/properties",
              "/admin/group-tours",
              "/admin/reviews",
              "/admin/community",
              "/admin/messages",
              "/admin/payments",
              "/admin/subscriptions",
              "/admin/users",
              "/admin/audit",
            ].map((href) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg bg-soft px-3 py-2 text-sm font-semibold text-navy hover:bg-navy/5"
              >
                {href.replace("/admin/", "")} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
