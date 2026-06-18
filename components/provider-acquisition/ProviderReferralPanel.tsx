"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  fetchMyProviderReferrals,
  inviteProviderByEmail,
} from "@/lib/provider-acquisition/referral-actions";
import { PROVIDER_REFERRAL_REWARD_USD } from "@/lib/provider-acquisition/types";
import type { ProviderAcquisitionRole, ProviderReferralRow } from "@/lib/provider-acquisition/types";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

export function ProviderReferralPanel({ className = "" }: { className?: string }) {
  const [code, setCode] = useState("");
  const [referrals, setReferrals] = useState<ProviderReferralRow[]>([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProviderAcquisitionRole>("visa_agent");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    fetchMyProviderReferrals().then((result) => {
      if (!result.ok) return;
      setCode(result.code);
      setReferrals(result.referrals);
      setTotalRewards(result.totalRewards);
    });
  }, []);

  const link =
    typeof window !== "undefined" && code
      ? `${window.location.origin}/register?ref=${code}`
      : "";

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await inviteProviderByEmail({
        email: inviteEmail,
        providerRole: inviteRole,
      });
      if (!result.ok) {
        setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
        return;
      }
      setMessage("Invitation sent!");
      setInviteEmail("");
      const refreshed = await fetchMyProviderReferrals();
      if (refreshed.ok) setReferrals(refreshed.referrals);
    });
  }

  return (
    <div className={`card p-6 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gold">Provider referrals</p>
      <h3 className="mt-1 text-lg font-extrabold text-navy">Invite providers, earn ${PROVIDER_REFERRAL_REWARD_USD}</h3>
      <p className="mt-1 text-sm text-charcoal/55">
        Share your link. When a referred provider completes verification, you earn a reward.
      </p>

      {code && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input className="input flex-1 text-sm font-mono" readOnly value={link} />
          <button type="button" onClick={copyLink} className="btn-gold shrink-0 px-4 py-2.5 text-sm">
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}

      <form onSubmit={handleInvite} className="mt-4 space-y-3 border-t border-soft-200 pt-4">
        <p className="text-sm font-semibold text-navy">Invite by email</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            className="input flex-1 text-sm"
            placeholder="provider@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <select
            className="input text-sm"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as ProviderAcquisitionRole)}
          >
            <option value="visa_agent">Visa expert / agent</option>
            <option value="travel_agency">Travel agency</option>
            <option value="tour_guide">Tour guide</option>
            <option value="property_host">Property host</option>
          </select>
          <button type="submit" disabled={pending} className="btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-60">
            {pending ? "Sending…" : "Send invite"}
          </button>
        </div>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {message && <p className="mt-2 text-xs text-emerald-600">{message}</p>}

      <div className="mt-4 flex gap-4 text-sm">
        <span className="text-charcoal/55">
          Referrals: <strong className="text-navy">{referrals.length}</strong>
        </span>
        <span className="text-charcoal/55">
          Rewards: <strong className="text-gold">${totalRewards.toFixed(0)}</strong>
        </span>
      </div>

      {referrals.length > 0 && (
        <ul className="mt-3 max-h-40 overflow-y-auto space-y-1 text-xs">
          {referrals.slice(0, 8).map((r) => (
            <li key={r.id} className="flex justify-between gap-2 rounded-lg bg-soft px-3 py-2">
              <span className="truncate text-navy">{r.referred_email ?? "Provider"}</span>
              <span className="shrink-0 capitalize text-charcoal/50">{r.status}</span>
            </li>
          ))}
        </ul>
      )}

      <Link href="/referrals" className="mt-3 inline-block text-xs font-semibold text-blue hover:underline">
        Full referral program →
      </Link>
    </div>
  );
}
