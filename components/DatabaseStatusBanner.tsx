import type { DatabaseHealthResult } from "@/lib/supabase/database-health";

/** Internal dev status — never shown on customer-facing UI. Admin pages use their own status panels. */
export function DatabaseStatusBanner(_props: { health: DatabaseHealthResult | null }) {
  return null;
}
