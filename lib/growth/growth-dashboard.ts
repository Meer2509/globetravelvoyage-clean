"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { requireAdmin } from "@/lib/auth-server";
import type { FunnelStage, GrowthDashboardReport, SourceAttributionRow } from "./types";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function rate(current: number, previous: number): number | undefined {
  if (previous <= 0) return undefined;
  return Math.round((current / previous) * 1000) / 10;
}

async function countEventsSince(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  eventType: string,
  since: string
): Promise<number> {
  const { count, error } = await admin
    .from("growth_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", eventType)
    .gte("created_at", since);

  if (error) {
    if (!isMissingTableError(error)) console.error("[growth] count failed", eventType, error.message);
    return 0;
  }
  return count ?? 0;
}

async function countTableSince(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  table: string,
  since: string
): Promise<number> {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);

  if (error) {
    if (!isMissingTableError(error)) console.error("[growth] table count failed", table, error.message);
    return 0;
  }
  return count ?? 0;
}

function buildFunnel(stages: Array<{ id: string; label: string; count: number }>): FunnelStage[] {
  return stages.map((stage, index) => ({
    ...stage,
    rateFromPrevious: index > 0 ? rate(stage.count, stages[index - 1].count) : undefined,
  }));
}

export async function fetchGrowthDashboardReport(periodDays = 30): Promise<GrowthDashboardReport | { error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { error: "Supabase is not configured." };

  const since = daysAgoIso(periodDays);

  const [
    signups,
    conciergeUsage,
    visaEvents,
    flightEvents,
    propertyEvents,
    agentEvents,
    tourEvents,
    emailCaptures,
    visaTable,
    bookingTable,
    propertyTable,
    agentTable,
    tourTable,
    profilesTable,
    attributionRows,
    eventRows,
    abandonedRows,
  ] = await Promise.all([
    countEventsSince(admin, "signup", since),
    countEventsSince(admin, "concierge_usage", since),
    countEventsSince(admin, "visa_request", since),
    countEventsSince(admin, "flight_request", since),
    countEventsSince(admin, "property_inquiry", since),
    countEventsSince(admin, "agent_inquiry", since),
    countEventsSince(admin, "tour_request", since),
    countEventsSince(admin, "email_capture", since),
    countTableSince(admin, "visa_requests", since),
    countTableSince(admin, "booking_requests", since),
    countTableSince(admin, "property_inquiries", since),
    countTableSince(admin, "travel_agent_inquiries", since),
    countTableSince(admin, "group_tour_requests", since),
    countTableSince(admin, "profiles", since),
    admin.from("growth_attribution").select("utm_source, utm_medium, utm_campaign, session_id, user_id").gte("created_at", since),
    admin.from("growth_events").select("event_type, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(500),
    admin
      .from("abandoned_inquiries")
      .select("id, inquiry_type, email, status, source_path, utm_source, created_at")
      .in("status", ["draft", "recovery_sent"])
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const visaRequests = Math.max(visaEvents, visaTable);
  const flightRequests = Math.max(flightEvents, bookingTable);
  const propertyInquiries = Math.max(propertyEvents, propertyTable);
  const agentInquiries = Math.max(agentEvents, agentTable);
  const tourRequests = Math.max(tourEvents, tourTable);
  const signupCount = Math.max(signups, profilesTable);

  const sessions = attributionRows.data?.length ?? 0;
  const totalInquiries = visaRequests + flightRequests + propertyInquiries + agentInquiries + tourRequests;

  const visitorToSignup = buildFunnel([
    { id: "sessions", label: "Attributed sessions", count: sessions },
    { id: "signups", label: "Signups", count: signupCount },
  ]);

  const signupToInquiry = buildFunnel([
    { id: "signups", label: "Signups", count: signupCount },
    { id: "concierge", label: "Concierge usage", count: conciergeUsage },
    { id: "inquiries", label: "Inquiry submissions", count: totalInquiries },
  ]);

  const inquiryToConversion = buildFunnel([
    { id: "inquiries", label: "Total inquiries", count: totalInquiries },
    { id: "visa", label: "Visa requests", count: visaRequests },
    { id: "flight", label: "Flight requests", count: flightRequests },
    { id: "property", label: "Property inquiries", count: propertyInquiries },
    { id: "agent", label: "Agent inquiries", count: agentInquiries },
    { id: "tour", label: "Tour requests", count: tourRequests },
  ]);

  const sourceMap = new Map<string, SourceAttributionRow>();
  for (const row of attributionRows.data ?? []) {
    const r = row as {
      utm_source: string | null;
      utm_medium: string | null;
      utm_campaign: string | null;
      session_id: string;
      user_id: string | null;
    };
    const source = r.utm_source?.trim() || "(direct)";
    const medium = r.utm_medium?.trim() || "(none)";
    const campaign = r.utm_campaign?.trim() || "(none)";
    const key = `${source}|${medium}|${campaign}`;
    const existing = sourceMap.get(key) ?? {
      source,
      medium,
      campaign,
      sessions: 0,
      signups: 0,
      conversions: 0,
      conversionRate: 0,
    };
    existing.sessions += 1;
    if (r.user_id) existing.signups += 1;
    sourceMap.set(key, existing);
  }

  for (const ev of eventRows.data ?? []) {
    const row = ev as { event_type: string; created_at: string };
    if (!["visa_request", "flight_request", "property_inquiry", "agent_inquiry", "tour_request"].includes(row.event_type)) {
      continue;
    }
  }

  const conversionBySource = new Map<string, number>();
  const { data: conversionEvents } = await admin
    .from("growth_events")
    .select("utm_source, utm_medium, utm_campaign")
    .in("event_type", ["visa_request", "flight_request", "property_inquiry", "agent_inquiry", "tour_request"])
    .gte("created_at", since);

  for (const row of conversionEvents ?? []) {
    const r = row as { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null };
    const key = `${r.utm_source?.trim() || "(direct)"}|${r.utm_medium?.trim() || "(none)"}|${r.utm_campaign?.trim() || "(none)"}`;
    conversionBySource.set(key, (conversionBySource.get(key) ?? 0) + 1);
  }

  const sources: SourceAttributionRow[] = [...sourceMap.entries()]
    .map(([key, row]) => {
      const conversions = conversionBySource.get(key) ?? 0;
      return {
        ...row,
        conversions,
        conversionRate: row.sessions > 0 ? Math.round((conversions / row.sessions) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 12);

  const dailyMap = new Map<string, number>();
  for (const row of eventRows.data ?? []) {
    const r = row as { event_type: string; created_at: string };
    const date = r.created_at.slice(0, 10);
    const key = `${date}|${r.event_type}`;
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }

  const dailyEvents = [...dailyMap.entries()].map(([key, count]) => {
    const [date, eventType] = key.split("|");
    return { date, eventType, count };
  });

  const abandoned = abandonedRows.data ?? [];
  const abandonedDrafts = abandoned.filter((r) => (r as { status: string }).status === "draft").length;
  const recoveriesSent = abandoned.filter((r) => (r as { status: string }).status === "recovery_sent").length;

  return {
    generatedAt: new Date().toISOString(),
    periodDays,
    totals: {
      signups: signupCount,
      conciergeUsage,
      visaRequests,
      flightRequests,
      propertyInquiries,
      agentInquiries,
      tourRequests,
      emailCaptures,
      abandonedDrafts,
      recoveriesSent,
    },
    funnels: {
      visitorToSignup,
      signupToInquiry,
      inquiryToConversion,
    },
    sources,
    dailyEvents,
    abandonedInquiries: abandoned.map((r) => {
      const row = r as {
        id: string;
        inquiry_type: string;
        email: string | null;
        status: string;
        source_path: string | null;
        utm_source: string | null;
        created_at: string;
      };
      return row;
    }),
  };
}
