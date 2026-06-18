import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminGroupTourConsole } from "@/components/admin/AdminGroupTourConsole";
import { requireAdmin } from "@/lib/auth-server";
import {
  fetchAllGroupToursForAdmin,
  fetchGroupTourRequestsForAdmin,
} from "@/lib/supabase/group-tour-actions";

export const metadata: Metadata = {
  title: "Group Tours — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGroupToursPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const [{ rows: tours, error: toursError }, { rows: requests, error: requestsError }] =
    await Promise.all([fetchAllGroupToursForAdmin(), fetchGroupTourRequestsForAdmin()]);

  return (
    <AdminGroupTourConsole
      tours={tours}
      requests={requests}
      toursError={toursError}
      requestsError={requestsError}
    />
  );
}
