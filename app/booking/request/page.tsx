"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Disclaimer } from "@/components/Disclaimer";
import { submitBookingRequest } from "@/lib/supabase/actions";

const SERVICE_TYPES = [
  { value: "tour", label: "Guided tour", emoji: "🗺️" },
  { value: "hotel", label: "Hotel / Stay", emoji: "🏨" },
  { value: "flight", label: "Flight", emoji: "✈️" },
  { value: "car", label: "Car rental", emoji: "🚗" },
  { value: "car_rental", label: "Car rental", emoji: "🚗" },
  { value: "cruise", label: "Cruise / Boat", emoji: "🛳️" },
  { value: "property", label: "Property rental", emoji: "🏠" },
  { value: "package", label: "Holiday package", emoji: "📦" },
  { value: "ticket", label: "Attraction ticket", emoji: "🎟️" },
];

function normalizeServiceType(raw: string | null): string {
  if (!raw) return "";
  const map: Record<string, string> = {
    car_rental: "car",
    property: "hotel",
  };
  return map[raw] ?? raw;
}

function buildInitialForm(searchParams: ReturnType<typeof useSearchParams>) {
  const service = normalizeServiceType(searchParams.get("service"));
  const subject = searchParams.get("subject") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const details = searchParams.get("details") ?? "";

  const messageParts = [
    subject ? `Request: ${subject}` : "",
    from && to ? `Route: ${from} → ${to}` : "",
    destination ? `Destination: ${destination}` : "",
    details,
  ].filter(Boolean);

  return {
    serviceType: service,
    serviceName: subject || destination,
    name: "",
    email: "",
    phone: "",
    date: "",
    endDate: "",
    travelers: "1",
    budget: "",
    message: messageParts.join("\n"),
  };
}

function BookingRequestFormInner({
  searchParams,
}: {
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => buildInitialForm(searchParams));

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitBookingRequest({
      serviceType: form.serviceType,
      serviceName: form.serviceName,
      name: form.name,
      email: form.email,
      phone: form.phone,
      date: form.date,
      endDate: form.endDate,
      travelers: form.travelers,
      budget: form.budget,
      message: form.message,
    });

    setLoading(false);

    if (!result.ok) {
      if (result.demo) {
        setSubmitted(true);
        return;
      }
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card max-w-lg mx-auto p-8 text-center">
        <p className="text-4xl mb-4">✓</p>
        <h2 className="text-xl font-extrabold text-navy">Request received</h2>
        <p className="mt-2 text-sm text-muted">
          Our team will review your request and respond by email when a provider is available.
        </p>
        <Link href="/dashboard/customer" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
          View dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto p-6 sm:p-8 space-y-5">
      <div>
        <label className="label">Service type</label>
        <select
          className="input select"
          value={form.serviceType}
          onChange={(e) => set("serviceType", e.target.value)}
          required
        >
          <option value="">Select service</option>
          {SERVICE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.emoji} {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">What are you looking for?</label>
        <input
          className="input"
          value={form.serviceName}
          onChange={(e) => set("serviceName", e.target.value)}
          placeholder="e.g. Dubai desert safari, DXB→LHE flight"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Your name</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">Travelers</label>
          <input className="input" value={form.travelers} onChange={(e) => set("travelers", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Start date</label>
          <input className="input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div>
          <label className="label">End date</label>
          <input className="input" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Budget (optional)</label>
        <input className="input" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. $2,000" />
      </div>
      <div>
        <label className="label">Details</label>
        <textarea
          className="input min-h-28"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Dates, preferences, visa nationality, special requests..."
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
        {loading ? "Submitting…" : "Submit quote request"}
      </button>
      <Disclaimer variant="inline" />
    </form>
  );
}

function BookingRequestForm() {
  const searchParams = useSearchParams();
  return <BookingRequestFormInner key={searchParams.toString()} searchParams={searchParams} />;
}

export default function BookingRequestPage() {
  return (
    <div className="min-h-screen bg-soft py-10">
      <div className="container-px mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Request a travel quote</h1>
        <p className="mt-2 text-sm text-muted max-w-xl mx-auto">
          Tell us what you need. We route your request to verified providers as the marketplace grows.
        </p>
      </div>
      <Suspense fallback={<div className="skeleton h-96 max-w-2xl mx-auto rounded-2xl" />}>
        <BookingRequestForm />
      </Suspense>
    </div>
  );
}
