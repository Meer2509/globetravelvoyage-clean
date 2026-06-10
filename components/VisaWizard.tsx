"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { visas } from "@/lib/data";

const purposes = ["Tourism", "Business", "Study", "Family visit", "Work"] as const;

export function VisaWizard() {
  const [step, setStep] = useState(0);
  const [nationality, setNationality] = useState("");
  const [destination, setDestination] = useState("United States");
  const [purpose, setPurpose] = useState<(typeof purposes)[number]>("Tourism");

  const destinations = Array.from(new Set(visas.map((v) => v.country)));

  function match() {
    const byCountry = visas.filter((v) => v.country === destination);
    if (byCountry.length === 0) return visas[0];
    if (purpose === "Study")
      return byCountry.find((v) => v.category === "Student") ?? byCountry[0];
    if (purpose === "Business")
      return byCountry.find((v) => v.category === "Business") ?? byCountry[0];
    return byCountry.find((v) => v.category === "Visitor") ?? byCountry[0];
  }

  const result = step === 3 ? match() : null;

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              s <= step ? "bg-blue" : "bg-soft-200"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h3 className="text-xl font-bold text-navy">What is your nationality?</h3>
          <p className="mt-1 text-sm text-navy/55">
            We use this to tailor visa guidance (informational only).
          </p>
          <input
            className="input mt-4"
            placeholder="e.g. Pakistan, India, Philippines"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
          <div className="mt-6 flex justify-end">
            <button
              className="btn-primary px-6 py-2.5"
              onClick={() => setStep(1)}
              disabled={!nationality.trim()}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 className="text-xl font-bold text-navy">Where do you want to go?</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {destinations.map((d) => (
              <button
                key={d}
                onClick={() => setDestination(d)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  destination === d
                    ? "border-blue bg-blue/5 text-navy"
                    : "border-soft-200 text-navy/70 hover:border-navy/30"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button className="btn-ghost px-4 py-2.5" onClick={() => setStep(0)}>
              ← Back
            </button>
            <button className="btn-primary px-6 py-2.5" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-xl font-bold text-navy">Purpose of travel?</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {purposes.map((p) => (
              <button
                key={p}
                onClick={() => setPurpose(p)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  purpose === p
                    ? "border-blue bg-blue text-white"
                    : "border-soft-200 text-navy/70 hover:border-navy/30"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button className="btn-ghost px-4 py-2.5" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button className="btn-primary px-6 py-2.5" onClick={() => setStep(3)}>
              See recommendation
            </button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div>
          <span className="chip bg-blue/10 text-blue">AI recommendation</span>
          <h3 className="mt-3 text-2xl font-bold text-navy">
            {result.flag} {result.type}
          </h3>
          <p className="mt-1 text-sm text-navy/60">
            Suggested for a {nationality} national traveling to {destination} for{" "}
            {purpose.toLowerCase()}.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-soft/60 p-4">
              <p className="text-xs text-navy/45">Processing</p>
              <p className="font-semibold text-navy">{result.processing}</p>
            </div>
            <div className="rounded-xl bg-soft/60 p-4">
              <p className="text-xs text-navy/45">Validity</p>
              <p className="font-semibold text-navy">{result.validity}</p>
            </div>
            <div className="rounded-xl bg-soft/60 p-4">
              <p className="text-xs text-navy/45">Fee from</p>
              <p className="font-semibold text-navy">{result.feeFrom}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-bold text-navy">Document checklist</h4>
              <ul className="mt-2 space-y-1.5">
                {result.documents.slice(0, 6).map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-navy/70">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy">Step-by-step</h4>
              <ol className="mt-2 space-y-1.5">
                {result.steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-navy/70">
                    <span className="font-bold text-blue">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/visa/${result.slug}`} className="btn-primary px-6 py-2.5">
              View full visa guide
            </Link>
            <Link href="/agents" className="btn-outline px-6 py-2.5">
              Connect with a verified agent
            </Link>
            <button className="btn-ghost px-4 py-2.5" onClick={() => setStep(0)}>
              Start over
            </button>
          </div>

          <p className="mt-4 text-xs text-navy/45">
            This is AI-generated guidance based on sample data, not legal advice. We
            do not guarantee visa approval. Always verify with the official authority.
          </p>
        </div>
      )}
    </div>
  );
}
