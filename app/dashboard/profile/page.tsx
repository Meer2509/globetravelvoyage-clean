"use client";

import { useEffect, useState } from "react";
import { defer } from "@/lib/defer-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DatabaseStatusBanner } from "@/components/DatabaseStatusBanner";
import { ProgressBar } from "@/components/DashboardLayout";
import { getRoleLabel } from "@/lib/auth";
import { checkDatabaseHealth, type DatabaseHealthResult } from "@/lib/supabase/database-health";
import { fetchDashboardUser } from "@/lib/supabase/queries";
import { updateUserProfile } from "@/lib/supabase/profile-actions";
import { joinCommaList } from "@/lib/supabase/profile-utils";

export default function DashboardProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [health, setHealth] = useState<DatabaseHealthResult | null>(null);
  const [formBlocked, setFormBlocked] = useState(false);
  const [role, setRole] = useState<string>("customer");
  const [completion, setCompletion] = useState(0);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  async function loadProfile() {
    const [result, healthResult] = await Promise.all([fetchDashboardUser(), checkDatabaseHealth()]);
    setHealth(healthResult);
    setFormBlocked(!healthResult.tables.profiles);
    setLoading(false);
    if (!result.ok) return;

    const { profile, role: userRole, visaExpert, completion: pct } = result;
    setRole(userRole);
    setCompletion(pct);
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setCountry(profile.country ?? "");
    setCity(profile.city ?? "");
    setCompanyName(profile.company_name ?? "");
    setBusinessType(profile.business_type ?? "");
    setBio(profile.bio ?? visaExpert?.bio ?? "");
    setLanguages(joinCommaList(visaExpert?.languages));
    setSpecializations(joinCommaList(visaExpert?.specializations));
    setYearsExperience(visaExpert?.years_experience?.toString() ?? "");
  }

  useEffect(() => {
    defer(() => void loadProfile());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    const result = await updateUserProfile({
      fullName,
      phone,
      country,
      city,
      companyName,
      businessType,
      bio,
      languages,
      specializations,
      yearsExperience,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    await loadProfile();
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-blue" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          <p className="mt-3 text-sm text-charcoal/55">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px flex items-center justify-between py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Account</p>
            <h1 className="text-xl font-extrabold text-navy">Edit profile</h1>
          </div>
          <Link href={`/dashboard/${role === "visa_agent" ? "agent" : role === "travel_agency" ? "agency" : role === "tour_guide" ? "guide" : role === "property_host" ? "host" : role === "admin" ? "admin" : "customer"}`} className="btn-outline px-4 py-2 text-sm">
            ← Back to dashboard
          </Link>
        </div>
      </div>

      <div className="container-px py-8 max-w-2xl">
        <DatabaseStatusBanner health={health} />

        {!formBlocked && (
          <div className="card p-6">
            <div className="mb-6">
              <p className="text-sm text-charcoal/55">
                Role: <span className="font-bold text-navy">{getRoleLabel(role)}</span>
              </p>
              <div className="mt-3">
                <ProgressBar label={`Profile completion (${completion}%)`} pct={completion} color="blue" />
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                ✓ Profile saved successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">City</label>
                  <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="label">Company / agency name</label>
                  <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Business type</label>
                <input className="input" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g. travel_agency, visa_agent" />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea className="input min-h-24" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              {role === "visa_agent" && (
                <>
                  <div>
                    <label className="label">Languages (comma-separated)</label>
                    <input className="input" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Urdu, Arabic" />
                  </div>
                  <div>
                    <label className="label">Specializations (comma-separated)</label>
                    <input className="input" value={specializations} onChange={(e) => setSpecializations(e.target.value)} placeholder="USA B1/B2, UK Visitor, Schengen" />
                  </div>
                  <p className="text-sm text-charcoal/55">
                    Manage your service packages and pricing in the{" "}
                    <Link href="/dashboard/agent" className="font-semibold text-blue hover:underline">
                      Services &amp; Pricing
                    </Link>{" "}
                    tab on your dashboard.
                  </p>
                  <div>
                    <label className="label">Years of experience</label>
                    <input className="input" type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
                  </div>
                </>
              )}

              <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 disabled:opacity-70">
                {saving ? "Saving…" : "Save profile"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
