"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { isMissingTableError } from "./profile-utils";

export interface ProviderServiceRow {
  id: string;
  provider_user_id: string;
  provider_role: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  currency: string;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  lead_request_id: string | null;
  booking_request_id: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string | null;
}

export interface DocumentRow {
  id: string;
  user_id: string | null;
  request_id: string | null;
  file_name: string;
  file_url: string | null;
  file_type: string | null;
  status: string;
  created_at: string;
}

export interface PayoutAccountRow {
  id: string;
  user_id: string;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  onboarding_status: string;
}

export interface LeadRequestRow {
  id: string;
  customer_id: string | null;
  provider_user_id: string | null;
  user_id: string | null;
  service_type: string | null;
  title: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  customer_phone: string | null;
  message: string | null;
  lead_type: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export interface BookingRequestRow {
  id: string;
  customer_id: string | null;
  provider_user_id: string | null;
  user_id: string | null;
  service_type: string;
  service_name: string | null;
  title: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  customer_phone: string | null;
  message: string | null;
  status: string;
  travelers: number | null;
  budget: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface MarketplaceExpertRow {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  country: string | null;
  city: string | null;
  bio: string | null;
  services: string[] | null;
  is_verified: boolean;
  is_active: boolean;
}

export async function fetchProviderServices(
  userId: string,
  role: string
): Promise<{ services: ProviderServiceRow[]; tableMissing?: boolean }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { services: [] };

  const { data, error } = await supabase
    .from("provider_services")
    .select("*")
    .eq("provider_user_id", userId)
    .eq("provider_role", role)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) return { services: [], tableMissing: true };
    return { services: [] };
  }
  return { services: (data ?? []) as ProviderServiceRow[] };
}

export async function fetchCustomerLeadRequests(): Promise<LeadRequestRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("lead_requests")
    .select("*")
    .or(`user_id.eq.${user.id},customer_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as LeadRequestRow[];
}

export async function fetchCustomerBookingRequests(): Promise<BookingRequestRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("booking_requests")
    .select("*")
    .or(`user_id.eq.${user.id},customer_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as BookingRequestRow[];
}

export async function fetchProviderLeads(userId: string): Promise<LeadRequestRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("lead_requests")
    .select("*")
    .or(`provider_user_id.eq.${userId},expert_type.eq.visa_agent`)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as LeadRequestRow[];
}

export async function fetchProviderBookings(userId: string): Promise<BookingRequestRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("booking_requests")
    .select("*")
    .or(`provider_user_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as BookingRequestRow[];
}

export async function fetchUserMessages(): Promise<MessageRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as MessageRow[];
}

export async function fetchUserDocuments(): Promise<DocumentRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as DocumentRow[];
}

export async function fetchPayoutAccount(userId: string): Promise<PayoutAccountRow | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("provider_payout_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return data as PayoutAccountRow | null;
}

export interface MarketplaceAgencyRow {
  id: string;
  user_id: string;
  agency_name: string;
  description: string | null;
  services: string[] | null;
  registration_country: string | null;
  is_verified: boolean;
  rating: number;
  review_count: number;
}

export async function fetchMarketplaceAgencies(): Promise<MarketplaceAgencyRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("agencies")
    .select("id, user_id, agency_name, description, services, registration_country, verification_status, rating, review_count, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data?.length) return [];

  return (data as Array<{
    id: string;
    user_id: string;
    agency_name: string;
    description: string | null;
    services: string[] | null;
    registration_country: string | null;
    verification_status: string;
    rating: number;
    review_count: number;
  }>).map((a) => ({
    id: a.id,
    user_id: a.user_id,
    agency_name: a.agency_name,
    description: a.description,
    services: a.services,
    registration_country: a.registration_country,
    is_verified: a.verification_status === "verified",
    rating: Number(a.rating ?? 0),
    review_count: a.review_count ?? 0,
  }));
}

export async function fetchMarketplaceExperts(): Promise<MarketplaceExpertRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data: experts, error } = await admin
    .from("visa_experts")
    .select("id, user_id, bio, services, is_verified, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !experts?.length) return [];

  const userIds = [...new Set((experts as Array<{ user_id: string }>).map((e) => e.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email, country, city")
    .in("id", userIds);

  const profileMap = new Map(
    ((profiles ?? []) as Array<{ id: string; full_name: string | null; email: string; country: string | null; city: string | null }>).map(
      (p) => [p.id, p]
    )
  );

  return (experts as Array<{
    id: string;
    user_id: string;
    bio: string | null;
    services: string[] | null;
    is_verified: boolean;
    is_active: boolean;
  }>).map((e) => {
    const p = profileMap.get(e.user_id);
    return {
      id: e.id,
      user_id: e.user_id,
      full_name: p?.full_name ?? null,
      email: p?.email ?? "",
      country: p?.country ?? null,
      city: p?.city ?? null,
      bio: e.bio,
      services: e.services,
      is_verified: e.is_verified,
      is_active: e.is_active,
    };
  });
}

export async function fetchAdminReviews() {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("reviews")
    .select("id, rating, title, body, status, created_at, reviewer_id, target_type, target_id")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function fetchAdminProviders() {
  const admin = createAdminClient();
  if (!admin) return { experts: [], agencies: [], guides: [], hosts: [] };

  const [expertsRes, agenciesRes, guidesRes, hostsRes] = await Promise.all([
    admin.from("visa_experts").select("id, user_id, is_verified, is_active, created_at").order("created_at", { ascending: false }).limit(50),
    admin.from("agencies").select("id, user_id, name, is_verified, is_active, created_at").order("created_at", { ascending: false }).limit(50),
    admin.from("tour_guides").select("id, user_id, is_verified, is_active, created_at").order("created_at", { ascending: false }).limit(50),
    admin.from("property_hosts").select("id, user_id, is_verified, is_active, created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  return {
    experts: expertsRes.data ?? [],
    agencies: agenciesRes.data ?? [],
    guides: guidesRes.data ?? [],
    hosts: hostsRes.data ?? [],
  };
}

export async function fetchAdminProviderServices() {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("provider_services")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return [];
  return data ?? [];
}

export async function fetchAdminReferrals() {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}
