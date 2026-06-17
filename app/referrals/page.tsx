"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCatalog } from "@/lib/catalog/context";
import { Icon } from "@/components/Icon";
import { Disclaimer } from "@/components/Disclaimer";
import { areReferralRewardsLive, REFERRAL_LAUNCHING_SOON } from "@/lib/launch-trust";
import { submitReferralSignup } from "@/lib/supabase/actions";
import { FORM_SUBMIT_SUCCESS_MESSAGE, FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

type CommissionStatus = "pending" | "approved" | "paid";

interface Referral {
  id: string;
  name: string;
  email: string;
  date: string;
  action: string;
  amount: number;
  status: CommissionStatus;
}

const STATUS_LABELS: Record<CommissionStatus, { label: string; dot: string; badge: string }> = {
  pending:  { label: "Pending",  dot: "bg-gold",       badge: "bg-gold/10 text-gold"         },
  approved: { label: "Approved", dot: "bg-blue",       badge: "bg-blue/10 text-blue"         },
  paid:     { label: "Paid",     dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-charcoal/45">{sub}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const { referralTiers, commissionRates } = useCatalog();
  const [copied, setCopied]           = useState(false);
  const [activeTab, setActiveTab]     = useState<"all" | CommissionStatus>("all");
  const [referralHistory] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupDone, setSignupDone] = useState(false);

  const referralLink = useMemo(() => {
    if (!referralCode) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/register?ref=${referralCode}`;
  }, [referralCode]);

  const totalEarned   = referralHistory.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const totalApproved = referralHistory.filter((r) => r.status === "approved").reduce((s, r) => s + r.amount, 0);
  const totalPending  = referralHistory.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);

    const result = await submitReferralSignup({ name: signupName, email: signupEmail });
    setSignupLoading(false);

    if (!result.ok) {
      setSignupError(result.error ?? FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }

    if (result.data?.code) setReferralCode(result.data.code);
    setSignupDone(true);
  }

  function handleCopy() {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const filtered = activeTab === "all" ? referralHistory : referralHistory.filter((r) => r.status === activeTab);

  const TABS: { key: "all" | CommissionStatus; label: string; count: number }[] = [
    { key: "all",      label: "All",      count: referralHistory.length },
    { key: "pending",  label: "Pending",  count: referralHistory.filter((r) => r.status === "pending").length  },
    { key: "approved", label: "Approved", count: referralHistory.filter((r) => r.status === "approved").length },
    { key: "paid",     label: "Paid",     count: referralHistory.filter((r) => r.status === "paid").length     },
  ];

  return (
    <>
      {/* ── Page header ── */}
      <div className="bg-hero-gradient py-14 sm:py-18">
        <div className="container-px">
          <Link href="/" className="mb-4 flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors">
            <Icon name="check" className="h-3 w-3 rotate-180" /> Home
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow-white mb-3">
                {areReferralRewardsLive() ? "Earn with Globe Travel Voyage" : REFERRAL_LAUNCHING_SOON}
              </span>
              <h1 className="h-section text-white">
                {areReferralRewardsLive() ? "Referral program & commissions" : "Referral program preview"}
              </h1>
              <p className="mt-2 text-white/60 text-sm max-w-xl">
                {areReferralRewardsLive()
                  ? "Share your unique link. Earn commission when friends and partners sign up and take qualifying actions."
                  : "Referral tracking is in development. Sign up to reserve your place — rewards open after member onboarding is complete."}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/pricing" className="btn-outline-white text-sm py-2 px-4">
                View pricing
              </Link>
              <Link href="/dashboard/customer" className="btn-gold text-sm py-2 px-4">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-8 space-y-6">

        {!areReferralRewardsLive() && (
          <div className="rounded-2xl border border-gold/25 bg-gold/5 px-5 py-4 text-sm text-muted">
            <p className="font-bold text-navy">{REFERRAL_LAUNCHING_SOON}</p>
            <p className="mt-1">Commission payouts are not live yet. You can still sign up to receive your referral code when verified payouts open.</p>
          </div>
        )}

        {/* ── Referral signup ── */}
        {!signupDone ? (
          <div className="card overflow-hidden">
            <div className="border-b border-soft-200 bg-navy/3 px-5 py-4">
              <h2 className="font-extrabold text-navy">Join the referral program</h2>
              <p className="mt-0.5 text-xs text-charcoal/50">Get your unique code and start earning commissions today.</p>
            </div>
            <form onSubmit={handleSignup} className="p-5 space-y-4 max-w-lg">
              <div>
                <label className="label">Full name</label>
                <input className="input" required value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              {signupError && <p className="text-sm text-red-600">{signupError}</p>}
              <button type="submit" disabled={signupLoading} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
                {signupLoading ? "Creating your code…" : "Get my referral code"}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p>{FORM_SUBMIT_SUCCESS_MESSAGE}</p>
            {referralCode && (
              <p className="mt-2">
                Your referral code: <strong className="font-mono">{referralCode}</strong> — share the link below.
              </p>
            )}
          </div>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total referrals"    value={String(referralHistory.length)} sub="all time"              color="text-navy"         />
          <StatCard label="Pending"            value={`$${totalPending.toFixed(2)}`}  sub="under review"          color="text-gold"         />
          <StatCard label="Approved"           value={`$${totalApproved.toFixed(2)}`} sub="ready to request"      color="text-blue"         />
          <StatCard label="Total paid"         value={`$${totalEarned.toFixed(2)}`}   sub="paid to your account"  color="text-emerald-600"  />
        </div>

        {/* ── Referral link card ── */}
        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 bg-navy/3 px-5 py-4">
            <h2 className="font-extrabold text-navy">Your unique referral link</h2>
            <p className="mt-0.5 text-xs text-charcoal/50">Share this link anywhere — email, social media, WhatsApp, etc.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <div className="flex items-center gap-3 rounded-xl border border-soft-200 bg-soft px-4 py-3">
                  <span className="text-lg">🔗</span>
                  <span className="flex-1 truncate font-mono text-sm text-navy">{referralLink}</span>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all shrink-0 ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-navy text-white hover:bg-navy/80"
                }`}
              >
                {copied ? (
                  <>✓ Copied!</>
                ) : (
                  <>📋 Copy link</>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 rounded-lg bg-soft-100 px-3 py-1.5 text-xs text-charcoal/60">
                🔑 Code: <strong className="text-navy font-mono">{referralCode}</strong>
              </span>
              <span className="flex items-center gap-2 rounded-lg bg-blue/5 px-3 py-1.5 text-xs text-blue">
                📊 {referralHistory.length} referrals total
              </span>
              <span className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                💰 ${(totalEarned + totalApproved + totalPending).toFixed(2)} lifetime earnings
              </span>
            </div>

            {/* Share buttons */}
            <div className="border-t border-soft-200 pt-3">
              <p className="mb-2 text-xs font-semibold text-charcoal/40 uppercase tracking-wide">Share via</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "WhatsApp", emoji: "💬", color: "bg-green-500 text-white hover:bg-green-600" },
                  { label: "Email",    emoji: "✉️",  color: "bg-blue text-white hover:bg-blue-700"      },
                  { label: "Copy",     emoji: "📋",  color: "bg-soft-200 text-navy hover:bg-soft-300"    },
                  { label: "X / Twitter", emoji: "𝕏", color: "bg-black text-white hover:bg-gray-800"   },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${s.color}`}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Commissions table ── */}
        <div className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-soft-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-extrabold text-navy">Commission history</h2>
              <p className="text-xs text-charcoal/50">{referralHistory.length} referrals tracked</p>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-xl bg-soft px-4 py-2 text-xs font-semibold text-charcoal/60">
                {areReferralRewardsLive()
                  ? "Commissions track automatically when referrals convert"
                  : "Referral rewards — early member onboarding — commissions track automatically when payouts open"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-soft-200 px-5 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "border-blue text-blue"
                    : "border-transparent text-charcoal/40 hover:text-navy"
                }`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.key ? "bg-blue/10 text-blue" : "bg-soft text-charcoal/40"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-soft-200 bg-soft/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Referral</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Action</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Date</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Commission</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-200">
                {filtered.map((r) => {
                  const st = STATUS_LABELS[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-soft/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-navy">{r.name}</p>
                        <p className="text-xs text-charcoal/40">{r.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-charcoal/65">{r.action}</td>
                      <td className="px-4 py-3.5 text-charcoal/50 text-xs">{r.date}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-navy">${r.amount.toFixed(2)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold text-navy">No {activeTab} commissions yet</p>
              <p className="mt-1 text-xs text-charcoal/45">Share your referral link to start earning.</p>
            </div>
          )}

          <div className="border-t border-soft-200 px-5 py-3 flex items-center justify-between text-xs text-charcoal/40">
            <span>Showing {filtered.length} of {referralHistory.length} referrals</span>
            <span>Commissions appear here when your referrals complete qualifying actions</span>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🔗", step: "1", title: "Share your link", text: "Copy your unique referral link and share it with travelers, agents, or agencies." },
            { icon: "👤", step: "2", title: "They sign up",    text: "Your referrals register on Globe Travel Voyage using your link or code." },
            { icon: "💰", step: "3", title: "You earn",        text: "Commission is tracked, approved within 7 days, and paid to your account." },
          ].map((s) => (
            <div key={s.step} className="card p-5 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/5 text-3xl">
                {s.icon}
              </span>
              <span className="mt-3 block text-xs font-bold uppercase tracking-widest text-charcoal/35">Step {s.step}</span>
              <h3 className="mt-1 font-extrabold text-navy">{s.title}</h3>
              <p className="mt-1 text-xs text-charcoal/55 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        {/* ── Commission rates ── */}
        <div className="card overflow-hidden">
          <div className="border-b border-soft-200 bg-soft/50 px-5 py-4">
            <h2 className="font-extrabold text-navy">Commission rates</h2>
            <p className="mt-0.5 text-xs text-charcoal/50">Earn on every qualifying action your referrals take</p>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-soft-200">
            {commissionRates.map((r, i) => (
              <div
                key={r.service}
                className={`flex items-center gap-4 p-4 ${i < commissionRates.length - 1 && i % 2 === 0 ? "sm:border-b sm:border-soft-200" : ""}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-xl">
                  {r.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy text-sm">{r.service}</p>
                  <p className="text-xs text-charcoal/45">{r.condition}</p>
                </div>
                <span className="font-extrabold text-blue text-lg">{r.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tiers ── */}
        <div>
          <h2 className="text-xl font-extrabold text-navy mb-4">Referral tiers — the more you refer, the more you earn</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {referralTiers.map((t) => (
              <div
                key={t.name}
                className={`card flex flex-col p-6 ${t.highlight ? "ring-2 ring-blue shadow-[var(--shadow-glow)]" : ""}`}
              >
                {t.highlight && (
                  <span className="mb-2 w-fit rounded-full bg-blue px-3 py-0.5 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-extrabold text-navy">{t.name}</h3>
                <p className="text-sm text-charcoal/50">{t.referrals}</p>
                <p className="mt-3 text-2xl font-extrabold text-blue">{t.commission}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-charcoal/65">
                      <span className="mt-0.5 text-blue">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Disclaimer>
          Referral commissions are credits subject to full program terms, identity verification, and minimum payout thresholds ($25 USD). Commission rates shown are illustrative and may change without notice. Commissions are reviewed for fraud before approval. This is not investment or income advice. Globe Travel Voyage reserves the right to suspend accounts suspected of referral abuse.
        </Disclaimer>
      </div>
    </>
  );
}
