"use server";

// =============================================================================
// Globe Travel Voyage — Supabase Dashboard Queries
// =============================================================================

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { normalizeUserRole } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-server";
import { checkDatabaseHealth } from "./database-health";
import { computeProfileCompletion, isMissingTableError } from "./profile-utils";
import type { Profile, UserRole, VisaExpert } from "./types";

async function requireAdminDashboard(): Promise<{ ok: true } | { ok: false; error: string }> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };
  return { ok: true };
}

export type DashboardUserResult =
  | {
      ok: true;
      profile: Profile;
      role: UserRole;
      visaExpert: VisaExpert | null;
      completion: number;
      missingFields: string[];
    }
  | {
      ok: false;
      reason: "not_configured" | "not_authenticated" | "table_missing" | "error";
      message: string;
    };

export interface AdminProfileRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  role: string | null;
  company_name: string | null;
  created_at: string;
  is_active: boolean;
}

export async function fetchDashboardUser(): Promise<DashboardUserResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, reason: "not_configured", message: "Supabase is not configured. Sign in is required to view your dashboard." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, reason: "not_authenticated", message: "Please sign in to view your dashboard." };
  }

  const health = await checkDatabaseHealth();
  if (!health.tables.profiles) {
    return { ok: false, reason: "table_missing", message: health.message };
  }

  const profileRes = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (profileRes.error && isMissingTableError(profileRes.error)) {
    return { ok: false, reason: "table_missing", message: health.message };
  }

  const roleRes = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const role = normalizeUserRole(
    (roleRes.data as { role: string } | null)?.role ??
    (profileRes.data as Profile | null)?.role ??
    (user.user_metadata?.role as string | undefined)
  );

  let visaExpert: VisaExpert | null = null;
  if (role === "visa_agent") {
    const expertRes = await supabase
      .from("visa_experts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!expertRes.error) {
      visaExpert = expertRes.data as VisaExpert | null;
    }
  }

  const profile: Profile = profileRes.data ?? {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string) ?? null,
    avatar_url: null,
    phone: (user.user_metadata?.phone as string) ?? null,
    country: (user.user_metadata?.country as string) ?? null,
    city: (user.user_metadata?.city as string) ?? null,
    nationality: null,
    passport_country: null,
    preferred_currency: "USD",
    preferred_language: "en",
    bio: null,
    role: role,
    company_name: null,
    business_type: null,
    travel_interests: null,
    is_active: true,
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };

  const { percent, missing } = computeProfileCompletion(profile, role, visaExpert);

  return {
    ok: true,
    profile,
    role,
    visaExpert,
    completion: percent,
    missingFields: missing,
  };
}

export async function fetchAdminProfiles(): Promise<{
  profiles: AdminProfileRow[];
  error?: string;
  tableMissing?: boolean;
}> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return { profiles: [], error: gate.error };

  const admin = createAdminClient();
  if (!admin) return { profiles: [] };

  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, country, city, role, company_name, created_at, is_active")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (isMissingTableError(error)) {
      return { profiles: [], tableMissing: true, error: error.message };
    }
    return { profiles: [], error: error.message };
  }

  return { profiles: (data as AdminProfileRow[]) ?? [] };
}

export interface CustomerDashboardData {
  profile: { full_name: string | null; email: string } | null;
  visaRequests: Array<{
    id: string;
    destination: string;
    purpose: string | null;
    status: string;
    created_at: string;
  }>;
  bookingRequests: Array<{
    id: string;
    service_type: string;
    service_name: string | null;
    status: string;
    created_at: string;
  }>;
  supportTickets: Array<{
    id: string;
    subject: string;
    status: string;
    created_at: string;
  }>;
}

export interface AdminDashboardCounts {
  users: number;
  visaRequests: number;
  bookingRequests: number;
  leadRequests: number;
  propertyListings: number;
  supportTickets: number;
  referrals: number;
  payments: number;
}

export async function fetchCustomerDashboard(): Promise<CustomerDashboardData | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, visaRes, bookingRes, supportRes] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
    supabase.from("visa_requests").select("id, destination, purpose, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("booking_requests").select("id, service_type, service_name, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("support_messages").select("id, subject, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);

  return {
    profile: profileRes.data,
    visaRequests: visaRes.data ?? [],
    bookingRequests: bookingRes.data ?? [],
    supportTickets: supportRes.data ?? [],
  };
}

export async function fetchAdminCounts(): Promise<AdminDashboardCounts | null> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return null;

  const admin = createAdminClient();
  if (!admin) return null;

  const tables = [
    "profiles",
    "visa_requests",
    "booking_requests",
    "lead_requests",
    "property_listings",
    "support_messages",
    "referrals",
    "payments",
  ] as const;

  const counts: Record<string, number> = {};

  await Promise.all(
    tables.map(async (table) => {
      const { count } = await admin.from(table).select("*", { count: "exact", head: true });
      counts[table] = count ?? 0;
    })
  );

  return {
    users: counts.profiles ?? 0,
    visaRequests: counts.visa_requests ?? 0,
    bookingRequests: counts.booking_requests ?? 0,
    leadRequests: counts.lead_requests ?? 0,
    propertyListings: counts.property_listings ?? 0,
    supportTickets: counts.support_messages ?? 0,
    referrals: counts.referrals ?? 0,
    payments: counts.payments ?? 0,
  };
}

export async function fetchAdminVisaRequests() {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("visa_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export interface PaymentRow {
  id: string;
  user_id: string | null;
  email: string | null;
  service_type: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_id: string | null;
  invoice_number: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface AdminPaymentRow extends PaymentRow {
  customer_name: string | null;
  customer_email: string | null;
}

export async function fetchProviderPayments(): Promise<PaymentRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, user_id, email, service_type, amount, currency, status, description, stripe_session_id, stripe_payment_intent_id, stripe_payment_id, created_at, paid_at"
    )
    .eq("provider_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as PaymentRow[];
}

export async function fetchCustomerPayments(): Promise<PaymentRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, user_id, email, service_type, amount, currency, status, description, stripe_session_id, stripe_payment_intent_id, stripe_payment_id, invoice_number, created_at, paid_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as PaymentRow[];
}

export async function fetchAdminPayments(): Promise<{
  payments: AdminPaymentRow[];
  error?: string;
  tableMissing?: boolean;
}> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return { payments: [], error: gate.error };

  const admin = createAdminClient();
  if (!admin) return { payments: [] };

  const { data, error } = await admin
    .from("payments")
    .select(
      "id, user_id, email, service_type, amount, currency, status, description, stripe_session_id, stripe_payment_intent_id, stripe_payment_id, invoice_number, created_at, paid_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (isMissingTableError(error)) {
      return { payments: [], tableMissing: true, error: error.message };
    }
    return { payments: [], error: error.message };
  }

  const rows = (data ?? []) as PaymentRow[];

  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];
  const profileMap: Record<string, { full_name: string | null; email: string }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    for (const p of (profiles ?? []) as Array<{ id: string; full_name: string | null; email: string }>) {
      profileMap[p.id] = { full_name: p.full_name, email: p.email };
    }
  }

  const payments: AdminPaymentRow[] = rows.map((row) => ({
    ...row,
    customer_name: row.user_id ? profileMap[row.user_id]?.full_name ?? null : null,
    customer_email: row.email ?? (row.user_id ? profileMap[row.user_id]?.email ?? null : null),
  }));

  return { payments };
}

export async function fetchAdminBookingRequests() {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function fetchAdminSupportTickets() {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export interface RoleDashboardSummary {
  visaRequests: number;
  bookingRequests: number;
  leadRequests: number;
  propertyListings: number;
  tourListings: number;
  supportTickets: number;
}

export async function fetchRoleDashboardSummary(): Promise<RoleDashboardSummary | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [visaRes, bookingRes, leadRes, propertyRes, tourRes, supportRes] = await Promise.all([
    supabase.from("visa_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("lead_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("property_listings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("tour_listings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("support_messages").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return {
    visaRequests: visaRes.count ?? 0,
    bookingRequests: bookingRes.count ?? 0,
    leadRequests: leadRes.count ?? 0,
    propertyListings: propertyRes.count ?? 0,
    tourListings: tourRes.count ?? 0,
    supportTickets: supportRes.count ?? 0,
  };
}

/** Pending intake items visible to visa agents (unassigned queue). */
export async function fetchAgentIntakeQueue() {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("visa_requests")
    .select("id, full_name, email, nationality, destination, purpose, status, created_at")
    .in("status", ["pending", "reviewing"])
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function fetchAgencyLeads(userId: string) {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("lead_requests")
    .select("id, full_name, email, message, lead_type, status, created_at")
    .eq("provider_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function fetchAgencyBookings(userId: string) {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("booking_requests")
    .select("id, service_type, service_name, full_name, status, created_at, travelers, budget")
    .eq("provider_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function fetchHostListings() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("property_listings")
    .select("id, title, city, listing_type, price, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function fetchGuideTours() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("tour_listings")
    .select("id, title, city, tour_type, price, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export interface AdminVisaCaseRow {
  id: string;
  case_number: string;
  user_id: string;
  service_name: string;
  status: string;
  progress_percent: number;
  payment_id: string | null;
  booking_id: string | null;
  created_at: string;
  documents_total?: number;
  documents_uploaded?: number;
  documents_prepared?: number;
  documents_reviewed?: number;
}

export interface AdminEmailLogRow {
  id: string;
  user_id: string | null;
  email: string;
  subject: string;
  type: string;
  status: string;
  created_at: string;
}

export interface AdminStripeBookingRow {
  id: string;
  user_id: string | null;
  booking_type: string;
  listing_title: string | null;
  status: string;
  total_amount: number | null;
  currency: string | null;
  payment_id: string | null;
  created_at: string;
}

export async function fetchAdminVisaCases(): Promise<{
  cases: AdminVisaCaseRow[];
  error?: string;
  tableMissing?: boolean;
}> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return { cases: [], error: gate.error };

  const admin = createAdminClient();
  if (!admin) return { cases: [] };

  const { data, error } = await admin
    .from("visa_cases")
    .select("id, case_number, user_id, service_name, status, progress_percent, payment_id, booking_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingTableError(error)) {
      return { cases: [], tableMissing: true, error: "visa_cases table missing — run migration 010_launch_platform.sql" };
    }
    return { cases: [], error: error.message };
  }

  const cases = (data ?? []) as AdminVisaCaseRow[];
  const enriched: AdminVisaCaseRow[] = [];

  for (const c of cases) {
    const { data: docs } = await admin
      .from("case_documents")
      .select("status")
      .eq("case_id", c.id);

    const statuses = (docs ?? []).map((d) => (d as { status: string }).status);
    enriched.push({
      ...c,
      documents_total: statuses.length,
      documents_uploaded: statuses.filter((s) => s === "uploaded").length,
      documents_prepared: statuses.filter((s) => s === "prepared").length,
      documents_reviewed: statuses.filter((s) => s === "reviewed").length,
    });
  }

  return { cases: enriched };
}

export async function fetchAdminStripeBookings(): Promise<{
  bookings: AdminStripeBookingRow[];
  error?: string;
  tableMissing?: boolean;
}> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return { bookings: [], error: gate.error };

  const admin = createAdminClient();
  if (!admin) return { bookings: [] };

  const { data, error } = await admin
    .from("bookings")
    .select("id, user_id, booking_type, listing_title, status, total_amount, currency, payment_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingTableError(error)) {
      return { bookings: [], tableMissing: true, error: "bookings table missing" };
    }
    return { bookings: [], error: error.message };
  }
  return { bookings: (data ?? []) as AdminStripeBookingRow[] };
}

export async function fetchAdminEmailLogs(): Promise<{
  logs: AdminEmailLogRow[];
  error?: string;
  tableMissing?: boolean;
}> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return { logs: [], error: gate.error };

  const admin = createAdminClient();
  if (!admin) return { logs: [] };

  const { data, error } = await admin
    .from("email_logs")
    .select("id, user_id, email, subject, type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingTableError(error)) {
      return { logs: [], tableMissing: true, error: "email_logs table missing — run migration 010_launch_platform.sql" };
    }
    return { logs: [], error: error.message };
  }
  return { logs: (data ?? []) as AdminEmailLogRow[] };
}

// ─── Admin operational data ───────────────────────────────────────────────────

export interface AdminVerificationItem {
  id: string;
  name: string;
  type: string;
  country: string | null;
  submitted: string;
  status: string;
  providerTable: "agencies" | "visa_experts" | "tour_guides" | "property_hosts";
}

export interface AdminAgencyRow {
  id: string;
  agency_name: string;
  country: string | null;
  services: string[] | null;
  verification_status: string;
  is_active: boolean;
  total_packages: number;
  rating: number;
  review_count: number;
  created_at: string;
}

export interface AdminGuideRow {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  languages: string[] | null;
  verification_status: string;
  is_active: boolean;
  rating: number;
  review_count: number;
  total_tours_led: number;
  created_at: string;
}

export interface AdminReferralRow {
  id: string;
  referral_code: string;
  referrer_name: string | null;
  referrer_email: string | null;
  referred_name: string | null;
  status: string;
  commission_usd: number;
  created_at: string;
  paid_at: string | null;
}

export interface AdminReviewRow {
  id: string;
  reviewer_name: string | null;
  target_type: string;
  target_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface AdminExpertRow {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  verification_status: string;
  is_active: boolean;
  created_at: string;
}

function formatAdminDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function profileNameMap(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  userIds: string[]
): Promise<Map<string, { full_name: string | null; email: string; country: string | null }>> {
  if (userIds.length === 0) return new Map();

  const { data } = await admin
    .from("profiles")
    .select("id, full_name, email, country")
    .in("id", userIds);

  return new Map(
    ((data ?? []) as Array<{ id: string; full_name: string | null; email: string; country: string | null }>).map(
      (p) => [p.id, p]
    )
  );
}

export async function fetchAdminVerificationQueue(): Promise<AdminVerificationItem[]> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const pendingFilter = ["pending", "under_review"];

  const [agenciesRes, expertsRes, guidesRes, hostsRes] = await Promise.all([
    admin
      .from("agencies")
      .select("id, agency_name, registration_country, verification_status, created_at, user_id")
      .in("verification_status", pendingFilter)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("visa_experts")
      .select("id, full_name, country, verification_status, created_at, user_id")
      .in("verification_status", pendingFilter)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("tour_guides")
      .select("id, guide_country, verification_status, created_at, user_id")
      .in("verification_status", pendingFilter)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("property_hosts")
      .select("id, verification_status, created_at, user_id")
      .in("verification_status", pendingFilter)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const userIds = [
    ...((agenciesRes.data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id),
    ...((expertsRes.data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id),
    ...((guidesRes.data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id),
    ...((hostsRes.data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id),
  ];
  const profiles = await profileNameMap(admin, [...new Set(userIds)]);

  const items: AdminVerificationItem[] = [];

  for (const row of (agenciesRes.data ?? []) as Array<{
    id: string;
    agency_name: string;
    registration_country: string | null;
    verification_status: string;
    created_at: string;
    user_id: string;
  }>) {
    const profile = profiles.get(row.user_id);
    items.push({
      id: row.id,
      name: row.agency_name || profile?.full_name || "Agency",
      type: "Agency",
      country: row.registration_country ?? profile?.country ?? null,
      submitted: formatAdminDate(row.created_at),
      status: row.verification_status,
      providerTable: "agencies",
    });
  }

  for (const row of (expertsRes.data ?? []) as Array<{
    id: string;
    full_name: string | null;
    country: string | null;
    verification_status: string;
    created_at: string;
    user_id: string;
  }>) {
    const profile = profiles.get(row.user_id);
    items.push({
      id: row.id,
      name: row.full_name || profile?.full_name || profile?.email || "Visa Expert",
      type: "Visa Expert",
      country: row.country ?? profile?.country ?? null,
      submitted: formatAdminDate(row.created_at),
      status: row.verification_status,
      providerTable: "visa_experts",
    });
  }

  for (const row of (guidesRes.data ?? []) as Array<{
    id: string;
    guide_country: string | null;
    verification_status: string;
    created_at: string;
    user_id: string;
  }>) {
    const profile = profiles.get(row.user_id);
    items.push({
      id: row.id,
      name: profile?.full_name || profile?.email || "Tour Guide",
      type: "Tour Guide",
      country: row.guide_country ?? profile?.country ?? null,
      submitted: formatAdminDate(row.created_at),
      status: row.verification_status,
      providerTable: "tour_guides",
    });
  }

  for (const row of (hostsRes.data ?? []) as Array<{
    id: string;
    verification_status: string;
    created_at: string;
    user_id: string;
  }>) {
    const profile = profiles.get(row.user_id);
    items.push({
      id: row.id,
      name: profile?.full_name || profile?.email || "Property Host",
      type: "Host",
      country: profile?.country ?? null,
      submitted: formatAdminDate(row.created_at),
      status: row.verification_status,
      providerTable: "property_hosts",
    });
  }

  return items.sort((a, b) => b.submitted.localeCompare(a.submitted));
}

export async function fetchAdminAgencies(): Promise<AdminAgencyRow[]> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("agencies")
    .select(
      "id, agency_name, registration_country, services, verification_status, is_active, total_packages, rating, review_count, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return (data as Array<{
    id: string;
    agency_name: string;
    registration_country: string | null;
    services: string[] | null;
    verification_status: string;
    is_active: boolean;
    total_packages: number;
    rating: number;
    review_count: number;
    created_at: string;
  }>).map((a) => ({
    id: a.id,
    agency_name: a.agency_name,
    country: a.registration_country,
    services: a.services,
    verification_status: a.verification_status,
    is_active: a.is_active,
    total_packages: a.total_packages ?? 0,
    rating: Number(a.rating ?? 0),
    review_count: a.review_count ?? 0,
    created_at: a.created_at,
  }));
}

export async function fetchAdminGuides(): Promise<AdminGuideRow[]> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("tour_guides")
    .select(
      "id, user_id, guide_city, guide_country, languages, verification_status, is_active, rating, review_count, total_tours_led, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const userIds = (data as Array<{ user_id: string }>).map((g) => g.user_id);
  const profiles = await profileNameMap(admin, userIds);

  return (data as Array<{
    id: string;
    user_id: string;
    guide_city: string | null;
    guide_country: string | null;
    languages: string[] | null;
    verification_status: string;
    is_active: boolean;
    rating: number;
    review_count: number;
    total_tours_led: number;
    created_at: string;
  }>).map((g) => {
    const profile = profiles.get(g.user_id);
    return {
      id: g.id,
      name: profile?.full_name || profile?.email || "Tour Guide",
      city: g.guide_city,
      country: g.guide_country ?? profile?.country ?? null,
      languages: g.languages,
      verification_status: g.verification_status,
      is_active: g.is_active,
      rating: Number(g.rating ?? 0),
      review_count: g.review_count ?? 0,
      total_tours_led: g.total_tours_led ?? 0,
      created_at: g.created_at,
    };
  });
}

export async function fetchAdminExperts(): Promise<AdminExpertRow[]> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("visa_experts")
    .select("id, user_id, full_name, country, city, verification_status, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const userIds = (data as Array<{ user_id: string }>).map((e) => e.user_id);
  const profiles = await profileNameMap(admin, userIds);

  return (data as Array<{
    id: string;
    user_id: string;
    full_name: string | null;
    country: string | null;
    city: string | null;
    verification_status: string;
    is_active: boolean;
    created_at: string;
  }>).map((e) => {
    const profile = profiles.get(e.user_id);
    return {
      id: e.id,
      name: e.full_name || profile?.full_name || profile?.email || "Visa Expert",
      country: e.country ?? profile?.country ?? null,
      city: e.city,
      verification_status: e.verification_status,
      is_active: e.is_active,
      created_at: e.created_at,
    };
  });
}

export async function fetchAdminReferralRows(): Promise<AdminReferralRow[]> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("referrals")
    .select("id, referrer_id, referred_id, referral_code, status, commission_usd, created_at, paid_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const userIds = [
    ...((data ?? []) as Array<{ referrer_id: string; referred_id: string | null }>).map((r) => r.referrer_id),
    ...((data ?? []) as Array<{ referred_id: string | null }>)
      .map((r) => r.referred_id)
      .filter((id): id is string => Boolean(id)),
  ];
  const profiles = await profileNameMap(admin, [...new Set(userIds)]);

  return (data as Array<{
    id: string;
    referrer_id: string;
    referred_id: string | null;
    referral_code: string;
    status: string;
    commission_usd: number;
    created_at: string;
    paid_at: string | null;
  }>).map((r) => {
    const referrer = profiles.get(r.referrer_id);
    const referred = r.referred_id ? profiles.get(r.referred_id) : undefined;
    return {
      id: r.id,
      referral_code: r.referral_code,
      referrer_name: referrer?.full_name ?? null,
      referrer_email: referrer?.email ?? null,
      referred_name: referred?.full_name ?? null,
      status: r.status,
      commission_usd: Number(r.commission_usd ?? 0),
      created_at: r.created_at,
      paid_at: r.paid_at,
    };
  });
}

export async function fetchAdminReviewRows(): Promise<AdminReviewRow[]> {
  const gate = await requireAdminDashboard();
  if (!gate.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("reviews")
    .select("id, reviewer_id, target_type, target_id, rating, title, body, is_verified, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const userIds = (data as Array<{ reviewer_id: string }>).map((r) => r.reviewer_id);
  const profiles = await profileNameMap(admin, userIds);

  return (data as Array<{
    id: string;
    reviewer_id: string;
    target_type: string;
    target_id: string;
    rating: number;
    title: string | null;
    body: string | null;
    is_verified: boolean;
    created_at: string;
  }>).map((r) => {
    const reviewer = profiles.get(r.reviewer_id);
    return {
      id: r.id,
      reviewer_name: reviewer?.full_name || reviewer?.email || null,
      target_type: r.target_type,
      target_id: r.target_id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      is_verified: r.is_verified,
      created_at: r.created_at,
    };
  });
}
