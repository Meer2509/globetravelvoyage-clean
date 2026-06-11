"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { ensureUserProfile, upsertVisaExpertForProfile } from "./ensure-user-profile";
import { checkDatabaseHealth } from "./database-health";
import { isMissingTableError } from "./profile-utils";
import { parseExpertServices, serializeExpertServices, type ExpertService } from "@/lib/expert-services";

export type AgentDataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; tableMissing?: boolean };

async function getExpertIdForUser(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("visa_experts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as { id: string } | null)?.id ?? null;
}

export interface AgentApplicationRow {
  id: string;
  visa_type: string;
  destination_country: string;
  origin_country: string;
  status: string;
  created_at: string;
  applicant_name: string | null;
  notes: string | null;
}

export interface AgentLeadRow {
  id: string;
  full_name: string;
  email: string;
  message: string | null;
  lead_type: string | null;
  expert_type: string | null;
  status: string;
  created_at: string;
}

export interface AgentReviewRow {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  reviewer_name: string | null;
}

export interface AgentPaymentRow {
  id: string;
  email: string | null;
  service_type: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  stripe_session_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface AgentDashboardData {
  applications: AgentApplicationRow[];
  leads: AgentLeadRow[];
  reviews: AgentReviewRow[];
  payments: AgentPaymentRow[];
  services: ExpertService[];
  totalEarnings: number;
}

export async function fetchAgentDashboardData(): Promise<AgentDataResult<AgentDashboardData>> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const expertId = await getExpertIdForUser(user.id);

  const [expertRes, appsRes, leadsRes, reviewsRes, paymentsRes] = await Promise.all([
    admin.from("visa_experts").select("services").eq("user_id", user.id).maybeSingle(),
    expertId
      ? admin
          .from("visa_applications")
          .select("id, visa_type, destination_country, origin_country, status, created_at, applicant_id, notes")
          .eq("agent_id", expertId)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    admin
      .from("lead_requests")
      .select("id, full_name, email, message, lead_type, expert_type, status, created_at")
      .eq("provider_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    expertId
      ? admin
          .from("reviews")
          .select("id, rating, title, body, created_at, reviewer_id")
          .eq("target_type", "visa_agent")
          .eq("target_id", expertId)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    admin
      .from("payments")
      .select("id, email, service_type, amount, currency, status, description, stripe_session_id, created_at, paid_at")
      .eq("provider_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const health = await checkDatabaseHealth();
  if (!health.tables.profiles || !health.tables.visa_experts) {
    return { ok: false, error: health.message, tableMissing: true };
  }

  if (expertRes.error && isMissingTableError(expertRes.error)) {
    return { ok: false, error: health.message, tableMissing: true };
  }

  const applicantIds = [
    ...new Set(
      ((appsRes.data ?? []) as Array<{ applicant_id: string }>).map((a) => a.applicant_id)
    ),
  ];

  const reviewerIds = [
    ...new Set(
      ((reviewsRes.data ?? []) as Array<{ reviewer_id: string }>).map((r) => r.reviewer_id)
    ),
  ];

  const profileIds = [...new Set([...applicantIds, ...reviewerIds])];
  const nameMap: Record<string, string> = {};

  if (profileIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", profileIds);

    for (const p of (profiles ?? []) as Array<{ id: string; full_name: string | null; email: string }>) {
      nameMap[p.id] = p.full_name ?? p.email;
    }
  }

  const applications: AgentApplicationRow[] = ((appsRes.error ? [] : (appsRes.data ?? [])) as Array<{
    id: string;
    visa_type: string;
    destination_country: string;
    origin_country: string;
    status: string;
    created_at: string;
    applicant_id: string;
    notes: string | null;
  }>).map((row) => ({
    id: row.id,
    visa_type: row.visa_type,
    destination_country: row.destination_country,
    origin_country: row.origin_country,
    status: row.status,
    created_at: row.created_at,
    applicant_name: nameMap[row.applicant_id] ?? null,
    notes: row.notes,
  }));

  const leads: AgentLeadRow[] = leadsRes.error ? [] : ((leadsRes.data ?? []) as AgentLeadRow[]);
  const reviews: AgentReviewRow[] = ((reviewsRes.error ? [] : (reviewsRes.data ?? [])) as Array<{
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    created_at: string;
    reviewer_id: string;
  }>).map((row) => ({
    id: row.id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    created_at: row.created_at,
    reviewer_name: nameMap[row.reviewer_id] ?? null,
  }));

  const payments: AgentPaymentRow[] = paymentsRes.error
    ? []
    : ((paymentsRes.data ?? []) as AgentPaymentRow[]);
  const services = parseExpertServices(
    (expertRes.data as { services: string[] | null } | null)?.services
  );

  const totalEarnings = payments
    .filter((p) => p.status === "paid" || p.status === "settled")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return {
    ok: true,
    data: { applications, leads, reviews, payments, services, totalEarnings },
  };
}

export async function saveExpertServices(services: ExpertService[]): Promise<AgentDataResult<ExpertService[]>> {
  const profileResult = await ensureUserProfile();
  if (!profileResult.ok) return { ok: false, error: profileResult.error };

  const serialized = serializeExpertServices(services);
  const expertResult = await upsertVisaExpertForProfile(profileResult.profile, {
    services: serialized,
  });

  if (!expertResult.ok) return { ok: false, error: expertResult.error };

  return { ok: true, data: services };
}
