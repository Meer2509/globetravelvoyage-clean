import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminTravelAgentConsole } from "@/components/admin/AdminTravelAgentConsole";
import { requireAdmin } from "@/lib/auth-server";
import {
  fetchAllTravelAgentProfilesForAdmin,
  fetchTravelAgentInquiriesForAdmin,
} from "@/lib/supabase/travel-agent-actions";

export const metadata: Metadata = {
  title: "Travel Agents — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminTravelAgentsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const [{ rows: agents, error: agentsError }, { rows: inquiries, error: inquiriesError }] =
    await Promise.all([
      fetchAllTravelAgentProfilesForAdmin(),
      fetchTravelAgentInquiriesForAdmin(),
    ]);

  return (
    <AdminTravelAgentConsole
      agents={agents}
      inquiries={inquiries}
      agentsError={agentsError}
      inquiriesError={inquiriesError}
    />
  );
}
