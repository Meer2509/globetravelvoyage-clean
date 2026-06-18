import type { Metadata } from "next";
import { AdminAccessRequired } from "@/components/admin/AdminAccessRequired";
import { AdminCommunityConsole } from "@/components/admin/AdminCommunityConsole";
import { requireAdmin } from "@/lib/auth-server";
import {
  fetchAdminCommunityPosts,
  fetchAdminCommunityReports,
} from "@/lib/supabase/community-actions";

export const metadata: Metadata = {
  title: "Community — Globe Travel Voyage Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCommunityPage() {
  const auth = await requireAdmin();
  if (!auth.ok) return <AdminAccessRequired message={auth.error} />;

  const [{ rows: posts, error: postsError }, { rows: reports, error: reportsError }] =
    await Promise.all([fetchAdminCommunityPosts(), fetchAdminCommunityReports()]);

  return (
    <AdminCommunityConsole
      posts={posts}
      reports={reports}
      postsError={postsError}
      reportsError={reportsError}
    />
  );
}
