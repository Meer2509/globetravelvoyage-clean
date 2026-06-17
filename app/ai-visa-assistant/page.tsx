"use client";

import { useState } from "react";
import Link from "next/link";
import { analyzeVisaWithAi, AiUnavailableError } from "@/lib/ai-api";
import type { VisaInput, VisaResult } from "@/lib/ai-types";

// ── Action helpers ─────────────────────────────────────────────────────────────

function DownloadChecklistButton({ docs, visaType }: { docs: string[]; visaType: string }) {
  const [done, setDone] = useState(false);
  function download() {
    const lines = [`Globe Travel Voyage — ${visaType} Document Checklist`, "", ...docs.map((d, i) => `${i + 1}. ${d}`), "", "Disclaimer: For guidance only. Verify with official sources."];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "visa-checklist.txt"; a.click();
    URL.revokeObjectURL(url);
    setDone(true); setTimeout(() => setDone(false), 3000);
  }
  return (
    <button onClick={download} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-soft-200 bg-white text-charcoal/60 hover:border-blue/30 hover:text-navy"}`}>
      {done ? "✓ Downloaded!" : "📥 Download checklist"}
    </button>
  );
}

// ── Step progress ─────────────────────────────────────────────────────────────

const STEPS = ["Your profile", "Destination", "Travel history", "AI analysis"];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
              i < current  ? "bg-blue text-white" :
              i === current ? "bg-navy text-white ring-4 ring-navy/20" :
              "bg-soft-200 text-charcoal/40"
            }`}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`hidden text-[10px] font-semibold sm:block ${i === current ? "text-navy" : "text-charcoal/40"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`mx-1 h-0.5 flex-1 rounded-full ${i < current ? "bg-blue" : "bg-soft-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Result score ring ─────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r   = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? "#059669" : score >= 50 ? "#C9A227" : "#DC2626";

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-navy">{score}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-charcoal/40">Readiness</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIVisaAssistantPage() {
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<VisaResult | null>(null);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState<"docs" | "risks" | "steps">("docs");

  const [form, setForm] = useState<VisaInput>({
    nationality:            "",
    currentCountry:         "",
    destination:            "",
    purpose:                "tourism",
    previousVisaRefusals:   false,
    travelHistory:          "limited",
    employmentStatus:       "employed",
    financialSituation:     "moderate",
  });

  function update<K extends keyof VisaInput>(key: K, value: VisaInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function analyze() {
    setLoading(true);
    setError("");
    setStep(3);
    try {
      const r = await analyzeVisaWithAi(form);
      setResult(r);
    } catch (err) {
      setResult(null);
      setError(err instanceof AiUnavailableError ? err.message : err instanceof Error ? err.message : "Analysis failed.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(0);
    setResult(null);
    setError("");
    setForm({ nationality: "", currentCountry: "", destination: "", purpose: "tourism", previousVisaRefusals: false, travelHistory: "limited", employmentStatus: "employed", financialSituation: "moderate" });
  }

  return (
    <div className="min-h-screen bg-soft">
      {/* Header */}
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/ai-travel-assistant" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← AI Travel Assistant
          </Link>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-3xl">🛂</span>
            <div>
              <span className="eyebrow-white mb-2">AI-powered</span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">AI Visa Assistant</h1>
              <p className="mt-2 text-white/60 text-sm max-w-xl">
                Tell us your profile and destination. Our AI analyses your case and generates a personalised document checklist, risk assessment, and step-by-step action plan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-8">
        <div className="mx-auto max-w-3xl">

          {/* Step bar */}
          {!result && (
            <div className="mb-8">
              <StepBar current={step} />
            </div>
          )}

          {/* ── Step 0: Profile ── */}
          {step === 0 && !result && (
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-extrabold text-navy">Your profile</h2>
                <p className="mt-1 text-sm text-charcoal/50">Tell us who you are so we can personalise your visa guidance.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Your nationality / passport country *</label>
                  <input className="input" placeholder="e.g. Pakistan, India, Egypt" value={form.nationality} onChange={(e) => update("nationality", e.target.value)} />
                </div>
                <div>
                  <label className="label">Country you live in *</label>
                  <input className="input" placeholder="e.g. UAE, Saudi Arabia" value={form.currentCountry} onChange={(e) => update("currentCountry", e.target.value)} />
                </div>
                <div>
                  <label className="label">Employment status</label>
                  <select className="input" value={form.employmentStatus} onChange={(e) => update("employmentStatus", e.target.value)}>
                    <option value="employed">Employed (full-time)</option>
                    <option value="self-employed">Self-employed / business owner</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                    <option value="unemployed">Not currently employed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Financial situation</label>
                  <select className="input" value={form.financialSituation} onChange={(e) => update("financialSituation", e.target.value)}>
                    <option value="strong">Strong (savings + regular income)</option>
                    <option value="moderate">Moderate (some savings)</option>
                    <option value="limited">Limited (minimal savings)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!form.nationality.trim() || !form.currentCountry.trim()}
                className="btn-primary py-3 px-8 disabled:opacity-50"
              >
                Next — Destination →
              </button>
            </div>
          )}

          {/* ── Step 1: Destination ── */}
          {step === 1 && !result && (
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-extrabold text-navy">Destination & purpose</h2>
                <p className="mt-1 text-sm text-charcoal/50">Where are you going and why?</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Destination country *</label>
                  <input className="input" placeholder="e.g. USA, UK, Canada, Schengen" value={form.destination} onChange={(e) => update("destination", e.target.value)} />
                  <p className="mt-1 text-[11px] text-charcoal/40">Try: USA, UK, Canada, Schengen, UAE</p>
                </div>
                <div>
                  <label className="label">Purpose of travel *</label>
                  <select className="input" value={form.purpose} onChange={(e) => update("purpose", e.target.value)}>
                    <option value="tourism">Tourism / vacation</option>
                    <option value="business">Business meetings</option>
                    <option value="study">Study / education</option>
                    <option value="family">Visit family or friends</option>
                    <option value="medical">Medical treatment</option>
                    <option value="transit">Transit only</option>
                    <option value="work">Work / employment</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-outline py-3 px-6">← Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.destination.trim()}
                  className="btn-primary py-3 px-8 disabled:opacity-50"
                >
                  Next — Travel history →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: History ── */}
          {step === 2 && !result && (
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-extrabold text-navy">Travel & visa history</h2>
                <p className="mt-1 text-sm text-charcoal/50">This helps us give you a more accurate risk assessment.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Travel history</label>
                  <select className="input" value={form.travelHistory} onChange={(e) => update("travelHistory", e.target.value)}>
                    <option value="extensive">Extensive (10+ countries including Western)</option>
                    <option value="moderate">Moderate (5–10 countries)</option>
                    <option value="limited">Limited (fewer than 5 countries)</option>
                    <option value="none">No previous travel</option>
                  </select>
                </div>
                <div>
                  <label className="label">Previous visa refusals?</label>
                  <select className="input" value={String(form.previousVisaRefusals)} onChange={(e) => update("previousVisaRefusals", e.target.value === "true")}>
                    <option value="false">No previous refusals</option>
                    <option value="true">Yes, I have been refused a visa</option>
                  </select>
                </div>
              </div>

              {form.previousVisaRefusals && (
                <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                  <p className="text-sm font-semibold text-gold">⚠ Refusal on record</p>
                  <p className="mt-1 text-xs text-charcoal/60">
                    Having a previous refusal is not a disqualifier, but you must disclose it on all future applications. Our AI will factor this into your risk score and provide specific guidance.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline py-3 px-6">← Back</button>
                <button onClick={analyze} className="btn-gold py-3 px-8 font-extrabold">
                  🤖 Analyse my visa case →
                </button>
              </div>
              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
            </div>
          )}

          {/* ── Step 3: Loading ── */}
          {step === 3 && loading && (
            <div className="card p-10 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue/8">
                <svg className="h-10 w-10 animate-spin text-blue" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold text-navy">Analysing your visa case…</h2>
              <div className="mx-auto mt-4 max-w-sm space-y-2">
                {[
                  "Matching nationality requirements…",
                  "Calculating approval probability…",
                  "Generating document checklist…",
                  "Identifying risk factors…",
                  "Preparing step-by-step guide…",
                ].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-charcoal/50" style={{ animationDelay: `${i * 0.4}s` }}>
                    <span className="text-blue animate-pulse">◦</span> {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Result ── */}
          {result && !loading && (
            <div className="space-y-5">
              {/* Summary card */}
              <div className="card overflow-hidden">
                <div className="bg-navy p-5 text-white">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/50">AI Visa Analysis</p>
                      <h2 className="mt-1 text-2xl font-extrabold">{result.visaType}</h2>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1.5"><span className="text-white/50">Fee:</span> {result.fee}</span>
                        <span className="flex items-center gap-1.5"><span className="text-white/50">Processing:</span> {result.processingTime}</span>
                        <span className="flex items-center gap-1.5"><span className="text-white/50">Validity:</span> {result.validity}</span>
                      </div>
                    </div>
                    <ScoreRing score={result.approvalScore} />
                  </div>
                </div>
                <div className={`px-5 py-3 text-sm font-medium ${
                  result.approvalScore >= 70 ? "bg-emerald-50 text-emerald-700" :
                  result.approvalScore >= 50 ? "bg-gold/8 text-charcoal" :
                  "bg-red-50 text-red-700"
                }`}>
                  {result.approvalNote}
                </div>
              </div>

              {/* Tabs */}
              <div className="card overflow-hidden">
                <div className="flex border-b border-soft-200">
                  {([ ["docs", "📋 Documents"], ["risks", "⚠️ Risks & Tips"], ["steps", "🗺️ Next Steps"] ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 border-b-2 px-3 py-3.5 text-xs font-semibold transition-colors ${
                        activeTab === key ? "border-blue text-blue" : "border-transparent text-charcoal/45 hover:text-navy"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "docs" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-3 font-bold text-navy text-sm flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">!</span>
                          Critical documents ({result.requiredDocs.length})
                        </h3>
                        <div className="space-y-2">
                          {result.requiredDocs.map((doc, i) => (
                            <label key={i} className="flex cursor-pointer items-start gap-3 rounded-lg border border-soft-200 bg-soft/50 p-3 hover:bg-soft transition-colors">
                              <input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-blue" />
                              <span className="text-sm text-charcoal/70">{doc}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {result.optionalDocs.length > 0 && (
                        <div>
                          <h3 className="mb-3 font-bold text-navy text-sm flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue/20 text-blue text-[10px] font-bold">+</span>
                            Optional but helpful ({result.optionalDocs.length})
                          </h3>
                          <div className="space-y-2">
                            {result.optionalDocs.map((doc, i) => (
                              <label key={i} className="flex cursor-pointer items-start gap-3 rounded-lg border border-soft-200 bg-soft/50 p-3 hover:bg-soft transition-colors opacity-70">
                                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-blue" />
                                <span className="text-sm text-charcoal/60">{doc}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="rounded-xl border border-blue/20 bg-blue/5 p-3 text-xs text-blue">
                        💡 Use the <Link href="/ai-document-checker" className="font-bold underline">AI Document Checker</Link> to upload and verify each document against the requirements.
                      </div>
                    </div>
                  )}

                  {activeTab === "risks" && (
                    <div className="space-y-4">
                      {result.commonMistakes.length > 0 && (
                        <div>
                          <h3 className="mb-3 font-bold text-navy text-sm">Common mistakes to avoid</h3>
                          <div className="space-y-2">
                            {result.commonMistakes.map((m, i) => (
                              <div key={i} className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                                <span className="mt-0.5 shrink-0">✗</span> {m}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.risks.length > 0 && (
                        <div>
                          <h3 className="mb-3 font-bold text-navy text-sm">Risk factors</h3>
                          <div className="space-y-2">
                            {result.risks.map((r, i) => (
                              <div key={i} className="flex items-start gap-2 rounded-lg border border-gold/20 bg-gold/5 p-3 text-sm text-charcoal/70">
                                <span className="mt-0.5 shrink-0 text-gold">⚠</span> {r}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.tips.length > 0 && (
                        <div>
                          <h3 className="mb-3 font-bold text-navy text-sm">AI tips for your application</h3>
                          <div className="space-y-2">
                            {result.tips.map((t, i) => (
                              <div key={i} className="flex items-start gap-2 rounded-lg border border-blue/15 bg-blue/5 p-3 text-sm text-charcoal/70">
                                <span className="mt-0.5 shrink-0 text-blue">✓</span> {t}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "steps" && (
                    <div className="space-y-3">
                      <h3 className="font-bold text-navy text-sm">Your recommended action plan</h3>
                      {result.nextSteps.map((s, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue text-white text-xs font-bold">
                            {i + 1}
                          </span>
                          <p className="text-sm text-charcoal/70 pt-0.5">{s}</p>
                        </div>
                      ))}
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Link href="/agents" className="btn-primary py-3 px-6 text-sm">Find a visa expert</Link>
                        <Link href="/ai-document-checker" className="btn-outline py-3 px-6 text-sm">Check my documents</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-xs text-charcoal/50 leading-relaxed">
                <p className="font-semibold text-gold mb-1">⚠ Important disclaimer</p>
                {result.disclaimer}
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap gap-2">
                <DownloadChecklistButton docs={result.requiredDocs} visaType={result.visaType} />
                <Link href="/visa/start" className="flex items-center gap-2 rounded-xl border border-blue/30 bg-blue/5 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-blue/10 transition-colors">
                  Submit visa request
                </Link>
                <Link href="/lead/contact" className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-gold/10 transition-colors">
                  👔 Contact a verified expert
                </Link>
              </div>

              <button onClick={reset} className="btn-outline py-3 px-6 text-sm">
                ← Analyse another visa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
