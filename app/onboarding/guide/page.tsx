"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, StepProgress } from "@/components/AuthLayout";

const STEPS = ["Profile", "Tours", "Availability", "Done"];

const tourCategories = [
  "🏛️ Historical Sites", "🍜 Food & Street Eats", "🏞️ Nature & Hiking",
  "🌃 Night Life & City", "🛍️ Shopping Tours", "🤿 Water Activities",
  "🧘 Wellness & Yoga", "📸 Photography Walks", "🕌 Religious & Cultural",
  "🏄 Adventure Sports", "🎭 Arts & Theatre", "🚴 Cycling Tours",
];

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function GuideOnboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    languages: [] as string[],
    bio: "",
    categories: [] as string[],
    tourTitle1: "",
    tourDuration1: "",
    tourPrice1: "",
    tourTitle2: "",
    tourDuration2: "",
    tourPrice2: "",
    groupSize: "",
    availableDays: [] as string[],
    startTime: "",
    advanceBooking: "",
  });

  function toggle<K extends keyof typeof data>(key: K, item: string) {
    const arr = data[key] as string[];
    setData((p) => ({ ...p, [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] }));
  }

  const langOptions = ["English", "Arabic", "Urdu", "Hindi", "Tagalog", "French", "German", "Japanese", "Mandarin"];

  return (
    <AuthLayout
      eyebrow="Tour Guide"
      headline="Share your city with the world"
      subline="Create your guide profile and start receiving bookings from travelers worldwide."
      showStats={false}
    >
      <div>
        <StepProgress steps={STEPS} current={step} />

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Guide profile</h2>
              <p className="mt-1 text-sm text-charcoal/55">Let travelers know who you are.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="Your full name" value={data.fullName} onChange={(e) => setData((p) => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="guide@email.com" value={data.email} onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">City you guide in</label>
                <input className="input" placeholder="e.g. Istanbul" value={data.city} onChange={(e) => setData((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" value={data.country} onChange={(e) => setData((p) => ({ ...p, country: e.target.value }))}>
                  <option value="">Select</option>
                  <option>🇹🇷 Turkey</option>
                  <option>🇦🇪 UAE</option>
                  <option>🇹🇭 Thailand</option>
                  <option>🇯🇵 Japan</option>
                  <option>🇵🇰 Pakistan</option>
                  <option>🇮🇳 India</option>
                  <option>🇮🇹 Italy</option>
                  <option>🇬🇧 UK</option>
                  <option>🇺🇸 USA</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Languages you guide in</label>
              <div className="flex flex-wrap gap-2">
                {langOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggle("languages", lang)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.languages.includes(lang) ? "border-blue bg-blue/8 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">About you</label>
              <textarea
                className="input min-h-[90px] resize-none"
                placeholder="Tell travelers about yourself: your background, passion for guiding, areas of expertise…"
                value={data.bio}
                onChange={(e) => setData((p) => ({ ...p, bio: e.target.value }))}
              />
            </div>

            <button onClick={() => setStep(1)} className="btn-primary w-full py-3.5">Continue →</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Your tours</h2>
              <p className="mt-1 text-sm text-charcoal/55">Add the experiences you offer.</p>
            </div>

            <div>
              <label className="label">Tour categories</label>
              <div className="flex flex-wrap gap-2">
                {tourCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggle("categories", cat)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.categories.includes(cat) ? "border-blue bg-blue/8 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-soft-200 p-4 space-y-3">
              <p className="text-sm font-bold text-navy">Tour #1 (main experience)</p>
              <div>
                <label className="label">Tour title</label>
                <input className="input" placeholder="e.g. Hidden Istanbul: Bazaars & Bosphorus" value={data.tourTitle1} onChange={(e) => setData((p) => ({ ...p, tourTitle1: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Duration</label>
                  <select className="input" value={data.tourDuration1} onChange={(e) => setData((p) => ({ ...p, tourDuration1: e.target.value }))}>
                    <option value="">Select</option>
                    <option>2 hours</option>
                    <option>3 hours</option>
                    <option>Half day (4h)</option>
                    <option>Full day (8h)</option>
                    <option>2 days</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="label">Price per person (USD)</label>
                  <input type="number" className="input" placeholder="e.g. 45" value={data.tourPrice1} onChange={(e) => setData((p) => ({ ...p, tourPrice1: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-soft-200 p-4 space-y-3">
              <p className="text-sm font-bold text-navy">Tour #2 (optional)</p>
              <div>
                <label className="label">Tour title</label>
                <input className="input" placeholder="e.g. Street Food Safari at Night" value={data.tourTitle2} onChange={(e) => setData((p) => ({ ...p, tourTitle2: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Duration</label>
                  <select className="input" value={data.tourDuration2} onChange={(e) => setData((p) => ({ ...p, tourDuration2: e.target.value }))}>
                    <option value="">Select</option>
                    <option>2 hours</option>
                    <option>3 hours</option>
                    <option>Half day</option>
                    <option>Full day</option>
                  </select>
                </div>
                <div>
                  <label className="label">Price per person (USD)</label>
                  <input type="number" className="input" placeholder="e.g. 30" value={data.tourPrice2} onChange={(e) => setData((p) => ({ ...p, tourPrice2: e.target.value }))} />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Max group size</label>
              <select className="input" value={data.groupSize} onChange={(e) => setData((p) => ({ ...p, groupSize: e.target.value }))}>
                <option value="">Select</option>
                <option>Private (1–2)</option>
                <option>Small (3–6)</option>
                <option>Medium (7–12)</option>
                <option>Large (13–20)</option>
              </select>
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
              <h2 className="text-xl font-extrabold text-navy">Availability</h2>
              <p className="mt-1 text-sm text-charcoal/55">When are you available to guide?</p>
            </div>

            <div>
              <label className="label">Available days</label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggle("availableDays", day)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.availableDays.includes(day) ? "border-blue bg-blue/8 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Typical start time</label>
              <select className="input" value={data.startTime} onChange={(e) => setData((p) => ({ ...p, startTime: e.target.value }))}>
                <option value="">Select</option>
                <option>8:00 AM</option>
                <option>9:00 AM</option>
                <option>10:00 AM</option>
                <option>2:00 PM</option>
                <option>3:00 PM</option>
                <option>Flexible</option>
              </select>
            </div>

            <div>
              <label className="label">Advance booking required</label>
              <select className="input" value={data.advanceBooking} onChange={(e) => setData((p) => ({ ...p, advanceBooking: e.target.value }))}>
                <option value="">Select</option>
                <option>No advance needed</option>
                <option>24 hours</option>
                <option>48 hours</option>
                <option>3 days</option>
                <option>1 week</option>
              </select>
            </div>

            <div className="rounded-xl border border-blue/15 bg-blue/5 p-4 text-xs text-charcoal/65">
              <strong className="text-navy">💡 Tip:</strong> Guides with clear availability get 3× more bookings. You can update your calendar anytime from your dashboard.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Go live →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue/10 text-5xl">
              🧭
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-navy">You&apos;re live!</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              Your guide profile is now visible to travelers searching{" "}
              {data.city || "your city"}.
            </p>

            <div className="mt-6 space-y-2.5">
              <Link href="/dashboard/guide" className="btn-gold w-full py-3.5 text-base block">
                🧭 Open Guide dashboard
              </Link>
              <Link href="/tours" className="btn-primary w-full py-3 block">
                View tours marketplace
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
