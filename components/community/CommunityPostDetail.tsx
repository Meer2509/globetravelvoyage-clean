"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  togglePostLike,
  toggleFollowUser,
  addCommunityComment,
  reportCommunityContent,
} from "@/lib/supabase/community-actions";
import type { CommunityCommentRow, CommunityPostRow } from "@/lib/supabase/community-types";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { useRouter } from "next/navigation";

export function CommunityPostDetail({
  post,
  comments: initialComments,
  isLoggedIn,
}: {
  post: CommunityPostRow;
  comments: CommunityCommentRow[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [following, setFollowing] = useState(post.following_author ?? false);
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  async function handleLike() {
    if (!isLoggedIn) {
      setError("Sign in to like posts.");
      return;
    }
    setBusy("like");
    const result = await togglePostLike(post.id);
    setBusy("");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  }

  async function handleFollow() {
    if (!isLoggedIn) {
      setError("Sign in to follow users.");
      return;
    }
    setBusy("follow");
    const result = await toggleFollowUser(post.user_id);
    setBusy("");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFollowing((v) => !v);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Sign in to comment.");
      return;
    }
    setBusy("comment");
    setError("");
    const result = await addCommunityComment(post.id, commentBody);
    setBusy("");
    if (!result.ok) {
      setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setCommentBody("");
    router.refresh();
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setBusy("report");
    const result = await reportCommunityContent({
      targetType: "post",
      targetId: post.id,
      reason: reportReason.trim(),
    });
    setBusy("");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setReportOpen(false);
    setReportReason("");
    setError("");
    alert("Report submitted. Our team will review it.");
  }

  return (
    <article className="container-px py-10 max-w-3xl mx-auto">
      <Link href="/community" className="text-xs font-semibold text-blue hover:underline">
        ← Community
      </Link>

      {post.destination && (
        <span className="mt-4 inline-block rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
          {post.destination}
        </span>
      )}

      <h1 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">{post.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/8 text-sm font-bold text-navy">
            {(post.author_name ?? "T").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-charcoal/80">{post.author_name ?? "Traveler"}</span>
        </div>
        <span className="text-xs text-charcoal/40">
          {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
        </span>
      </div>

      {post.image_url && (
        <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-navy/5">
          <Image src={post.image_url} alt="" fill className="object-cover" sizes="768px" priority />
        </div>
      )}

      <div className="mt-8 prose prose-sm max-w-none text-charcoal/80 whitespace-pre-wrap leading-relaxed">
        {post.body}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-soft-200 py-4">
        <button
          type="button"
          onClick={handleLike}
          disabled={busy === "like"}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            liked ? "bg-gold/15 text-gold" : "bg-soft text-navy hover:bg-navy/5"
          }`}
        >
          {liked ? "♥ Liked" : "♡ Like"} · {likeCount}
        </button>
        {isLoggedIn && (
          <button
            type="button"
            onClick={handleFollow}
            disabled={busy === "follow"}
            className="btn-outline px-4 py-2 text-sm"
          >
            {following ? "Following" : "Follow author"}
          </button>
        )}
        {isLoggedIn && (
          <button type="button" onClick={() => setReportOpen((v) => !v)} className="text-sm font-semibold text-charcoal/45 hover:text-red-600">
            Report
          </button>
        )}
        {!isLoggedIn && (
          <Link href={`/login?next=/community/${post.id}`} className="text-sm font-semibold text-blue hover:underline">
            Sign in to interact
          </Link>
        )}
      </div>

      {reportOpen && (
        <form onSubmit={handleReport} className="mt-4 rounded-xl border border-soft-200 bg-soft/40 p-4 space-y-3">
          <p className="text-sm font-semibold text-navy">Report this post</p>
          <textarea
            className="input min-h-20 text-sm"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Why are you reporting this?"
            required
          />
          <button type="submit" disabled={busy === "report"} className="btn-outline px-4 py-2 text-sm">
            Submit report
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-navy">Comments ({comments.length})</h2>
        <div className="mt-4 space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-charcoal/50">No comments yet. Start the conversation.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-xl border border-soft-200 bg-white p-4">
                <p className="text-xs font-semibold text-charcoal/60">{c.author_name ?? "Traveler"}</p>
                <p className="mt-1 text-sm text-navy">{c.body}</p>
                <p className="mt-2 text-[10px] text-charcoal/35">{new Date(c.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        {isLoggedIn ? (
          <form onSubmit={handleComment} className="mt-6 space-y-3">
            <textarea
              className="input min-h-24 text-sm"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Share your thoughts…"
              required
            />
            <button type="submit" disabled={busy === "comment"} className="btn-primary px-5 py-2.5 text-sm">
              {busy === "comment" ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-charcoal/50">
            <Link href={`/login?next=/community/${post.id}`} className="font-semibold text-blue hover:underline">
              Sign in
            </Link>{" "}
            to comment.
          </p>
        )}
      </section>
    </article>
  );
}
