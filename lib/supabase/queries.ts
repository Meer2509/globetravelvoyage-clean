"use server";

// =============================================================================
// Globe Travel Voyage — Supabase Dashboard Queries
// =============================================================================

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";

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
