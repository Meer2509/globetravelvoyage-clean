import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminConversations } from "@/lib/admin/phase1-actions";

export const metadata: Metadata = {
  title: "Messages — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const { rows, error } = await fetchAdminConversations();

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Messaging</h1>
          <p className="mt-1 text-sm text-muted">Platform conversations from Supabase.</p>
        </div>
      </div>
      <div className="container-px py-8 space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {rows.length === 0 ? (
          <div className="card p-12 text-center text-sm text-muted">No conversations yet.</div>
        ) : (
          rows.map((c) => {
            const row = c as {
              id: string;
              kind: string;
              subject: string | null;
              updated_at: string;
            };
            return (
              <div key={row.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-bold text-navy">{row.subject ?? row.kind}</p>
                  <p className="text-xs text-muted font-mono">{row.id.slice(0, 8)}…</p>
                </div>
                <p className="text-xs text-charcoal/45">{new Date(row.updated_at).toLocaleString()}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
