import Link from "next/link";
import type { Metadata } from "next";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CTASection } from "@/components/CTASection";
import {
  fetchPublicCommunityPosts,
  fetchCommunityMembership,
} from "@/lib/supabase/community-actions";
import { requireSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Travel Community — Globe Travel Voyage",
  description: "Join our free travel community. Share stories, destination tips, and connect with verified travelers and experts.",
};

export default async function CommunityPage() {
  const [posts, session] = await Promise.all([
    fetchPublicCommunityPosts(),
    requireSession(),
  ]);

  const isLoggedIn = session.ok;
  const isMember = isLoggedIn ? await fetchCommunityMembership() : false;

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-white transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Community</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Travel community</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-dark">
            Free to join. Share real travel stories, follow fellow travelers, and learn from verified experts — all moderated for trust.
          </p>
        </div>
      </div>

      <CommunityFeed posts={posts} isMember={isMember} isLoggedIn={isLoggedIn} />

      <CTASection
        title="Message verified experts"
        subtitle="Connect directly with travel agents, property hosts, and visa specialists."
        primary={{ label: "Browse agents", href: "/travel-agents" }}
        secondary={{ label: "Open messages", href: isLoggedIn ? "/messages" : "/login?next=/messages" }}
      />
    </>
  );
}
