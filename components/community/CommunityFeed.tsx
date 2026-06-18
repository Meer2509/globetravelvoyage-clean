"use client";

import { useState } from "react";
import Link from "next/link";
import { CommunityPostCard } from "./CommunityPostCard";
import { JoinCommunityPanel } from "./JoinCommunityPanel";
import type { CommunityPostRow } from "@/lib/supabase/community-types";

export function CommunityFeed({
  posts,
  isMember,
  isLoggedIn,
}: {
  posts: CommunityPostRow[];
  isMember: boolean;
  isLoggedIn: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = posts.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q) ||
      (p.destination ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="section">
      <div className="container-px">
        {!isMember && isLoggedIn && (
          <div className="mb-8">
            <JoinCommunityPanel />
          </div>
        )}

        {!isLoggedIn && (
          <div className="mb-8 rounded-2xl border border-gold/25 bg-gold/5 p-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="text-sm font-bold text-navy">Join the free travel community</p>
              <p className="mt-1 text-sm text-charcoal/60">
                Sign in to share stories, follow travelers, and message verified experts.
              </p>
            </div>
            <Link href="/login?next=/community" className="btn-gold mt-4 sm:mt-0 shrink-0 px-6 py-2.5 text-sm">
              Sign in free
            </Link>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            className="input max-w-md flex-1"
            placeholder="Search posts, destinations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isMember && (
            <Link href="/dashboard/community" className="btn-primary shrink-0 px-6 py-2.5 text-sm">
              Create post
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl">🌍</div>
            <h2 className="mt-4 text-xl font-extrabold text-navy">No community posts yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/60">
              Be the first to share a travel story, destination tip, or trip photo. All posts are reviewed before going live.
            </p>
            {isMember ? (
              <Link href="/dashboard/community" className="btn-gold mt-6 inline-flex px-6 py-2.5 text-sm">
                Write the first post
              </Link>
            ) : isLoggedIn ? (
              <div className="mt-6">
                <JoinCommunityPanel compact />
              </div>
            ) : (
              <Link href="/login?next=/community" className="btn-gold mt-6 inline-flex px-6 py-2.5 text-sm">
                Sign in to join
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
