import Link from "next/link";
import type { Metadata } from "next";
import { CommunityDashboardPanel } from "@/components/community/CommunityDashboardPanel";
import {
  fetchCommunityMembership,
  fetchMyCommunityPosts,
  isCommunityStorageReady,
} from "@/lib/supabase/community-actions";
import { requireSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Community — Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardCommunityPage() {
  const session = await requireSession();
  if (!session.ok) redirect("/login?next=/dashboard/community");

  const [isMember, myPosts, storageReady] = await Promise.all([
    fetchCommunityMembership(),
    fetchMyCommunityPosts(),
    isCommunityStorageReady(),
  ]);

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/community" className="text-xs font-semibold text-blue hover:underline">
            ← Public community
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">My community</h1>
          <p className="mt-1 text-sm text-muted">
            Create travel posts, track moderation status, and manage your community presence.
          </p>
        </div>
      </div>
      <div className="container-px py-8 max-w-2xl">
        <CommunityDashboardPanel
          isMember={isMember}
          myPosts={myPosts}
          storageReady={storageReady}
        />
      </div>
    </div>
  );
}
