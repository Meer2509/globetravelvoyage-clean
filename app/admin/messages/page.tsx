import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminMessagesConsole } from "@/components/admin/AdminMessagesConsole";
import { requireAdmin } from "@/lib/auth-server";
import { fetchAdminConversations } from "@/lib/admin/phase1-actions";
import { fetchAdminMessageReports } from "@/lib/supabase/messaging-actions";

export const metadata: Metadata = {
  title: "Messages — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const [{ rows: conversations, error: convError }, { rows: reports, error: reportsError }] =
    await Promise.all([fetchAdminConversations(), fetchAdminMessageReports()]);

  return (
    <AdminMessagesConsole
      conversations={conversations as Array<Record<string, unknown>>}
      reports={reports}
      convError={convError}
      reportsError={reportsError}
    />
  );
}
