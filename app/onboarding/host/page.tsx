"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, StepProgress } from "@/components/AuthLayout";
import { FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";
import { completeHostOnboarding } from "@/lib/supabase/onboarding-actions";
import { ProviderOnboardingTracker } from "@/components/provider-acquisition/ProviderOnboardingTracker";

const STEPS = ["Property", "Details", "Policies", "Done"];

const amenities = [
  "📶 Free WiFi", "🅿️ Parking", "🏊 Swimming Pool", "💪 Gym",
  "🌿 Garden / Terrace", "❄️ Air Conditioning", "🍳 Full Kitchen",
  "🧺 Washing Machine", "📺 Smart TV", "🔐 Safe / Locker",
  "🏖️ Beach Access", "🍽️ Breakfast Included",
];

export default function HostOnboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    propertyType: "",
    listingType: "",
    title: "",
    city: "",
    country: "",
    neighborhood: "",
    beds: "",
    baths: "",
    maxGuests: "",
    sqft: "",
    pricePerNight: "",
    pricePerMonth: "",
    description: "",
    selectedAmenities: [] as string[],
    checkIn: "",
    checkOut: "",
    minStay: "",
    petFriendly: false,
    smokingAllowed: false,
    instantBook: true,
    buyListingIntent: false,
    askingPrice: "",
  });

  function toggleAmenity(a: string) {
    setData((p) => ({
      ...p,
      selectedAmenities: p.selectedAmenities.includes(a)
        ? p.selectedAmenities.filter((x) => x !== a)
        : [...p.selectedAmenities, a],
    }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const result = await completeHostOnboarding({
        propertyType: data.propertyType,
        listingType: data.listingType,
        title: data.title,
        city: data.city,
        country: data.country,
        neighborhood: data.neighborhood,
        beds: data.beds,
        baths: data.baths,
        maxGuests: data.maxGuests,
        sqft: data.sqft,
        pricePerNight: data.pricePerNight,
        pricePerMonth: data.pricePerMonth,
        askingPrice: data.askingPrice,
        description: data.description,
        selectedAmenities: data.selectedAmenities,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        minStay: data.minStay,
        petFriendly: data.petFriendly,
        smokingAllowed: data.smokingAllowed,
        instantBook: data.instantBook,
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
      eyebrow="Property Host"
      headline="List your property globally"
      subline="List your property on our verified host marketplace as traveler demand grows."
      showStats={false}
    >
      <div>
        <StepProgress steps={STEPS} current={step} />
        <ProviderOnboardingTracker role="property_host" stepIndex={step} />

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Property basics</h2>
              <p className="mt-1 text-sm text-charcoal/55">Start with the essentials about your property.</p>
            </div>

            <div>
              <label className="label">Property type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "apartment", label: "Apartment", emoji: "🏢" },
                  { key: "villa", label: "Villa", emoji: "🏡" },
                  { key: "house", label: "House", emoji: "🏠" },
                  { key: "studio", label: "Studio", emoji: "🛏️" },
                  { key: "hotel", label: "Hotel Room", emoji: "🏨" },
                  { key: "other", label: "Other", emoji: "🏗️" },
                ].map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setData((p) => ({ ...p, propertyType: type.key }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-medium transition-all ${
                      data.propertyType === type.key ? "border-blue bg-blue/5 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    <span className="text-lg">{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Listing purpose</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "short", label: "Short stay", emoji: "📅" },
                  { key: "long", label: "Long term", emoji: "🗓️" },
                  { key: "sell", label: "For sale", emoji: "💰" },
                ].map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setData((p) => ({ ...p, listingType: type.key }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-medium transition-all ${
                      data.listingType === type.key ? "border-blue bg-blue/5 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    <span className="text-lg">{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Listing title</label>
              <input className="input" placeholder="e.g. Luxury Marina View Apartment — Dubai" value={data.title} onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="e.g. Dubai" value={data.city} onChange={(e) => setData((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" value={data.country} onChange={(e) => setData((p) => ({ ...p, country: e.target.value }))}>
                  <option value="">Select</option>
                  <option>🇦🇪 UAE</option>
                  <option>🇵🇰 Pakistan</option>
                  <option>🇸🇦 Saudi Arabia</option>
                  <option>🇹🇷 Turkey</option>
                  <option>🇹🇭 Thailand</option>
                  <option>🇬🇧 UK</option>
                  <option>🇺🇸 USA</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Neighborhood / Area</label>
              <input className="input" placeholder="e.g. Dubai Marina, Clifton" value={data.neighborhood} onChange={(e) => setData((p) => ({ ...p, neighborhood: e.target.value }))} />
            </div>

            <button onClick={() => setStep(1)} className="btn-primary w-full py-3.5">Continue →</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Property details</h2>
              <p className="mt-1 text-sm text-charcoal/55">Help travelers picture your space.</p>
            </div>

            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {[
                { key: "beds", label: "Bedrooms", placeholder: "3" },
                { key: "baths", label: "Bathrooms", placeholder: "2" },
                { key: "maxGuests", label: "Max guests", placeholder: "6" },
                { key: "sqft", label: "Sq ft / m²", placeholder: "1,200" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="label">{field.label}</label>
                  <input
                    className="input"
                    placeholder={field.placeholder}
                    value={data[field.key as keyof typeof data] as string}
                    onChange={(e) => setData((p) => ({ ...p, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">
                  {data.listingType === "sell" ? "Asking price (USD)" : "Price per night (USD)"}
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder={data.listingType === "sell" ? "e.g. 450,000" : "e.g. 150"}
                  value={data.listingType === "sell" ? data.askingPrice : data.pricePerNight}
                  onChange={(e) => setData((p) => ({
                    ...p,
                    [data.listingType === "sell" ? "askingPrice" : "pricePerNight"]: e.target.value,
                  }))}
                />
              </div>
              {data.listingType !== "sell" && (
                <div>
                  <label className="label">Monthly rate (optional)</label>
                  <input type="number" className="input" placeholder="e.g. 2,500" value={data.pricePerMonth} onChange={(e) => setData((p) => ({ ...p, pricePerMonth: e.target.value }))} />
                </div>
              )}
            </div>

            <div>
              <label className="label">Property description</label>
              <textarea
                className="input min-h-[90px] resize-none"
                placeholder="Describe the space, view, location benefits, nearby attractions…"
                value={data.description}
                onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.selectedAmenities.includes(a) ? "border-blue bg-blue/8 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {a}
                  </button>
                ))}
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
              <h2 className="text-xl font-extrabold text-navy">House rules & policies</h2>
              <p className="mt-1 text-sm text-charcoal/55">Set expectations before guests book.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Check-in time</label>
                <select className="input" value={data.checkIn} onChange={(e) => setData((p) => ({ ...p, checkIn: e.target.value }))}>
                  <option value="">Select</option>
                  <option>12:00 PM</option>
                  <option>1:00 PM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div>
                <label className="label">Check-out time</label>
                <select className="input" value={data.checkOut} onChange={(e) => setData((p) => ({ ...p, checkOut: e.target.value }))}>
                  <option value="">Select</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>12:00 PM</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div>
                <label className="label">Min. stay</label>
                <select className="input" value={data.minStay} onChange={(e) => setData((p) => ({ ...p, minStay: e.target.value }))}>
                  <option value="">Select</option>
                  <option>1 night</option>
                  <option>2 nights</option>
                  <option>3 nights</option>
                  <option>1 week</option>
                  <option>1 month</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-soft-200 p-4">
              {(
                [
                  { key: "petFriendly", label: "Pet friendly", desc: "Guests may bring small pets" },
                  { key: "smokingAllowed", label: "Smoking allowed", desc: "On terrace or designated areas" },
                  { key: "instantBook", label: "Instant booking", desc: "Guests can book without prior approval" },
                ] as const
              ).map((rule) => (
                <label key={rule.key} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-navy">{rule.label}</p>
                    <p className="text-xs text-charcoal/50">{rule.desc}</p>
                  </div>
                  <div
                    onClick={() => setData((p) => ({ ...p, [rule.key]: !p[rule.key] }))}
                    className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${data[rule.key] ? "bg-blue" : "bg-soft-200"}`}
                  >
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${data[rule.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </label>
              ))}
            </div>

            <div className="rounded-xl border border-gold/25 bg-gold/5 p-4 text-xs text-charcoal/60">
              <strong className="text-navy">📋 Important:</strong> Globe Travel Voyage is a lead generation and listing platform. We are not a real estate broker, property manager or landlord. All rental and sale agreements are between host and guest/buyer directly. Verify all legal requirements in your country.
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3" disabled={loading}>← Back</button>
              <button onClick={handleSubmit} className="btn-primary flex-1 py-3" disabled={loading}>
                {loading ? "Saving…" : "List my property →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue/10 text-5xl">
              🏠
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-navy">Listing submitted!</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              {FORM_SUBMIT_SUCCESS_MESSAGE}
            </p>

            <div className="mt-4 rounded-xl border border-soft-200 bg-soft p-4 text-left text-xs text-charcoal/60">
              <p className="mb-1.5 font-bold text-navy">Next steps:</p>
              <ul className="space-y-1">
                <li>✅ Add high-quality photos (boosts visibility by 4×)</li>
                <li>✅ Set your calendar availability</li>
                <li>✅ Link your payment method</li>
                <li>✅ Share your listing on social media</li>
              </ul>
            </div>

            <div className="mt-6 space-y-2.5">
              <Link href="/dashboard/host" className="btn-gold w-full py-3.5 text-base block">
                🏠 Open Host dashboard
              </Link>
              <Link href="/properties" className="btn-primary w-full py-3 block">
                View properties marketplace
              </Link>
              <Link href="/" className="btn-outline w-full py-3 text-sm block">
                Explore the platform
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
