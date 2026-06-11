"use client";

import { useState } from "react";
import Link from "next/link";
import { mockDocumentCheck, VISA_TYPES, type DocumentCheckResult } from "@/lib/ai-mock";

// ── Document upload placeholder ───────────────────────────────────────────────

function UploadSlot({ label, required }: { label: string; required?: boolean }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");

  function simulate() {
    setStatus("uploading");
    setTimeout(() => setStatus("done"), 1200 + Math.random() * 800);
  }

  return (
    <div className={`rounded-xl border-2 border-dashed p-4 transition-all cursor-pointer select-none ${
      status === "done"
        ? "border-emerald-300 bg-emerald-50"
        : status === "uploading"
        ? "border-blue/40 bg-blue/3 animate-pulse"
        : "border-soft-200 bg-soft/50 hover:border-blue/30 hover:bg-blue/3"
    }`} onClick={status === "idle" ? simulate : undefined}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${
          status === "done" ? "bg-emerald-100" : "bg-white border border-soft-200"
        }`}>
          {status === "done" ? "✅" : status === "uploading" ? "⏳" : "📄"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy truncate">{label}</p>
          <p className="text-[11px] text-charcoal/45">
            {status === "done" ? "Uploaded successfully" : status === "uploading" ? "Uploading…" : "Click to upload (PDF, JPG, PNG — max 10MB)"}
          </p>
        </div>
        {required && status === "idle" && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">Required</span>
        )}
        {status === "done" && (
          <button
            onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}
            className="shrink-0 text-charcoal/30 hover:text-red-500 text-sm font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ── Result display ────────────────────────────────────────────────────────────

function ResultPanel({ result, onReset }: { result: DocumentCheckResult; onReset: () => void }) {
  const ringColor = result.overallScore >= 75 ? "#059669" : result.overallScore >= 45 ? "#C9A227" : "#DC2626";
  const r   = 40;
  const circ = 2 * Math.PI * r;
  const dash = (result.overallScore / 100) * circ;

  const statusConfig = {
    strong:       { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "✅" },
    needs_work:   { bg: "bg-gold/5",     text: "text-charcoal",    border: "border-gold/20",     icon: "⚠️" },
    incomplete:   { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: "❌" },
  };
  const sc = statusConfig[result.status];

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className="card overflow-hidden">
        <div className="bg-navy p-5">
          <div className="flex items-center gap-5">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                <circle cx="48" cy="48" r={r} fill="none" stroke={ringColor} strokeWidth="10"
                  strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{result.overallScore}%</span>
                <span className="text-[9px] text-white/40 uppercase tracking-wide">Ready</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">AI Document Check</p>
              <h2 className="text-xl font-extrabold text-white">
                {result.status === "strong" ? "Ready to apply" : result.status === "needs_work" ? "Needs improvement" : "Not ready yet"}
              </h2>
              <p className="mt-1 text-white/60 text-sm">{result.summary}</p>
            </div>
          </div>
        </div>
        <div className={`px-5 py-3 border-t ${sc.bg} ${sc.border}`}>
          <p className={`text-sm font-semibold ${sc.text}`}>{sc.icon} {result.summary}</p>
        </div>
      </div>

      {/* Passed docs */}
      {result.passedDocs.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-navy text-sm flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">✓</span>
            Documents ready ({result.passedDocs.length})
          </h3>
          <div className="space-y-2">
            {result.passedDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                <span>✅</span> {doc}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing critical */}
      {result.missingCritical.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-navy text-sm flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px]">!</span>
            Missing critical documents ({result.missingCritical.length})
          </h3>
          <div className="space-y-2">
            {result.missingCritical.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <span>❌</span>
                <span className="flex-1">{doc}</span>
                <span className="text-[10px] font-bold bg-red-100 px-2 py-0.5 rounded-full">Missing</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-navy text-sm">⚠️ AI warnings</h3>
          <div className="space-y-2">
            {result.warnings.map((w, i) => (
              <div key={i} className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-sm text-charcoal/70 leading-relaxed">
                {w}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing optional */}
      {result.missingOptional.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-navy text-sm flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue/20 text-blue text-[10px]">+</span>
            Optional documents that strengthen your application
          </h3>
          <div className="space-y-2">
            {result.missingOptional.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-blue/15 bg-blue/3 px-3 py-2.5 text-sm text-charcoal/60">
                <span className="text-blue">→</span> {doc}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {result.improvements.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 font-bold text-navy text-sm">🤖 AI action plan</h3>
          <div className="space-y-2">
            {result.improvements.map((imp, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
                <p className="text-sm text-charcoal/65">{imp}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/agents" className="btn-primary py-2.5 px-5 text-sm">Find a visa expert</Link>
            <Link href="/ai-visa-assistant" className="btn-outline py-2.5 px-5 text-sm">Full visa analysis</Link>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-xs text-charcoal/50 leading-relaxed">
        <p className="font-semibold text-gold mb-1">⚠ Important disclaimer</p>
        {result.disclaimer}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        <DownloadReportButton />
        <Link href="/lead/contact" className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-gold/10 transition-colors">
          👔 Get expert review
        </Link>
      </div>

      <button onClick={onReset} className="btn-outline py-3 px-6 text-sm">
        ← Check another document set
      </button>
    </div>
  );
}

function DownloadReportButton() {
  const [done, setDone] = useState(false);
  function download() {
    const text = "Globe Travel Voyage — Document Check Report\n\nThis is a placeholder report.\n\nDisclaimer: For guidance only. Verify with official sources.";
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "document-check-report.txt"; a.click();
    URL.revokeObjectURL(url);
    setDone(true); setTimeout(() => setDone(false), 3000);
  }
  return (
    <button onClick={download} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-soft-200 bg-white text-charcoal/60 hover:border-blue/30 hover:text-navy"}`}>
      {done ? "✓ Downloaded!" : "📥 Download report"}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIDocumentCheckerPage() {
  const [visaType, setVisaType]       = useState("");
  const [nationality, setNationality] = useState("");
  const [destination, setDestination] = useState("");
  const [step, setStep]               = useState<"select" | "checklist" | "result">("select");
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<DocumentCheckResult | null>(null);

  // Get document set for selected visa type
  const { mockDocumentCheck: _mock, VISA_TYPES: _vt, ..._ } = { mockDocumentCheck, VISA_TYPES };

  const VISA_DOC_MAP: Record<string, { critical: string[]; optional: string[] }> = {
    "usa-b1b2":       { critical: ["Valid passport (6+ months)", "DS-160 confirmation page", "$185 MRV fee receipt", "CEAC interview appointment", "Passport photo (5×5 cm)", "Bank statements (3–6 months)", "Employment letter", "Proof of home ties"], optional: ["Property documents", "Previous US visas", "International travel history", "Sponsor/invitation letter", "Cover letter"] },
    "usa-student":    { critical: ["Valid passport", "I-20 from accredited school", "SEVIS I-901 payment receipt", "DS-160 form", "$185 MRV fee receipt", "CEAC appointment", "Financial proof (tuition + living)"], optional: ["Admission letter", "Scholarship documents", "SAT/TOEFL scores", "Academic transcripts"] },
    "uk-visitor":     { critical: ["Valid passport + old passports", "Online UK visa application", "Biometric enrolment", "Bank statements (6 months)", "Employment/payslip letter", "Accommodation proof", "Return flights"], optional: ["Travel insurance", "Previous UK visas", "Cover letter", "Property documents"] },
    "canada-visitor": { critical: ["Valid passport", "IMM 5257 form", "Digital photo", "Financial proof (CAD $2,500+)", "Biometrics", "Employment letter"], optional: ["Invitation letter", "Travel history", "Property documents", "Bank reference letter"] },
    "schengen":       { critical: ["Valid passport (3 months post-departure)", "Application form", "2 biometric photos", "Travel insurance (€30,000 min)", "Accommodation proof", "Return flight booking", "Bank statements (3 months)"], optional: ["Employer letter", "Previous Schengen visas", "Invitation letter", "Detailed itinerary"] },
    "uae-tourist":    { critical: ["Valid passport (6+ months)", "Passport photo", "Return ticket", "Hotel booking"], optional: ["Travel insurance", "Bank statement", "Employment letter"] },
  };

  const currentDocs = VISA_DOC_MAP[visaType] ?? { critical: [], optional: [] };

  function toggleDoc(doc: string) {
    setCheckedDocs((prev) => prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]);
  }

  async function runCheck() {
    setLoading(true);
    setStep("result");
    try {
      const r = await mockDocumentCheck({ visaType, nationality, destination, checkedDocs });
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("select");
    setResult(null);
    setCheckedDocs([]);
    setVisaType("");
    setNationality("");
    setDestination("");
  }

  const selectedLabel = VISA_TYPES.find((v) => v.key === visaType)?.label ?? "";

  return (
    <div className="min-h-screen bg-soft">
      {/* Header */}
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/ai-travel-assistant" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← AI Travel Assistant
          </Link>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-3xl">📋</span>
            <div>
              <span className="eyebrow-white mb-2">AI-powered</span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">AI Document Checker</h1>
              <p className="mt-2 text-white/60 text-sm max-w-xl">
                Select your visa type, tick the documents you have, and upload them. Our AI checks for missing documents, common mistakes and gives you an application readiness score.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-8">
        <div className="mx-auto max-w-3xl">

          {/* Step: select visa */}
          {step === "select" && (
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-extrabold text-navy">Select your visa type</h2>
                <p className="mt-1 text-sm text-charcoal/50">Choose the visa you are applying for to load the correct document checklist.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {VISA_TYPES.map((vt) => (
                  <button
                    key={vt.key}
                    onClick={() => setVisaType(vt.key)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      visaType === vt.key
                        ? "border-blue bg-blue/5 shadow-[var(--shadow-glow)]"
                        : "border-soft-200 bg-soft/50 hover:border-navy/25"
                    }`}
                  >
                    <span className="text-2xl">{vt.flag}</span>
                    <div>
                      <p className="font-bold text-navy text-sm">{vt.label}</p>
                    </div>
                    {visaType === vt.key && <span className="ml-auto text-blue font-bold">✓</span>}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Your nationality (optional)</label>
                  <input className="input" placeholder="e.g. Pakistan, India" value={nationality} onChange={(e) => setNationality(e.target.value)} />
                </div>
                <div>
                  <label className="label">Destination (optional)</label>
                  <input className="input" placeholder="e.g. USA, UK" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
              </div>

              <button
                onClick={() => setStep("checklist")}
                disabled={!visaType}
                className="btn-primary py-3 px-8 disabled:opacity-50"
              >
                Load document checklist →
              </button>
            </div>
          )}

          {/* Step: checklist */}
          {step === "checklist" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-charcoal/40 uppercase tracking-wide">Document checklist</p>
                  <h2 className="text-xl font-extrabold text-navy">{selectedLabel}</h2>
                </div>
                <button onClick={() => setStep("select")} className="text-sm text-charcoal/40 hover:text-navy">
                  ← Change visa type
                </button>
              </div>

              {/* Progress */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-navy">
                    {checkedDocs.length}/{currentDocs.critical.length + currentDocs.optional.length} documents ready
                  </p>
                  <span className={`text-xs font-bold ${
                    checkedDocs.filter((d) => currentDocs.critical.includes(d)).length === currentDocs.critical.length
                      ? "text-emerald-600" : "text-gold"
                  }`}>
                    {checkedDocs.filter((d) => currentDocs.critical.includes(d)).length}/{currentDocs.critical.length} critical
                  </span>
                </div>
                <div className="h-2 rounded-full bg-soft-200">
                  <div
                    className="h-2 rounded-full bg-blue transition-all"
                    style={{ width: `${((checkedDocs.length) / (currentDocs.critical.length + currentDocs.optional.length || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Critical docs */}
              <div className="card p-5">
                <h3 className="mb-3 font-bold text-navy text-sm flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px]">!</span>
                  Critical documents — tick when ready
                </h3>
                <div className="space-y-2">
                  {currentDocs.critical.map((doc) => (
                    <label key={doc} className="flex cursor-pointer items-start gap-3 rounded-lg border border-soft-200 bg-soft/50 p-3 hover:bg-soft transition-colors">
                      <input
                        type="checkbox"
                        checked={checkedDocs.includes(doc)}
                        onChange={() => toggleDoc(doc)}
                        className="mt-0.5 h-4 w-4 rounded accent-blue"
                      />
                      <div className="flex-1">
                        <span className={`text-sm ${checkedDocs.includes(doc) ? "line-through text-charcoal/40" : "text-charcoal/70"}`}>{doc}</span>
                      </div>
                      <span className="text-[10px] font-bold text-red-500 shrink-0">Required</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional docs */}
              {currentDocs.optional.length > 0 && (
                <div className="card p-5">
                  <h3 className="mb-3 font-bold text-navy text-sm flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue/20 text-blue text-[10px]">+</span>
                    Optional — strengthens your application
                  </h3>
                  <div className="space-y-2">
                    {currentDocs.optional.map((doc) => (
                      <label key={doc} className="flex cursor-pointer items-start gap-3 rounded-lg border border-soft-200 bg-soft/50 p-3 hover:bg-soft transition-colors opacity-80">
                        <input
                          type="checkbox"
                          checked={checkedDocs.includes(doc)}
                          onChange={() => toggleDoc(doc)}
                          className="mt-0.5 h-4 w-4 rounded accent-blue"
                        />
                        <span className={`text-sm ${checkedDocs.includes(doc) ? "line-through text-charcoal/35" : "text-charcoal/60"}`}>{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload placeholders */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-navy text-sm">Upload your documents</h3>
                  <span className="rounded-full border border-gold/20 bg-gold/8 px-2 py-0.5 text-[10px] font-bold text-gold">
                    🔧 Upload coming with Supabase storage
                  </span>
                </div>
                <div className="space-y-2">
                  {currentDocs.critical.slice(0, 4).map((doc) => (
                    <UploadSlot key={doc} label={doc} required />
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-charcoal/35">
                  Real file uploads will be enabled when Supabase Storage is connected. Files are stored securely and never shared.
                </p>
              </div>

              {/* Common mistakes prevention */}
              <div className="card p-5">
                <h3 className="mb-3 font-bold text-navy text-sm">🚫 Common mistakes to avoid</h3>
                <ul className="space-y-2">
                  {[
                    "Photos not meeting exact biometric specifications (5×5 cm, white background, no glasses)",
                    "Bank statements not covering the required period (usually 3–6 months)",
                    "Application form errors — spelling must match passport exactly",
                    "Submitting expired or damaged documents",
                    "Missing translations — non-English documents need certified translation",
                    "Not declaring previous visa refusals (this is a serious offense)",
                  ].map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-charcoal/60">
                      <span className="mt-0.5 text-red-400 shrink-0">✗</span> {m}
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={runCheck} className="btn-gold w-full py-4 text-base font-extrabold">
                🤖 Run AI document check →
              </button>
            </div>
          )}

          {/* Loading */}
          {step === "result" && loading && (
            <div className="card py-14 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue/8">
                <svg className="h-10 w-10 animate-spin text-blue" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold text-navy">Running document check…</h2>
              <p className="mt-2 text-sm text-charcoal/40 animate-pulse">Checking requirements for {selectedLabel}…</p>
            </div>
          )}

          {/* Result */}
          {step === "result" && result && !loading && (
            <ResultPanel result={result} onReset={reset} />
          )}
        </div>
      </div>
    </div>
  );
}
