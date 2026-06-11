"use client";

import Link from "next/link";
import { ProgressBar, Panel } from "@/components/DashboardLayout";
import type { DashboardUserState } from "@/hooks/useDashboardUser";

export function DashboardProfileSection({ user }: { user: DashboardUserState }) {
  if (user.loading) {
    return (
      <Panel title="Your profile" subtitle="Loading account data…">
        <div className="flex items-center gap-3 text-sm text-charcoal/50">
          <svg className="h-5 w-5 animate-spin text-blue" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          Fetching your Supabase profile…
        </div>
      </Panel>
    );
  }

  if (!user.result?.ok) return null;

  const { profile } = user.result;

  return (
    <div className="space-y-4">
      <Panel title="Your profile" subtitle="Live data from your Globe Travel Voyage account">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Full name</p>
            <p className="mt-1 font-bold text-navy">{profile.full_name ?? "—"}</p>
          </div>
          <div className="rounded-xl bg-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Email</p>
            <p className="mt-1 font-bold text-navy truncate">{profile.email}</p>
          </div>
          <div className="rounded-xl bg-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Role</p>
            <p className="mt-1 font-bold text-navy">{user.roleLabel}</p>
          </div>
          <div className="rounded-xl bg-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Location</p>
            <p className="mt-1 font-bold text-navy">
              {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <ProgressBar label={`Profile completion (${user.completion}%)`} pct={user.completion} color="blue" />
          {profile.company_name && (
            <p className="text-xs text-charcoal/55">
              <span className="font-semibold text-navy">Business:</span> {profile.company_name}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard/profile" className="btn-primary px-4 py-2 text-sm">
            Edit profile
          </Link>
          {user.completion < 100 && (
            <Link href="/dashboard/profile" className="btn-outline px-4 py-2 text-sm">
              Complete your profile
            </Link>
          )}
        </div>
      </Panel>

      {user.completion < 100 && user.missingFields.length > 0 && (
        <Panel title="Complete your profile" subtitle="Add the missing details below to unlock full dashboard features">
          <ul className="space-y-2">
            {user.missingFields.map((field) => (
              <li key={field} className="flex items-center gap-2 text-sm text-charcoal/65">
                <span className="h-2 w-2 rounded-full bg-gold" />
                {field}
              </li>
            ))}
          </ul>
          <Link href="/dashboard/profile" className="btn-primary mt-4 inline-block px-5 py-2.5 text-sm">
            Complete profile now
          </Link>
        </Panel>
      )}
    </div>
  );
}
