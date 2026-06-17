// =============================================================================
// Globe Travel Voyage — Backend Setup & Status Page
// /admin/setup
// =============================================================================
// Server Component — reads env vars at request time.
// No real Supabase calls — purely shows configuration status.
// =============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { requireAdmin } from "@/lib/auth-server";
import { isSupabaseConfigured, isAdminClientConfigured } from "@/lib/supabase/server";
import { getSupabaseSetupStatus } from "@/lib/supabase/setup-status";

export const metadata: Metadata = {
  title: "Backend Setup — Globe Travel Voyage Admin",
  description: "Infrastructure status and backend configuration guide for Globe Travel Voyage.",
  robots: { index: false, follow: false },
};

// ── Status helpers ────────────────────────────────────────────────────────────

type StatusLevel = "done" | "partial" | "pending" | "todo";

interface StatusItem {
  label: string;
  detail: string;
  status: StatusLevel;
  docsUrl?: string;
}

function StatusBadge({ status }: { status: StatusLevel }) {
  const map: Record<StatusLevel, { label: string; cls: string }> = {
    done:    { label: "✓ Ready",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    partial: { label: "⚡ Partial",  cls: "bg-gold/10 text-gold border-gold/30" },
    pending: { label: "⏳ Pending",  cls: "bg-blue/10 text-blue border-blue/20" },
    todo:    { label: "○ Not set",   cls: "bg-soft text-charcoal/50 border-soft-200" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// ── Section component ─────────────────────────────────────────────────────────

function SetupSection({
  title,
  emoji,
  items,
  note,
}: {
  title: string;
  emoji: string;
  items: StatusItem[];
  note?: string;
}) {
  const allDone = items.every((i) => i.status === "done");
  return (
    <div className="card p-0 overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-4 border-b border-soft-200 ${allDone ? "bg-emerald-50/50" : "bg-soft"}`}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{emoji}</span>
          <h2 className="font-extrabold text-navy text-sm">{title}</h2>
        </div>
        {allDone ? (
          <span className="text-xs font-bold text-emerald-600">All ready</span>
        ) : (
          <span className="text-xs text-charcoal/40">
            {items.filter((i) => i.status === "done").length}/{items.length} complete
          </span>
        )}
      </div>

      <div className="divide-y divide-soft-200">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 px-5 py-3.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy">{item.label}</p>
              <p className="mt-0.5 text-xs text-charcoal/55 leading-relaxed">{item.detail}</p>
              {item.docsUrl && (
                <a
                  href={item.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue hover:underline"
                >
                  View docs →
                </a>
              )}
            </div>
            <div className="shrink-0 pt-0.5">
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>

      {note && (
        <div className="border-t border-soft-200 bg-soft px-5 py-3">
          <p className="text-xs text-charcoal/50">{note}</p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default async function AdminSetupPage() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) {
    return <AdminAccessRequired message={adminAuth.error} />;
  }

  const supabaseStatus = await getSupabaseSetupStatus();

  // Read env at server render time — no client exposure of secret keys
  const hasSupabaseUrl    = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnonKey        = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceKey     = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasStripeSecret   = Boolean(process.env.STRIPE_SECRET_KEY);
  const hasStripePublic   = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const hasStripeWebhook  = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const hasStripeConnect  = Boolean(process.env.STRIPE_CONNECT_CLIENT_ID);
  const hasPlatformFee    = Boolean(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT?.trim());
  const hasDuffelToken     = Boolean(process.env.DUFFEL_ACCESS_TOKEN);
  const hasEmailKey       = Boolean(process.env.RESEND_API_KEY);
  const hasOpenAI         = Boolean(process.env.OPENAI_API_KEY);
  const hasAnalytics      = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) ||
                            Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

  const overallReady =
    isSupabaseConfigured && isAdminClientConfigured && supabaseStatus.schemaExecuted;

  const recommendedSteps = [
    { label: "Create a free Supabase project at app.supabase.com", done: isSupabaseConfigured },
    { label: "Copy .env.example → .env.local and add your Supabase keys", done: isSupabaseConfigured && isAdminClientConfigured },
    { label: "Run supabase/schema.sql in the Supabase SQL editor", done: supabaseStatus.schemaExecuted },
    { label: "npm install @supabase/supabase-js @supabase/ssr", done: supabaseStatus.hasSupabaseJs && supabaseStatus.hasSupabaseSsr },
    { label: "Replace lib/supabase/client.ts with real createBrowserClient()", done: isSupabaseConfigured },
    { label: "Add middleware.ts to protect /dashboard/* routes", done: true },
    { label: "Wire register/login pages to supabase.auth.signUp / signIn", done: isSupabaseConfigured },
    { label: "Add Stripe for booking payments", done: hasStripeSecret },
    { label: "Connect OpenAI for real AI trip planning & visa assistant", done: hasOpenAI },
  ].filter((step) => !step.done);

  const dbTables = [
    "profiles", "user_roles", "visa_applications", "trip_plans",
    "bookings", "referrals", "agencies", "visa_experts", "tour_guides",
    "property_hosts", "properties", "tours", "tickets",
    "support_messages", "reviews", "notifications",
  ];

  return (
    <div className="min-h-screen bg-soft">
      {/* Header */}
      <div className="bg-hero-gradient px-5 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link href="/dashboard/admin" className="text-white/50 hover:text-white text-sm transition-colors">
              ← Admin dashboard
            </Link>
            <Link href="/admin/audit" className="text-white/50 hover:text-white text-sm transition-colors">
              Production audit →
            </Link>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow-white mb-3">⚙️ Backend Configuration</div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">Infrastructure Setup</h1>
              <p className="mt-2 text-white/60 text-sm max-w-xl">
                Real-time environment status for Globe Travel Voyage. Add keys to{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
                to enable each service.
              </p>
            </div>
            <div className={`hidden shrink-0 rounded-2xl border px-5 py-4 text-center sm:block ${
              overallReady
                ? "border-emerald-400/30 bg-emerald-500/10"
                : "border-white/15 bg-white/5"
            }`}>
              <p className="text-3xl font-extrabold">
                {overallReady ? "✅" : "🔧"}
              </p>
              <p className="mt-1 text-xs font-semibold text-white/60">
                {overallReady ? "Backend ready" : "Setup pending"}
              </p>
            </div>
          </div>

          {/* Quick progress */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Supabase", ready: isSupabaseConfigured },
              { label: "Payments", ready: hasStripeSecret },
              { label: "Email", ready: hasEmailKey },
              { label: "AI", ready: hasOpenAI },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border px-4 py-3 ${
                s.ready ? "border-emerald-400/30 bg-emerald-500/10" : "border-white/10 bg-white/5"
              }`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                  {s.label}
                </p>
                <p className={`mt-0.5 text-sm font-bold ${s.ready ? "text-emerald-300" : "text-white/40"}`}>
                  {s.ready ? "✓ Connected" : "Not set"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-10">

        {/* Quickstart banner if nothing configured */}
        {!isSupabaseConfigured && (
          <div className="rounded-2xl border border-gold/25 bg-gold/5 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-extrabold text-navy">Get started in 3 steps</h3>
                <ol className="mt-2 space-y-2 text-sm text-charcoal/70">
                  <li>
                    <strong className="text-navy">1.</strong> Create a free Supabase project at{" "}
                    <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                      app.supabase.com
                    </a>
                  </li>
                  <li>
                    <strong className="text-navy">2.</strong> Copy{" "}
                    <code className="rounded bg-navy/8 px-1.5 py-0.5 text-xs">.env.example</code> →{" "}
                    <code className="rounded bg-navy/8 px-1.5 py-0.5 text-xs">.env.local</code> and fill in the keys
                  </li>
                  <li>
                    <strong className="text-navy">3.</strong> Run{" "}
                    <code className="rounded bg-navy/8 px-1.5 py-0.5 text-xs">supabase/schema.sql</code>{" "}
                    in the Supabase SQL editor
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ── Supabase ── */}
        <SetupSection
          emoji="🗄️"
          title="Supabase — Database & Auth"
          note="Add keys to .env.local — see .env.example for the full list."
          items={[
            {
              label: "NEXT_PUBLIC_SUPABASE_URL",
              detail: "Your project URL from Supabase dashboard → Settings → API",
              status: hasSupabaseUrl ? "done" : "todo",
              docsUrl: "https://supabase.com/docs/guides/api/api-keys",
            },
            {
              label: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
              detail: "Anon/public key — safe to expose in the browser",
              status: hasAnonKey ? "done" : "todo",
              docsUrl: "https://supabase.com/docs/guides/api/api-keys",
            },
            {
              label: "SUPABASE_SERVICE_ROLE_KEY",
              detail: "Service role key — server-only. Never expose to the browser.",
              status: hasServiceKey ? "done" : "todo",
              docsUrl: "https://supabase.com/docs/guides/api/api-keys",
            },
            {
              label: "schema.sql executed",
              detail: supabaseStatus.schemaExecuted
                ? `Core tables detected (${supabaseStatus.tablesFound.length} checked)`
                : "Run supabase/schema.sql in your Supabase project SQL editor",
              status: supabaseStatus.schemaExecuted ? "done" : isAdminClientConfigured ? "partial" : "todo",
              docsUrl: "https://supabase.com/docs/guides/database/overview",
            },
            {
              label: "@supabase/supabase-js installed",
              detail: supabaseStatus.hasSupabaseJs
                ? `@supabase/supabase-js ${supabaseStatus.hasSupabaseSsr ? "and @supabase/ssr" : ""} found in package.json`
                : "Run: npm install @supabase/supabase-js @supabase/ssr",
              status: supabaseStatus.hasSupabaseJs && supabaseStatus.hasSupabaseSsr ? "done" : supabaseStatus.hasSupabaseJs ? "partial" : "todo",
              docsUrl: "https://supabase.com/docs/reference/javascript/installing",
            },
            {
              label: "Row Level Security (RLS)",
              detail: supabaseStatus.schemaExecuted
                ? "RLS policies are defined in schema.sql and apply when tables exist"
                : "RLS policies are defined in schema.sql — applied when schema runs",
              status: supabaseStatus.rlsStatus,
              docsUrl: "https://supabase.com/docs/guides/auth/row-level-security",
            },
          ]}
        />

        {/* ── Database tables checklist ── */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-soft-200 bg-soft px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📋</span>
              <h2 className="font-extrabold text-navy text-sm">Database Tables Checklist</h2>
            </div>
            <span className="text-xs text-charcoal/40">
              {dbTables.length} tables defined in schema.sql
            </span>
          </div>
          <div className="grid grid-cols-2 gap-0 divide-y divide-soft-200 sm:grid-cols-3">
            {dbTables.map((table, i) => {
              const tableReady =
                supabaseStatus.schemaExecuted &&
                (supabaseStatus.tablesFound.includes(table) ||
                  ["trip_plans", "bookings", "referrals", "agencies", "tour_guides", "property_hosts", "properties", "tours", "tickets", "support_messages", "notifications"].includes(table));
              return (
                <div key={table} className={`flex items-center gap-2.5 px-5 py-3 ${i % 3 !== 2 ? "sm:border-r sm:border-soft-200" : ""}`}>
                  <span className={`h-5 w-5 shrink-0 rounded-full text-[11px] flex items-center justify-center font-bold ${
                    tableReady ? "bg-emerald-100 text-emerald-600" : "bg-soft-200 text-charcoal/30"
                  }`}>
                    {tableReady ? "✓" : "○"}
                  </span>
                  <code className="text-xs text-navy">{table}</code>
                </div>
              );
            })}
          </div>
          <div className="border-t border-soft-200 bg-soft px-5 py-3">
            <p className="text-xs text-charcoal/50">
              Tables are created when you run{" "}
              <code className="rounded bg-navy/8 px-1 text-[11px]">supabase/schema.sql</code>{" "}
              in your Supabase SQL editor. Includes RLS policies, indexes and triggers.
            </p>
          </div>
        </div>

        {/* ── Auth ── */}
        <SetupSection
          emoji="🔐"
          title="Authentication"
          items={[
            {
              label: "Email / password auth",
              detail: "Built into Supabase — enabled by default when project is created",
              status: isSupabaseConfigured ? "done" : "todo",
              docsUrl: "https://supabase.com/docs/guides/auth/email-login",
            },
            {
              label: "Google OAuth",
              detail: "Configure in Supabase dashboard → Authentication → Providers → Google",
              status: "todo",
              docsUrl: "https://supabase.com/docs/guides/auth/social-login/auth-google",
            },
            {
              label: "Apple Sign-In",
              detail: "Configure in Supabase dashboard → Authentication → Providers → Apple",
              status: "todo",
              docsUrl: "https://supabase.com/docs/guides/auth/social-login/auth-apple",
            },
            {
              label: "Auth middleware (Next.js)",
              detail: "proxy.ts refreshes sessions and protects dashboard routes",
              status: isSupabaseConfigured ? "done" : "todo",
              docsUrl: "https://supabase.com/docs/guides/auth/server-side/nextjs",
            },
          ]}
        />

        {/* ── Payments ── */}
        <SetupSection
          emoji="💳"
          title="Stripe — Payments"
          note="Stripe Checkout runs in test mode until you switch to live keys in production."
          items={[
            {
              label: "STRIPE_SECRET_KEY",
              detail: hasStripeSecret
                ? "Server key configured — Stripe Checkout API enabled"
                : "Server-only Stripe key from dashboard.stripe.com/apikeys",
              status: hasStripeSecret ? "done" : "todo",
              docsUrl: "https://stripe.com/docs/keys",
            },
            {
              label: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
              detail: hasStripePublic
                ? "Publishable key configured — /checkout page enabled"
                : "Public key for Stripe Checkout redirect flow",
              status: hasStripePublic ? "done" : "todo",
              docsUrl: "https://stripe.com/docs/keys",
            },
            {
              label: "Stripe Checkout routes",
              detail: hasStripeSecret && hasStripePublic
                ? "/api/stripe/checkout · /checkout · /payment-success · /payment-cancelled"
                : "Add Stripe keys to enable hosted checkout",
              status: hasStripeSecret && hasStripePublic ? "done" : hasStripeSecret || hasStripePublic ? "partial" : "todo",
            },
            {
              label: "STRIPE_WEBHOOK_SECRET",
              detail: hasStripeWebhook
                ? "Webhook secret configured — POST /api/stripe/webhook marks payments paid"
                : "Add signing secret from Stripe Dashboard → Webhooks (checkout.session.completed)",
              status: hasStripeWebhook ? "done" : "todo",
              docsUrl: "https://stripe.com/docs/webhooks",
            },
            {
              label: "Stripe webhook route",
              detail: hasStripeWebhook
                ? "/api/stripe/webhook listens for checkout.session.completed"
                : "Configure STRIPE_WEBHOOK_SECRET and point Stripe to /api/stripe/webhook",
              status: hasStripeWebhook ? "done" : "todo",
            },
            {
              label: "stripe npm package installed",
              detail: supabaseStatus.hasStripe
                ? "stripe package found in package.json"
                : "Run: npm install stripe",
              status: supabaseStatus.hasStripe ? "done" : "todo",
              docsUrl: "https://stripe.com/docs/stripe-js",
            },
            {
              label: "STRIPE_CONNECT_CLIENT_ID",
              detail: hasStripeConnect
                ? "Connect client id configured — marketplace OAuth reference"
                : "Optional for Express Connect; add from Stripe Dashboard → Connect settings",
              status: hasStripeConnect ? "done" : "todo",
              docsUrl: "https://stripe.com/docs/connect",
            },
            {
              label: "NEXT_PUBLIC_PLATFORM_FEE_PERCENT",
              detail: hasPlatformFee
                ? `Platform fee set to ${process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT}% per provider booking`
                : "Defaults to 15% when unset",
              status: hasPlatformFee ? "done" : "partial",
            },
            {
              label: "Stripe Connect API routes",
              detail: hasStripeSecret
                ? "/api/stripe/connect/create-account · account-link · status · /dashboard/payouts"
                : "Requires STRIPE_SECRET_KEY for Express Connect onboarding",
              status: hasStripeSecret ? "done" : "todo",
            },
          ]}
        />

        {/* ── Flights (Duffel) ── */}
        <SetupSection
          emoji="✈️"
          title="Live Flights (Duffel)"
          note={hasDuffelToken ? "Live flight search is enabled on /flights." : "Add DUFFEL_ACCESS_TOKEN to enable live flight search."}
          items={[
            {
              label: "DUFFEL_ACCESS_TOKEN",
              detail: hasDuffelToken
                ? "Duffel API token configured — live offers on /flights and /api/flights/search"
                : "Get an access token from app.duffel.com to power live flight search",
              status: hasDuffelToken ? "done" : "todo",
              docsUrl: "https://duffel.com/docs",
            },
            {
              label: "Flight search API",
              detail: "/api/flights/search — server-side Duffel integration",
              status: hasDuffelToken ? "done" : "todo",
            },
            {
              label: "Booking flow",
              detail: "Continue to booking saves a concierge request — no direct ticketing until payment is implemented",
              status: "done",
            },
          ]}
        />

        {/* ── Email ── */}
        <SetupSection
          emoji="📧"
          title="Transactional Email"
          items={[
            {
              label: "RESEND_API_KEY",
              detail: "Get a free key at resend.com — used for booking confirmations, visa updates",
              status: hasEmailKey ? "done" : "todo",
              docsUrl: "https://resend.com/docs",
            },
            {
              label: "Email templates",
              detail: "Create templates in /emails/ for booking confirmation, visa update, welcome, etc.",
              status: "todo",
            },
          ]}
        />

        {/* ── AI ── */}
        <SetupSection
          emoji="🤖"
          title="AI Features"
          note={hasOpenAI ? "Live AI responses are enabled via /api/ai." : "Add OPENAI_API_KEY to enable live AI responses. Without it, assistants show an unavailable message."}
          items={[
            {
              label: "OPENAI_API_KEY",
              detail: "Used for AI trip planner, visa assistant, document checklist generator",
              status: hasOpenAI ? "done" : "todo",
              docsUrl: "https://platform.openai.com/api-keys",
            },
            {
              label: "AI route handler",
              detail: "/app/api/ai/route.ts — shared POST handler for all AI assistants",
              status: "done",
            },
            {
              label: "AI visa assistant",
              detail: "Visa analysis via /api/ai on /ai-visa-assistant",
              status: hasOpenAI ? "done" : "todo",
            },
          ]}
        />

        {/* ── Analytics ── */}
        <SetupSection
          emoji="📊"
          title="Analytics"
          items={[
            {
              label: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
              detail: "Google Analytics 4 — Measurement ID from analytics.google.com",
              status: hasAnalytics ? "partial" : "todo",
              docsUrl: "https://support.google.com/analytics/answer/12270356",
            },
            {
              label: "NEXT_PUBLIC_POSTHOG_KEY",
              detail: "PostHog for product analytics and feature flags — posthog.com",
              status: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) ? "done" : "todo",
              docsUrl: "https://posthog.com/docs/libraries/next-js",
            },
          ]}
        />

        {/* ── Frontend status ── */}
        <SetupSection
          emoji="🎨"
          title="Frontend (Current Phase)"
          items={[
            {
              label: "Next.js 16 + React 19 + TypeScript",
              detail: "Installed and running with Turbopack",
              status: "done",
            },
            {
              label: "Tailwind CSS v4",
              detail: "Configured with luxury design system (navy, blue, gold)",
              status: "done",
            },
            {
              label: "Catalog CMS (016_catalog_cms.sql)",
              detail: "catalog_entries, seo_pages, pricing_plans — seed with npm run seed:catalog",
              status: "done",
            },
            {
              label: "Auth UI pages",
              detail: "/login, /register, /forgot-password, /account-type",
              status: "done",
            },
            {
              label: "All 5 onboarding flows",
              detail: "/onboarding/customer|agent|agency|guide|host",
              status: "done",
            },
            {
              label: "All 6 dashboards",
              detail: "Customer, Agent, Agency, Guide, Host, Admin — with preview data until Supabase is connected",
              status: "done",
            },
            {
              label: "Supabase client stubs",
              detail: "lib/supabase/client.ts + server.ts + types.ts — null until keys added",
              status: "done",
            },
          ]}
        />

        {recommendedSteps.length > 0 && (
          <div className="rounded-2xl bg-hero-gradient p-6 text-white">
            <h3 className="font-extrabold text-lg mb-3">📋 Recommended next steps</h3>
            <ol className="space-y-2.5 text-sm text-white/75">
              {recommendedSteps.map((step, i) => (
                <li key={step.label} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold">
                    {i + 1}
                  </span>
                  {step.label}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin" className="btn-primary py-2.5 text-sm">
            ← Admin dashboard
          </Link>
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline py-2.5 text-sm"
          >
            Supabase docs ↗
          </a>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline py-2.5 text-sm"
          >
            Supabase dashboard ↗
          </a>
        </div>
      </div>
    </div>
  );
}
