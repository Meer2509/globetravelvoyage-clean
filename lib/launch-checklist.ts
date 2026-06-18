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
  configured?: boolean;
}

export interface LaunchChecklistReport {
  generatedAt: string;
  items: LaunchCheckItem[];
  requiredEnv: LaunchCheckItem[];
  summary: { pass: number; warn: number; fail: number };
  launchReadyScore: number;
  deployCommands: string[];
}

const REQUIRED_PRODUCTION_ENV: Array<{
  id: string;
  key: string;
  label: string;
  hint: string;
  isSet: () => boolean;
  severity: "fail" | "warn";
}> = [
  {
    id: "env_supabase_service",
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase service role",
    hint: "Required for forms, admin writes, payments, and community",
    isSet: () => isAdminClientConfigured,
    severity: "fail",
  },
  {
    id: "env_openai",
    key: "OPENAI_API_KEY",
    label: "OpenAI (AI Concierge)",
    hint: "Required for live AI concierge responses",
    isSet: () => Boolean(process.env.OPENAI_API_KEY?.trim()),
    severity: "warn",
  },
  {
    id: "env_duffel",
    key: "DUFFEL_ACCESS_TOKEN",
    label: "Duffel (Flight search)",
    hint: "Required for live fare search on /flights",
    isSet: () => Boolean(process.env.DUFFEL_ACCESS_TOKEN?.trim()),
    severity: "warn",
  },
  {
    id: "env_resend_key",
    key: "RESEND_API_KEY",
    label: "Resend API key",
    hint: "Required for transactional email delivery",
    isSet: () => Boolean(process.env.RESEND_API_KEY?.trim()),
    severity: "warn",
  },
  {
    id: "env_resend_from",
    key: "RESEND_FROM_EMAIL",
    label: "Resend from address",
    hint: "Sender address for transactional email (verified domain in Resend)",
    isSet: () => Boolean(process.env.RESEND_FROM_EMAIL?.trim()),
    severity: "warn",
  },
  {
    id: "env_stripe_secret",
    key: "STRIPE_SECRET_KEY",
    label: "Stripe secret key",
    hint: "Required for checkout and payment fulfillment",
    isSet: () => isStripeServerConfigured(),
    severity: "fail",
  },
  {
    id: "env_stripe_publishable",
    key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    label: "Stripe publishable key",
    hint: "Required for checkout UI",
    isSet: () => isStripeConfigured,
    severity: "warn",
  },
  {
    id: "env_stripe_webhook",
    key: "STRIPE_WEBHOOK_SECRET",
    label: "Stripe webhook secret",
    hint: "Required for automatic payment fulfillment via webhook",
    isSet: () => isStripeWebhookConfigured(),
    severity: "warn",
  },
  {
    id: "env_site_url",
    key: "NEXT_PUBLIC_SITE_URL",
    label: "Site URL",
    hint: "Used for Stripe redirects and email links",
    isSet: () => Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    severity: "warn",
  },
  {
    id: "env_platform_admin",
    key: "PLATFORM_ADMIN_EMAIL",
    label: "Platform admin email",
    hint: "Primary operator inbox for admin access checks",
    isSet: () => Boolean(process.env.PLATFORM_ADMIN_EMAIL?.trim()),
    severity: "warn",
  },
];

function buildRequiredEnvItems(): LaunchCheckItem[] {
  return REQUIRED_PRODUCTION_ENV.map((entry) => {
    const configured = entry.isSet();
    return {
      id: entry.id,
      label: entry.label,
      envKey: entry.key,
      configured,
      status: configured ? "pass" : entry.severity,
      detail: configured ? "Configured" : `Missing — ${entry.hint}`,
    };
  });
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
      requiredEnv: [],
      summary: { pass: 0, warn: 0, fail: 1 },
      launchReadyScore: 0,
      deployCommands: [],
    };
  }

  const requiredEnv = buildRequiredEnvItems();
  const items: LaunchCheckItem[] = [...requiredEnv];
  const siteUrl = getSiteUrl();

  if (!isSupabaseConfigured) {
    items.push({
      id: "supabase_public",
      label: "Supabase public keys",
      status: "fail",
      detail: "Missing — NEXT_PUBLIC_SUPABASE_URL and anon key required for auth and data",
      envKey: "NEXT_PUBLIC_SUPABASE_URL",
      configured: false,
    });
  } else {
    items.push({
      id: "supabase_public",
      label: "Supabase public keys",
      status: "pass",
      detail: "Configured — NEXT_PUBLIC_SUPABASE_URL and anon key present",
      envKey: "NEXT_PUBLIC_SUPABASE_URL",
      configured: true,
    });
  }

  items.push({
    id: "site_url_active",
    label: "Active site URL",
    status: siteUrl.startsWith("https://") || siteUrl.includes("localhost") ? "pass" : "warn",
    detail: `Resolved URL: ${siteUrl} (production target: ${PRODUCTION_SITE_URL})`,
    envKey: "NEXT_PUBLIC_SITE_URL",
    configured: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
  });

  items.push({
    id: "admin_role",
    label: "Platform admin session",
    status: auth.role === "admin" ? "pass" : "warn",
    detail:
      auth.role === "admin"
        ? `Signed in as admin (platform owner: ${getPlatformAdminEmail()})`
        : "Ensure admin role in Supabase user_roles for platform operators",
    configured: auth.role === "admin",
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
    requiredEnv,
    summary,
    launchReadyScore: scoreFromItems(items),
    deployCommands: [
      "npm ci",
      "npm run build",
      "npx supabase db push   # or apply migrations 001–026 on production",
      "vercel --prod          # or your host deploy command",
      "stripe listen --forward-to localhost:3000/api/stripe/webhook  # local webhook test",
    ],
  };
}
