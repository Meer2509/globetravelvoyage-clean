"use client";

import Link from "next/link";
import { CreatePostForm } from "./CreatePostForm";
import { JoinCommunityPanel } from "./JoinCommunityPanel";
import type { CommunityPostRow } from "@/lib/supabase/community-types";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  approved: "bg-emerald-50 text-emerald-700",
  hidden: "bg-charcoal/10 text-charcoal/60",
  rejected: "bg-red-50 text-red-600",
};

export function CommunityDashboardPanel({
  isMember,
  myPosts,
  storageReady,
}: {
  isMember: boolean;
  myPosts: CommunityPostRow[];
  storageReady: boolean;
}) {
  return (
    <div className="space-y-8">
      {!isMember ? (
        <JoinCommunityPanel />
      ) : (
        <>
          <CreatePostForm storageReady={storageReady} />

          <div>
            <h2 className="text-lg font-extrabold text-navy">Your posts</h2>
            <p className="mt-1 text-sm text-charcoal/55">
              Pending posts are reviewed by our team before going live.
            </p>
            <div className="mt-4 space-y-3">
              {myPosts.length === 0 ? (
                <div className="card p-8 text-center text-sm text-charcoal/50">
                  You have not posted yet.
                </div>
              ) : (
                myPosts.map((post) => (
                  <div key={post.id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[post.status] ?? "bg-soft text-charcoal/60"}`}>
                          {post.status}
                        </span>
                        {post.destination && (
                          <span className="text-xs text-gold font-semibold">{post.destination}</span>
                        )}
                      </div>
                      <h3 className="mt-2 font-bold text-navy">{post.title}</h3>
                      <p className="mt-1 text-sm text-charcoal/55 line-clamp-2">{post.body}</p>
                      <p className="mt-2 text-xs text-charcoal/40">
                        {new Date(post.created_at).toLocaleString()} · {post.like_count} likes · {post.comment_count} comments
                      </p>
                    </div>
                    {post.status === "approved" && (
                      <Link href={`/community/${post.id}`} className="btn-outline shrink-0 px-4 py-2 text-sm">
                        View live
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
