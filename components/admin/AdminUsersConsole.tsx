"use client";

import Link from "next/link";
import type { AdminProfileRow } from "@/lib/supabase/queries";

export function AdminUsersConsole({
  profiles,
  error,
  tableMissing,
}: {
  profiles: AdminProfileRow[];
  error?: string;
  tableMissing?: boolean;
}) {
  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Users</h1>
          <p className="mt-1 text-sm text-muted">Registered profiles from Supabase — live data only.</p>
        </div>
      </div>

      <div className="container-px py-8">
        {tableMissing && (
          <div className="mb-4 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-navy">
            Profiles table not found. Run Supabase migrations.
          </div>
        )}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-200 bg-soft/50 text-left text-xs font-bold uppercase text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-200">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
                    No users registered yet.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-soft/30">
                    <td className="px-4 py-3 font-medium text-navy">{p.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{p.email}</td>
                    <td className="px-4 py-3 capitalize">{p.role?.replace(/_/g, " ") ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          p.is_active === false ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {p.is_active === false ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
