"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUserSavedTrips, type SavedTripRow } from "@/lib/supabase/ai-actions";
import { isSupabaseConfigured } from "@/lib/auth";
import { Panel } from "@/components/DashboardLayout";

export function SavedTripsPanel() {
  const [trips, setTrips] = useState<SavedTripRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoaded(true);
      return;
    }
    fetchUserSavedTrips().then((rows) => {
      setTrips(rows);
      setLoaded(true);
    });
  }, []);

  return (
    <Panel title="AI saved trips" subtitle="Itineraries saved from the AI concierge">
      {!loaded ? (
        <p className="text-sm text-charcoal/50 py-4">Loading…</p>
      ) : trips.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-charcoal/50">No saved trips yet.</p>
          <Link href="/ai-trip-planner" className="mt-3 inline-block text-sm font-semibold text-blue hover:underline">
            Plan a trip with AI →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {trips.map((t) => (
            <div key={t.id} className="rounded-xl bg-soft p-3 text-sm">
              <p className="font-semibold text-navy">{t.title}</p>
              <p className="text-xs text-charcoal/50">
                {t.destination ?? "—"} · {t.days ?? "—"} days ·{" "}
                {new Date(t.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
