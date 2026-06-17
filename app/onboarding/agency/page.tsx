"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, StepProgress } from "@/components/AuthLayout";
import { FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";
import { completeAgencyOnboarding } from "@/lib/supabase/onboarding-actions";

const STEPS = ["Business Info", "Services", "Verification", "Done"];

const serviceTypes = [
  "✈️ Flight Tickets", "🏨 Hotel Bookings", "🧳 Tour Packages", "🚢 Cruise Bookings",
  "🚗 Car Rentals", "🎫 Attraction Tickets", "🏖️ Vacation Packages", "👔 Visa Assistance",
  "🗺️ Custom Itineraries", "🌍 Group Tours",
];

export default function AgencyOnboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    agencyName: "",
    website: "",
    city: "",
    country: "",
    foundedYear: "",
    teamSize: "",
    description: "",
    selectedServices: [] as string[],
    destinations: "",
    annualBookings: "",
    socialMedia: { instagram: "", facebook: "", linkedin: "" },
    licenseNumber: "",
    registrationCountry: "",
  });

  function toggleService(s: string) {
    setData((p) => ({
      ...p,
      selectedServices: p.selectedServices.includes(s)
        ? p.selectedServices.filter((x) => x !== s)
        : [...p.selectedServices, s],
    }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const result = await completeAgencyOnboarding({
        agencyName: data.agencyName,
        website: data.website,
        city: data.city,
        country: data.country,
        foundedYear: data.foundedYear,
        teamSize: data.teamSize,
        description: data.description,
        selectedServices: data.selectedServices,
        destinations: data.destinations,
        annualBookings: data.annualBookings,
        socialMedia: data.socialMedia,
        licenseNumber: data.licenseNumber,
        registrationCountry: data.registrationCountry,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Travel Agency"
      headline="List your agency on the marketplace"
      subline="Join our verified agency marketplace and connect with travelers as the platform launches."
      showStats={false}
    >
      <div>
        <StepProgress steps={STEPS} current={step} />

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Business information</h2>
              <p className="mt-1 text-sm text-charcoal/55">Tell us about your travel agency.</p>
            </div>

            <div>
              <label className="label">Agency name</label>
              <input className="input" placeholder="e.g. Horizon Travel Group" value={data.agencyName} onChange={(e) => setData((p) => ({ ...p, agencyName: e.target.value }))} />
            </div>

            <div>
              <label className="label">Website (optional)</label>
              <input type="url" className="input" placeholder="https://yoursite.com" value={data.website} onChange={(e) => setData((p) => ({ ...p, website: e.target.value }))} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="e.g. Dubai" value={data.city} onChange={(e) => setData((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" value={data.country} onChange={(e) => setData((p) => ({ ...p, country: e.target.value }))}>
                  <option value="">Select country</option>
                  <option>🇦🇪 UAE</option>
                  <option>🇵🇰 Pakistan</option>
                  <option>🇸🇦 Saudi Arabia</option>
                  <option>🇮🇳 India</option>
                  <option>🇬🇧 UK</option>
                  <option>🇺🇸 USA</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Year founded</label>
                <input type="number" className="input" placeholder="e.g. 2010" min="1950" max="2026" value={data.foundedYear} onChange={(e) => setData((p) => ({ ...p, foundedYear: e.target.value }))} />
              </div>
              <div>
                <label className="label">Team size</label>
                <select className="input" value={data.teamSize} onChange={(e) => setData((p) => ({ ...p, teamSize: e.target.value }))}>
                  <option value="">Select size</option>
                  <option>Solo / 1 person</option>
                  <option>2–5 people</option>
                  <option>6–20 people</option>
                  <option>21–50 people</option>
                  <option>50+ people</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Agency description</label>
              <textarea
                className="input min-h-[90px] resize-none"
                placeholder="What makes your agency special? Who do you serve? Key destinations?"
                value={data.description}
                onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <button onClick={() => setStep(1)} className="btn-primary w-full py-3.5">Continue →</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Services & specialization</h2>
              <p className="mt-1 text-sm text-charcoal/55">What does your agency offer?</p>
            </div>

            <div>
              <label className="label">Services you offer</label>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleService(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.selectedServices.includes(s) ? "border-blue bg-blue/8 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Top destinations you specialize in</label>
              <input className="input" placeholder="e.g. UAE, Turkey, Thailand, UK, USA" value={data.destinations} onChange={(e) => setData((p) => ({ ...p, destinations: e.target.value }))} />
              <p className="mt-1 text-[11px] text-charcoal/40">Separate with commas</p>
            </div>

            <div>
              <label className="label">Annual bookings volume</label>
              <select className="input" value={data.annualBookings} onChange={(e) => setData((p) => ({ ...p, annualBookings: e.target.value }))}>
                <option value="">Select range</option>
                <option>Under 50</option>
                <option>50–200</option>
                <option>200–500</option>
                <option>500–2,000</option>
                <option>2,000+</option>
              </select>
            </div>

            <div>
              <label className="label">Social media (optional)</label>
              <div className="space-y-2">
                <input className="input" placeholder="Instagram handle @" value={data.socialMedia.instagram} onChange={(e) => setData((p) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: e.target.value } }))} />
                <input className="input" placeholder="Facebook page URL" value={data.socialMedia.facebook} onChange={(e) => setData((p) => ({ ...p, socialMedia: { ...p.socialMedia, facebook: e.target.value } }))} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3">← Back</button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Business verification</h2>
              <p className="mt-1 text-sm text-charcoal/55">Verified agencies get priority placement and a trust badge.</p>
            </div>

            <div>
              <label className="label">Business registration number</label>
              <input className="input" placeholder="Your official business / trade license number" value={data.licenseNumber} onChange={(e) => setData((p) => ({ ...p, licenseNumber: e.target.value }))} />
            </div>

            <div>
              <label className="label">Country of registration</label>
              <select className="input" value={data.registrationCountry} onChange={(e) => setData((p) => ({ ...p, registrationCountry: e.target.value }))}>
                <option value="">Select</option>
                <option>🇦🇪 UAE</option>
                <option>🇵🇰 Pakistan</option>
                <option>🇸🇦 Saudi Arabia</option>
                <option>🇮🇳 India</option>
                <option>🇬🇧 UK</option>
                <option>🇺🇸 USA</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-3">
              {[
                { label: "Trade license or business certificate", desc: "Official government-issued license" },
                { label: "IATA or travel association membership", desc: "If applicable (IATA, ASTA, ABTA, etc.)" },
                { label: "Agency logo (high resolution)", desc: "PNG or SVG, used on your public profile" },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center justify-between rounded-xl border border-soft-200 p-3.5">
                  <div>
                    <p className="text-sm font-semibold text-navy">{doc.label}</p>
                    <p className="text-xs text-charcoal/50">{doc.desc}</p>
                  </div>
                  <div className="rounded-lg border border-dashed border-soft-200 px-3 py-1.5 text-xs text-charcoal/40 hover:border-blue hover:text-blue transition-colors cursor-pointer">
                    Upload
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 text-xs text-charcoal/60">
              <strong className="text-navy">Note:</strong> Verification badge is displayed once our team reviews your documents (within 48 hours). Listing is live immediately.
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3" disabled={loading}>← Back</button>
              <button onClick={handleSubmit} className="btn-primary flex-1 py-3" disabled={loading}>
                {loading ? "Saving…" : "Launch profile →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue/10 text-5xl">
              🏢
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-navy">Agency profile submitted!</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              {FORM_SUBMIT_SUCCESS_MESSAGE}
            </p>

            <div className="mt-4 rounded-xl border border-soft-200 bg-soft p-4 text-left text-xs text-charcoal/60">
              <p className="mb-1.5 font-bold text-navy">Next steps:</p>
              <ul className="space-y-1">
                <li>✅ Add your first tour package</li>
                <li>✅ Set up payment preferences</li>
                <li>✅ Share your profile link with existing clients</li>
                <li>⏳ Verification badge arriving within 48 hours</li>
              </ul>
            </div>

            <div className="mt-6 space-y-2.5">
              <Link href="/dashboard/agency" className="btn-gold w-full py-3.5 text-base block">
                🏢 Open Agency dashboard
              </Link>
              <Link href="/" className="btn-outline w-full py-3 text-sm block">
                View the marketplace
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
