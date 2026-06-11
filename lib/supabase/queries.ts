"use server";

// =============================================================================
// Globe Travel Voyage — Supabase Dashboard Queries
// =============================================================================

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { normalizeUserRole } from "@/lib/auth";
import { checkDatabaseHealth } from "./database-health";
import { computeProfileCompletion, isMissingTableError } from "./profile-utils";
import type { Profile, UserRole, VisaExpert } from "./types";

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
    return { ok: false, reason: "not_configured", message: "Supabase is not configured. Dashboards are in demo mode." };
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
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("visa_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export interface AdminPaymentRow {
  id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  stripe_payment_id: string | null;
  payee_name: string | null;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
}

export async function fetchAdminPayments(): Promise<{
  payments: AdminPaymentRow[];
  error?: string;
  tableMissing?: boolean;
}> {
  const admin = createAdminClient();
  if (!admin) return { payments: [] };

  const { data, error } = await admin
    .from("payments")
    .select("id, user_id, amount, currency, status, description, stripe_payment_id, payee_name, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (isMissingTableError(error)) {
      return { payments: [], tableMissing: true, error: error.message };
    }
    return { payments: [], error: error.message };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    user_id: string | null;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    stripe_payment_id: string | null;
    payee_name: string | null;
    created_at: string;
  }>;

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
    customer_email: row.user_id ? profileMap[row.user_id]?.email ?? null : null,
  }));

  return { payments };
}

export async function fetchAdminBookingRequests() {
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

export async function fetchAgencyLeads() {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("lead_requests")
    .select("id, full_name, email, message, lead_type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function fetchAgencyBookings() {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("booking_requests")
    .select("id, service_type, service_name, full_name, status, created_at, travelers, budget")
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
