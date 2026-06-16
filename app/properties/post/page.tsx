"use client";

import { useState } from "react";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { submitPropertyListing } from "@/lib/supabase/actions";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment",       emoji: "🏢" },
  { value: "house",     label: "House / Villa",   emoji: "🏡" },
  { value: "studio",    label: "Studio",           emoji: "🛏️" },
  { value: "room",      label: "Private room",    emoji: "🚪" },
  { value: "office",    label: "Commercial",      emoji: "🏣" },
  { value: "land",      label: "Land / Plot",     emoji: "🌿" },
];

const LISTING_TYPES = [
  { value: "rent",    label: "For rent",         emoji: "🔑" },
  { value: "sale",    label: "For sale",         emoji: "💰" },
  { value: "short",   label: "Travel / short stay", emoji: "🧳" },
];

export default function PostPropertyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm] = useState({
    listingType: "", propertyType: "",
    title: "", city: "", country: "", address: "",
    price: "", pricePeriod: "month",
    beds: "1", baths: "1", area: "",
    description: "",
    name: "", email: "", phone: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitPropertyListing({
      listingType: form.listingType,
      propertyType: form.propertyType,
      title: form.title,
      city: form.city,
      country: form.country,
      address: form.address,
      price: form.price,
      pricePeriod: form.pricePeriod,
      beds: form.beds,
      baths: form.baths,
      area: form.area,
      description: form.description,
      name: form.name,
      email: form.email,
      phone: form.phone,
    });

    setLoading(false);

    if (!result.ok) {
      if (result.demo) { setSubmitted(true); return; }
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
        <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-[var(--shadow-premium)]">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">🏠</div>
          <h1 className="text-2xl font-extrabold text-navy">Listing submitted!</h1>
          <p className="mt-3 text-charcoal/60 leading-relaxed">
            Your property listing has been received. Our team will review it and publish within 24–48 hours. You&apos;ll receive confirmation at <strong>{form.email}</strong>.
          </p>
          <Disclaimer className="mt-5 text-left" variant="compact" />
          <div className="mt-6 flex gap-3">
            <Link href="/dashboard/host" className="btn-primary flex-1 py-3">Host dashboard</Link>
            <Link href="/properties" className="btn-outline flex-1 py-3">Browse listings</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft/50">
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/properties" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Browse properties
          </Link>
          <span className="eyebrow-white mb-3">Host</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Post a property listing</h1>
          <p className="mt-2 text-white/60 text-sm max-w-xl">
            List your property for rent, sale or as a travel stay. Submissions are reviewed by our team before going live on the marketplace.
          </p>
        </div>
      </div>

      <div className="container-px py-10">
        <div className="mx-auto max-w-2xl">
          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Listing type */}
              <div>
                <label className="label">Listing type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {LISTING_TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => set("listingType", t.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold transition-all ${
                        form.listingType === t.value
                          ? "border-blue bg-blue/5 text-navy shadow-sm"
                          : "border-soft-200 text-charcoal/50 hover:border-navy/30 hover:text-navy"
                      }`}>
                      <span className="text-2xl">{t.emoji}</span>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div>
                <label className="label">Property type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => set("propertyType", t.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold transition-all ${
                        form.propertyType === t.value
                          ? "border-blue bg-blue/5 text-navy shadow-sm"
                          : "border-soft-200 text-charcoal/50 hover:border-navy/30 hover:text-navy"
                      }`}>
                      <span className="text-2xl">{t.emoji}</span>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider-gold" />
              <h3 className="font-bold text-navy">Property details</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Listing title *</label>
                  <input className="input" placeholder="2BR apartment in Dubai Marina with sea view" value={form.title} onChange={(e) => set("title", e.target.value)} required />
                </div>
                <div>
                  <label className="label">City *</label>
                  <input className="input" placeholder="Dubai" value={form.city} onChange={(e) => set("city", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Country *</label>
                  <input className="input" placeholder="UAE" value={form.country} onChange={(e) => set("country", e.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Approximate area / neighbourhood</label>
                  <input className="input" placeholder="Dubai Marina, JBR…" value={form.address} onChange={(e) => set("address", e.target.value)} />
                </div>
                <div>
                  <label className="label">Price *</label>
                  <div className="flex gap-2">
                    <input className="input flex-1" placeholder="$1,200" value={form.price} onChange={(e) => set("price", e.target.value)} required />
                    {form.listingType !== "sale" && (
                      <select className="input w-28" value={form.pricePeriod} onChange={(e) => set("pricePeriod", e.target.value)}>
                        <option value="night">/ night</option>
                        <option value="week">/ week</option>
                        <option value="month">/ month</option>
                        <option value="year">/ year</option>
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label">Floor area (optional)</label>
                  <input className="input" placeholder="1,200 sq ft" value={form.area} onChange={(e) => set("area", e.target.value)} />
                </div>
                <div>
                  <label className="label">Bedrooms</label>
                  <select className="input" value={form.beds} onChange={(e) => set("beds", e.target.value)}>
                    {["Studio", "1", "2", "3", "4", "5", "6+"].map((n) => <option key={n} value={n}>{n === "Studio" ? "Studio" : `${n} bed${n === "1" ? "" : "s"}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Bathrooms</label>
                  <select className="input" value={form.baths} onChange={(e) => set("baths", e.target.value)}>
                    {["1", "2", "3", "4+"].map((n) => <option key={n} value={n}>{n} bath{n === "1" ? "" : "s"}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input min-h-[100px] resize-y" placeholder="Describe your property — amenities, views, location highlights, rules, etc." rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
                </div>
              </div>

              <div className="divider-gold" />
              <h3 className="font-bold text-navy">Your contact details</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Full name *</label>
                  <input className="input" placeholder="Ahmed Khan" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Phone / WhatsApp *</label>
                  <input className="input" type="tel" placeholder="+971 50 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
                </div>
              </div>

              <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs text-charcoal/55 leading-relaxed">
                ⚠ Globe Travel Voyage is NOT a licensed real estate broker. Listings are informational only. You are responsible for the accuracy of your listing. Do not include personal financial or legal data.
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <button type="submit" disabled={loading || !form.listingType || !form.propertyType || !form.title || !form.name || !form.email} className="btn-primary w-full py-3.5 disabled:opacity-50">
                {loading ? "Submitting listing…" : "Submit listing for review →"}
              </button>
            </form>
          </div>
          <Disclaimer className="mt-5" variant="compact" />
        </div>
      </div>
    </div>
  );
}
