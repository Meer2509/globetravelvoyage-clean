"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  adminVerifyProvider,
  adminRejectVerification,
  adminRevokeVerification,
  adminSuspendProvider,
} from "@/lib/trust/verification-actions";
import { resolveFraudFlag } from "@/lib/trust/fraud-monitor";
import type { VerificationProfileRow, FraudFlagRow } from "@/lib/trust/types";
import type { VerificationLevel } from "@/lib/trust/types";

export function AdminVerificationConsole({
  queue,
  fraudFlags,
}: {
  queue: Array<VerificationProfileRow & { full_name: string; email: string }>;
  fraudFlags: FraudFlagRow[];
}) {
  const [items, setItems] = useState(queue);
  const [flags, setFlags] = useState(fraudFlags);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();

  function handleVerify(id: string, level: VerificationLevel) {
    setBusyId(id);
    startTransition(async () => {
      const result = await adminVerifyProvider({ profileId: id, level });
      setBusyId(null);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMessage(`Provider verified (${level}).`);
    });
  }

  function handleReject(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await adminRejectVerification(id, "Does not meet verification requirements");
      setBusyId(null);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMessage("Application rejected.");
    });
  }

  function handleSuspend(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await adminSuspendProvider(id, "Suspended by admin");
      setBusyId(null);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMessage("Provider suspended.");
    });
  }

  function handleRevoke(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await adminRevokeVerification(id, "Verification revoked");
      setBusyId(null);
      setMessage("Verification revoked.");
    });
  }

  function handleFlag(flagId: string, action: "dismiss" | "suspend") {
    startTransition(async () => {
      await resolveFraudFlag(flagId, action);
      setFlags((prev) => prev.filter((f) => f.id !== flagId));
      setMessage(action === "dismiss" ? "Flag dismissed." : "Flag actioned — provider suspended.");
    });
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Verification & trust moderation</h1>
          <p className="mt-1 text-sm text-muted">
            Review provider credentials, verify, suspend, and monitor fraud flags.
          </p>
        </div>
      </div>

      <div className="container-px py-8 space-y-8">
        {message && (
          <div className="rounded-xl border border-blue/20 bg-blue/5 px-4 py-3 text-sm text-navy">{message}</div>
        )}

        {flags.length > 0 && (
          <div className="card overflow-hidden">
            <div className="border-b border-soft-200 px-5 py-4">
              <h3 className="font-extrabold text-navy">Fraud flags ({flags.length})</h3>
            </div>
            <ul className="divide-y divide-soft-100">
              {flags.map((flag) => (
                <li key={flag.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                  <div>
                    <p className="font-semibold text-navy capitalize">{flag.flag_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-charcoal/50">Severity: {flag.severity} · User {flag.user_id.slice(0, 8)}…</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleFlag(flag.id, "dismiss")} className="text-xs font-semibold text-charcoal/55 hover:text-navy">
                      Dismiss
                    </button>
                    <button type="button" onClick={() => handleFlag(flag.id, "suspend")} className="text-xs font-semibold text-red-600 hover:underline">
                      Suspend
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 px-5 py-4">
            <h3 className="font-extrabold text-navy">Pending verification ({items.length})</h3>
          </div>
          {items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-charcoal/50">No pending verification requests.</p>
          ) : (
            <ul className="divide-y divide-soft-100">
              {items.map((item) => (
                <li key={item.id} className="space-y-3 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-navy">{item.full_name}</p>
                      <p className="text-sm text-charcoal/55">{item.email}</p>
                      <p className="mt-1 text-xs capitalize text-gold">
                        {item.provider_category.replace(/_/g, " ")} · {item.status}
                      </p>
                    </div>
                    <span className="text-xs text-charcoal/45">
                      Submitted {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "—"}
                    </span>
                  </div>

                  {item.website && <p className="text-xs text-blue">{item.website}</p>}
                  {item.verification_notes && (
                    <p className="rounded-xl bg-soft px-3 py-2 text-xs text-charcoal/65">{item.verification_notes}</p>
                  )}
                  {item.certifications.length > 0 && (
                    <p className="text-xs text-charcoal/55">Certs: {item.certifications.join(", ")}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => handleVerify(item.id, "verified")}
                      className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => handleVerify(item.id, "premium_verified")}
                      className="btn-gold px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Premium verify
                    </button>
                    <button type="button" disabled={busyId === item.id} onClick={() => handleReject(item.id)} className="btn-outline px-3 py-1.5 text-xs">
                      Reject
                    </button>
                    <button type="button" disabled={busyId === item.id} onClick={() => handleSuspend(item.id)} className="text-xs font-semibold text-red-600 px-2">
                      Suspend
                    </button>
                    <button type="button" disabled={busyId === item.id} onClick={() => handleRevoke(item.id)} className="text-xs font-semibold text-charcoal/45 px-2">
                      Revoke
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
