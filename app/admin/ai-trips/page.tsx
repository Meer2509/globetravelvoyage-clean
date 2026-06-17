import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminSavedTrips } from "@/lib/supabase/ai-actions";

export const metadata: Metadata = {
  title: "AI Trips — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAiTripsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const trips = await fetchAdminSavedTrips();

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">AI saved trips</h1>
          <p className="mt-1 text-sm text-muted">Trip plans saved by travelers from the AI concierge.</p>
        </div>
      </div>
      <div className="container-px py-8 space-y-3">
        {trips.length === 0 ? (
          <div className="card p-12 text-center text-sm text-muted">No saved AI trips yet.</div>
        ) : (
          trips.map((t) => (
            <div key={t.id} className="card p-5">
              <p className="font-bold text-navy">{t.title}</p>
              <p className="text-sm text-muted">
                {t.destination ?? "—"} · {t.days ?? "—"} days · {t.budget_usd ? `$${t.budget_usd}` : "—"}
              </p>
              <p className="mt-1 text-xs text-charcoal/45">
                {t.source ?? "manual"} · {new Date(t.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
