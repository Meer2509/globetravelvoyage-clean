"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PROVIDER_CATEGORIES, type ProviderCategory, type VerificationProfileRow } from "@/lib/trust/types";
import { saveVerificationProfile } from "@/lib/trust/verification-actions";
import { TrustScoreBadge } from "@/components/trust/TrustScoreBadge";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-soft text-charcoal/55",
  pending: "bg-gold/10 text-gold",
  under_review: "bg-blue/10 text-blue",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  suspended: "bg-red-50 text-red-700",
  revoked: "bg-charcoal/10 text-charcoal/55",
};

export function ProviderVerificationCenter({
  initialProfiles,
  trustScore,
}: {
  initialProfiles: VerificationProfileRow[];
  trustScore: number | null;
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [category, setCategory] = useState<ProviderCategory>("travel_agent");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [certifications, setCertifications] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const existing = profiles.find((p) => p.provider_category === category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await saveVerificationProfile({
        providerCategory: category,
        website,
        verificationNotes: notes,
        socialLinks: { linkedin, instagram },
        certifications: certifications.split(",").map((s) => s.trim()).filter(Boolean),
      });
      if (!result.ok) {
        setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
        return;
      }
      setMessage("Verification submitted for admin review.");
      const refreshed = await import("@/lib/trust/verification-actions").then((m) =>
        m.fetchMyVerificationProfiles()
      );
      if (refreshed.ok) setProfiles(refreshed.profiles);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Verification Center</h1>
          <p className="mt-1 text-sm text-charcoal/55">
            Submit credentials to earn verified status and boost your trust score.
          </p>
        </div>
        {trustScore != null && (
          <TrustScoreBadge score={trustScore} tier={trustScore >= 85 ? "elite" : trustScore >= 70 ? "verified" : trustScore >= 40 ? "basic" : "none"} />
        )}
      </div>

      {profiles.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {profiles.map((p) => {
            const cat = PROVIDER_CATEGORIES.find((c) => c.key === p.provider_category);
            return (
              <div key={p.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-navy">{cat?.emoji} {cat?.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLE[p.status] ?? ""}`}>
                    {p.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-charcoal/55 capitalize">
                  Level: {p.verification_level.replace("_", " ")}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <h2 className="font-extrabold text-navy">
          {existing ? "Update verification" : "Submit verification"}
        </h2>

        <div>
          <label className="label">Provider type</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value as ProviderCategory)}>
            {PROVIDER_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Website</label>
          <input className="input" type="url" placeholder="https://yourbusiness.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">LinkedIn</label>
            <input className="input" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input className="input" placeholder="https://instagram.com/..." value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Certifications (comma-separated)</label>
          <input className="input" placeholder="IATA, ASTA, Visa Specialist..." value={certifications} onChange={(e) => setCertifications(e.target.value)} />
        </div>

        <div>
          <label className="label">Notes for reviewers</label>
          <textarea className="input min-h-24" placeholder="License numbers, years of experience, references..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <p className="text-xs text-charcoal/50">
          Identity documents and business licenses are reviewed manually. Email {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@globetravelvoyage.com"} to submit files securely.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <button type="submit" disabled={pending} className="btn-primary px-6 py-3 text-sm disabled:opacity-60">
          {pending ? "Submitting…" : "Submit for verification"}
        </button>
      </form>

      <Link href="/dashboard" className="text-sm font-semibold text-blue hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
