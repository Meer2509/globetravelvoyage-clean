import type { DatabaseHealthResult } from "@/lib/supabase/database-health";

/** Internal dev status — never shown on customer-facing UI. Admin pages use their own status panels. */
export function DatabaseStatusBanner(props: { health: DatabaseHealthResult | null }) {
  void props;
  return null;
}
