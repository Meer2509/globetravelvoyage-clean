"use server";

import { isSupabaseConfigured } from "@/lib/auth";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { isStripeConfigured } from "@/lib/stripe";
import { isStripeServerConfigured, isStripeWebhookConfigured } from "@/lib/stripe/server";
import { getSiteUrl, PRODUCTION_SITE_URL } from "@/lib/site-url";
import { getProductionAuditReport } from "@/lib/audit-status";
import { requireAdmin, getPlatformAdminEmail } from "@/lib/auth-server";

export interface LaunchCheckItem {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "info";
  detail: string;
  envKey?: string;
}

export interface LaunchChecklistReport {
  generatedAt: string;
  items: LaunchCheckItem[];
  summary: { pass: number; warn: number; fail: number };
  launchReadyScore: number;
  deployCommands: string[];
}

function scoreFromItems(items: LaunchCheckItem[]): number {
  const weighted = items.filter((i) => i.status !== "info");
  if (!weighted.length) return 0;
  const pass = weighted.filter((i) => i.status === "pass").length;
  const warn = weighted.filter((i) => i.status === "warn").length;
  return Math.round(((pass + warn * 0.5) / weighted.length) * 100);
}

export async function getLaunchChecklistReport(): Promise<LaunchChecklistReport> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return {
      generatedAt: new Date().toISOString(),
      items: [{ id: "auth", label: "Admin access", status: "fail", detail: auth.error }],
      summary: { pass: 0, warn: 0, fail: 1 },
      launchReadyScore: 0,
      deployCommands: [],
    };
  }

  const items: LaunchCheckItem[] = [];
  const siteUrl = getSiteUrl();

  items.push({
    id: "openai",
    label: "OpenAI (AI Concierge)",
    status: process.env.OPENAI_API_KEY?.trim() ? "pass" : "warn",
    detail: process.env.OPENAI_API_KEY?.trim()
      ? "OPENAI_API_KEY configured — concierge AI enabled"
      : "Add OPENAI_API_KEY for live AI concierge responses",
    envKey: "OPENAI_API_KEY",
  });

  items.push({
    id: "duffel",
    label: "Duffel (Flight search)",
    status: process.env.DUFFEL_ACCESS_TOKEN?.trim() ? "pass" : "warn",
    detail: process.env.DUFFEL_ACCESS_TOKEN?.trim()
      ? "DUFFEL_ACCESS_TOKEN configured — live flight search enabled"
      : "Add DUFFEL_ACCESS_TOKEN for live fare search on /flights",
    envKey: "DUFFEL_ACCESS_TOKEN",
  });

  items.push({
    id: "resend",
    label: "Resend (Email)",
    status: process.env.RESEND_API_KEY?.trim() ? "pass" : "warn",
    detail: process.env.RESEND_API_KEY?.trim()
      ? "RESEND_API_KEY configured — payment & intake emails live"
      : "Add RESEND_API_KEY + RESEND_FROM_EMAIL for transactional email",
    envKey: "RESEND_API_KEY",
  });

  items.push({
    id: "supabase_public",
    label: "Supabase (public)",
    status: isSupabaseConfigured ? "pass" : "fail",
    detail: isSupabaseConfigured
      ? "NEXT_PUBLIC_SUPABASE_URL and anon key configured"
      : "Missing Supabase public keys — auth and data disabled",
    envKey: "NEXT_PUBLIC_SUPABASE_URL",
  });

  items.push({
    id: "supabase_service",
    label: "Supabase (service role)",
    status: isAdminClientConfigured ? "pass" : "fail",
    detail: isAdminClientConfigured
      ? "SUPABASE_SERVICE_ROLE_KEY set — server-only, never exposed to client"
      : "SUPABASE_SERVICE_ROLE_KEY required for forms, payments, admin writes",
    envKey: "SUPABASE_SERVICE_ROLE_KEY",
  });

  items.push({
    id: "stripe_pub",
    label: "Stripe (publishable)",
    status: isStripeConfigured ? "pass" : "warn",
    detail: isStripeConfigured ? "Checkout UI enabled" : "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing",
    envKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  });

  items.push({
    id: "stripe_secret",
    label: "Stripe (secret + webhook)",
    status:
      isStripeServerConfigured() && isStripeWebhookConfigured()
        ? "pass"
        : isStripeServerConfigured()
          ? "warn"
          : "fail",
    detail:
      isStripeServerConfigured() && isStripeWebhookConfigured()
        ? "STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET configured"
        : isStripeServerConfigured()
          ? "Add STRIPE_WEBHOOK_SECRET for automatic payment fulfillment"
          : "STRIPE_SECRET_KEY missing",
    envKey: "STRIPE_SECRET_KEY",
  });

  items.push({
    id: "site_url",
    label: "Site URL",
    status: siteUrl.startsWith("https://") || siteUrl.includes("localhost") ? "pass" : "warn",
    detail: `Active site URL: ${siteUrl} (production: ${PRODUCTION_SITE_URL})`,
    envKey: "NEXT_PUBLIC_SITE_URL",
  });

  items.push({
    id: "admin_role",
    label: "Platform admin",
    status: auth.role === "admin" ? "pass" : "warn",
    detail:
      auth.role === "admin"
        ? `Signed in as admin (${getPlatformAdminEmail()} is platform owner email)`
        : "Ensure admin role in Supabase user_roles for platform operators",
  });

  const audit = await getProductionAuditReport();
  items.push({
    id: "db_tables",
    label: "Database tables",
    status: audit.summary.fail > 0 ? "fail" : audit.summary.warn > 5 ? "warn" : "pass",
    detail: `${audit.summary.pass} pass · ${audit.summary.warn} warn · ${audit.checks.filter((c) => c.id.startsWith("table_") && c.status === "warn").length} missing tables`,
  });

  items.push({
    id: "routes",
    label: "Core routes",
    status: "info",
    detail: `${audit.routesChecked}+ routes in audit scope — run npm run build before deploy`,
  });

  const summary = {
    pass: items.filter((i) => i.status === "pass").length,
    warn: items.filter((i) => i.status === "warn").length,
    fail: items.filter((i) => i.status === "fail").length,
  };

  return {
    generatedAt: new Date().toISOString(),
    items,
    summary,
    launchReadyScore: scoreFromItems(items),
    deployCommands: [
      "npm ci",
      "npm run build",
      "npx supabase db push   # or apply migrations 001–025 on production",
      "vercel --prod          # or your host deploy command",
      "stripe listen --forward-to localhost:3000/api/stripe/webhook  # local webhook test",
    ],
  };
}
