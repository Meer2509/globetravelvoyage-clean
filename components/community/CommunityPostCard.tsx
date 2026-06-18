"use client";

import Link from "next/link";
import Image from "next/image";
import type { CommunityPostRow } from "@/lib/supabase/community-types";

export function CommunityPostCard({ post }: { post: CommunityPostRow }) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="group card card-hover flex flex-col overflow-hidden"
    >
      {post.image_url && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy/5">
          <Image
            src={post.image_url}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {post.destination && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
            {post.destination}
          </span>
        )}
        <h2 className="mt-1 text-lg font-extrabold text-navy group-hover:text-blue transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/60 line-clamp-3">
          {post.body}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-soft-200 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/8 text-xs font-bold text-navy">
              {(post.author_name ?? "T").charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-charcoal/70">{post.author_name ?? "Traveler"}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-charcoal/45">
            <span>{post.like_count} likes</span>
            <span>{post.comment_count} comments</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
