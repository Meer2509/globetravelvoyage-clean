import Link from "next/link";
import type { DatabaseHealthResult } from "@/lib/supabase/database-health";

export function DatabaseStatusBanner({ health }: { health: DatabaseHealthResult | null }) {
  if (!health?.configured) return null;

  const coreReady =
    health.tables.profiles && health.tables.user_roles && health.tables.visa_experts;

  if (coreReady) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        ✓ Supabase live — database connected
      </div>
    );
  }

  const needsSetup = !coreReady;
  if (!needsSetup) return null;

  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-charcoal/75">
      <p className="font-semibold text-navy">Database setup required</p>
      <p className="mt-1">{health.message}</p>
      <Link href="/admin/setup" className="mt-2 inline-block text-xs font-bold text-blue hover:underline">
        View setup guide →
      </Link>
    </div>
  );
}
