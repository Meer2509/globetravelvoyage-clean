"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { PUBLIC_PROPERTY_STATUS } from "@/lib/supabase/property-types";
import { PUBLIC_TRAVEL_AGENT_STATUS } from "@/lib/supabase/travel-agent-types";

export interface V3MarketplaceCounts {
  approvedProperties: number;
  verifiedTravelAgents: number;
  activeGroupTours: number;
  verifiedVisaExperts: number;
  flightSearchLive: boolean;
  isLive: boolean;
}

const EMPTY: V3MarketplaceCounts = {
  approvedProperties: 0,
  verifiedTravelAgents: 0,
  activeGroupTours: 0,
  verifiedVisaExperts: 0,
  flightSearchLive: Boolean(process.env.DUFFEL_ACCESS_TOKEN?.trim()),
  isLive: false,
};

async function countRows(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  table: string,
  filters: Array<{ column: string; value: string | boolean }> = []
): Promise<number> {
  let query = admin.from(table).select("*", { count: "exact", head: true });
  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }
  const { count, error } = await query;
  if (error) {
    console.error(`[v3-counts] ${table} count failed`, error.message);
    return 0;
  }
  return count ?? 0;
}

async function countGroupTours(
  admin: NonNullable<ReturnType<typeof createAdminClient>>
): Promise<number> {
  const { count, error } = await admin
    .from("group_tours")
    .select("*", { count: "exact", head: true })
    .in("status", ["active", "approved"]);
  if (error) {
    console.error("[v3-counts] group_tours count failed", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function fetchV3MarketplaceCounts(): Promise<V3MarketplaceCounts> {
  const admin = createAdminClient();
  const flightSearchLive = Boolean(process.env.DUFFEL_ACCESS_TOKEN?.trim());

  if (!admin) {
    return { ...EMPTY, flightSearchLive };
  }

  const [approvedProperties, verifiedTravelAgents, activeGroupTours, verifiedVisaExperts] =
    await Promise.all([
      countRows(admin, "property_listings", [{ column: "status", value: PUBLIC_PROPERTY_STATUS }]),
      countRows(admin, "travel_agent_profiles", [
        { column: "verification_status", value: PUBLIC_TRAVEL_AGENT_STATUS },
        { column: "is_active", value: true },
      ]),
      countGroupTours(admin),
      countRows(admin, "visa_experts", [
        { column: "verification_status", value: "verified" },
        { column: "is_active", value: true },
      ]),
    ]);

  return {
    approvedProperties,
    verifiedTravelAgents,
    activeGroupTours,
    verifiedVisaExperts,
    flightSearchLive,
    isLive: true,
  };
}
