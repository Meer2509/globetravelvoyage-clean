import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

// Shared left-panel visual items
const features = [
  { emoji: "🤖", text: "AI-powered trip planning & visa guidance" },
  { emoji: "✅", text: "Verified provider onboarding open" },
  { emoji: "🌍", text: "Visa guides across 190+ countries" },
  { emoji: "🔐", text: "Secure payments powered by Stripe" },
];

const testimonial = {
  text: "Globe Travel Voyage helped me prepare my USA visa from Pakistan completely stress-free. The AI checklist was spot on and the visa agent was incredible.",
  name: "Bilal A.",
  role: "Traveler · Lahore, Pakistan",
  avatar: "BA",
  rating: 5,
};

export function AuthLayout({
  children,
  eyebrow,
  headline,
  subline,
  showStats = true,
}: {
  children: ReactNode;
  eyebrow?: string;
  headline?: string;
  subline?: string;
  showStats?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left panel (branding) ── */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-hero-gradient p-10 xl:p-14 lg:flex">
        {/* Background orbs */}
        <div className="pointer-events-none absolute -left-32 -top-20 h-[400px] w-[400px] rounded-full bg-blue/30 blur-[100px] opacity-60" />
        <div className="pointer-events-none absolute -right-20 bottom-1/4 h-[300px] w-[300px] rounded-full bg-gold/20 blur-[80px] opacity-50" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block group" aria-label="Globe Travel Voyage">
            <Image
              src="/logo.png"
              alt="Globe Travel Voyage"
              width={360}
              height={100}
              className="h-[100px] w-auto object-contain opacity-95 group-hover:opacity-100 transition-opacity"
              priority
              quality={100}
            />
          </Link>

          {eyebrow && (
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold">
              {eyebrow}
            </span>
          )}

          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white xl:text-4xl">
            {headline ?? "Your AI Travel Command Center"}
          </h2>
          {subline && (
            <p className="mt-3 text-sm leading-relaxed text-white/60">{subline}</p>
          )}

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f.text} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-sm">
                  {f.emoji}
                </span>
                <span className="pt-1 text-sm text-white/70">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: stats + testimonial */}
        <div className="relative z-10">
          {showStats && (
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { value: "Open", label: "Provider onboarding" },
                { value: "—", label: "Reviews after bookings" },
                { value: "Live", label: "Secure requests reviewed by specialists" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-lg font-extrabold text-gold">{s.value}</p>
                  <p className="text-[11px] text-muted-dark">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Testimonial */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <span key={i} className="text-gold text-sm">★</span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-white/75 italic">
              &ldquo;{testimonial.text}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">
                {testimonial.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{testimonial.name}</p>
                <p className="text-xs text-white/50">{testimonial.role}</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-4 text-[11px] leading-relaxed text-white/30">
            Globe Travel Voyage is an independent marketplace. Not a government agency, embassy or immigration authority.
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-soft-200 px-5 py-3.5 lg:hidden">
          <Link href="/" aria-label="Globe Travel Voyage">
            <Image
              src="/logo.png"
              alt="Globe Travel Voyage"
              width={300}
              height={80}
              className="h-[80px] w-auto object-contain"
              priority
              quality={100}
            />
          </Link>
          <Link href="/" className="text-xs text-charcoal/50 hover:text-navy transition-colors">
            ← Back to site
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step progress indicator ─────────────────────────────────────────────────

export function StepProgress({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  i < current
                    ? "bg-blue text-white"
                    : i === current
                    ? "bg-navy text-white ring-4 ring-navy/20"
                    : "bg-soft-200 text-charcoal/40"
                }`}
              >
                {i < current ? "✓" : i + 1}
              </div>
              <span className={`mt-1 text-[10px] font-semibold whitespace-nowrap ${i === current ? "text-navy" : "text-charcoal/40"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mb-5 h-0.5 flex-1 transition-colors duration-300 ${i < current ? "bg-blue" : "bg-soft-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function AuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-soft-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-4 text-xs text-charcoal/40">or continue with email</span>
      </div>
    </div>
  );
}

// ─── Legal consent ────────────────────────────────────────────────────────────

export function LegalConsent({ className }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded accent-blue shrink-0" />
        <span className="text-xs text-charcoal/60 group-hover:text-charcoal/80 transition-colors">
          I agree to the{" "}
          <Link href="/legal/terms" className="font-semibold text-blue hover:underline" target="_blank">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="font-semibold text-blue hover:underline" target="_blank">
            Privacy Policy
          </Link>
        </span>
      </label>
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded accent-blue shrink-0" />
        <span className="text-xs text-charcoal/60 group-hover:text-charcoal/80 transition-colors">
          I acknowledge the{" "}
          <Link href="/legal/disclaimer" className="font-semibold text-blue hover:underline" target="_blank">
            Platform Disclaimer
          </Link>
          : Globe Travel Voyage is not a government agency, embassy, immigration lawyer, airline or real estate broker. No visa approval or travel outcome is guaranteed.
        </span>
      </label>
    </div>
  );
}
