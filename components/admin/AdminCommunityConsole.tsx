"use client";

import { useState } from "react";
import Link from "next/link";
import {
  adminUpdatePostStatus,
  adminRemoveComment,
  adminResolveCommunityReport,
  adminSuspendUser,
  fetchAdminCommunityComments,
} from "@/lib/supabase/community-actions";
import type { CommunityPostRow } from "@/lib/supabase/community-types";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  approved: "bg-emerald-50 text-emerald-700",
  hidden: "bg-charcoal/10 text-charcoal/60",
  rejected: "bg-red-50 text-red-600",
};

export function AdminCommunityConsole({
  posts,
  reports,
  postsError,
  reportsError,
}: {
  posts: CommunityPostRow[];
  reports: Array<Record<string, unknown>>;
  postsError?: string;
  reportsError?: string;
}) {
  const [postRows, setPostRows] = useState(posts);
  const [reportRows, setReportRows] = useState(reports);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"posts" | "reports">("posts");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Array<Record<string, unknown>>>([]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handlePostStatus(postId: string, status: "approved" | "hidden" | "rejected") {
    setBusyId(postId);
    const result = await adminUpdatePostStatus(postId, status);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setPostRows((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status } : p))
    );
    showToast(`Post ${status}`);
  }

  async function loadComments(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    const rows = await fetchAdminCommunityComments(postId);
    setComments(rows as unknown as Array<Record<string, unknown>>);
    setExpandedPost(postId);
  }

  async function handleRemoveComment(commentId: string, postId: string) {
    setBusyId(commentId);
    const result = await adminRemoveComment(commentId);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPostRows((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comment_count: Math.max(0, p.comment_count - 1) } : p
      )
    );
    showToast("Comment removed");
  }

  async function handleResolveReport(reportId: string, status: "reviewed" | "dismissed") {
    setBusyId(reportId);
    const result = await adminResolveCommunityReport(reportId, status);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setReportRows((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
    showToast("Report updated");
  }

  async function handleSuspend(userId: string) {
    setBusyId(userId);
    const result = await adminSuspendUser(userId, true);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast("User suspended");
  }

  return (
    <div className="min-h-screen bg-soft">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)]">
          {toast}
        </div>
      )}
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Community moderation</h1>
          <p className="mt-1 text-sm text-muted">
            Approve posts, remove comments, review reports, and suspend abusive users.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setTab("posts")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "posts" ? "bg-navy text-white" : "bg-soft text-navy"}`}
            >
              Posts ({postRows.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("reports")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "reports" ? "bg-navy text-white" : "bg-soft text-navy"}`}
            >
              Reports ({reportRows.filter((r) => r.status === "pending").length} pending)
            </button>
          </div>
        </div>
      </div>

      <div className="container-px py-8 space-y-4">
        {tab === "posts" && (
          <>
            {postsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{postsError}</div>
            )}
            {postRows.length === 0 ? (
              <div className="card p-12 text-center text-sm text-muted">No community posts yet.</div>
            ) : (
              postRows.map((post) => (
                <div key={post.id} className="card p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[post.status] ?? ""}`}>
                        {post.status}
                      </span>
                      <h2 className="mt-2 font-bold text-navy">{post.title}</h2>
                      <p className="text-xs text-muted">
                        {post.author_name ?? "—"} · {new Date(post.created_at).toLocaleString()}
                        {post.destination ? ` · ${post.destination}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.status !== "approved" && (
                        <button
                          type="button"
                          disabled={busyId === post.id}
                          onClick={() => handlePostStatus(post.id, "approved")}
                          className="btn-primary px-3 py-1.5 text-xs disabled:opacity-60"
                        >
                          Approve
                        </button>
                      )}
                      {post.status !== "hidden" && (
                        <button
                          type="button"
                          disabled={busyId === post.id}
                          onClick={() => handlePostStatus(post.id, "hidden")}
                          className="btn-outline px-3 py-1.5 text-xs disabled:opacity-60"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === post.id}
                        onClick={() => handlePostStatus(post.id, "rejected")}
                        className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={busyId === post.user_id}
                        onClick={() => handleSuspend(post.user_id)}
                        className="text-xs font-semibold text-charcoal/45 hover:text-red-600 disabled:opacity-60"
                      >
                        Suspend author
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal/70 line-clamp-4">{post.body}</p>
                  <button
                    type="button"
                    onClick={() => loadComments(post.id)}
                    className="text-xs font-semibold text-blue hover:underline"
                  >
                    {expandedPost === post.id ? "Hide comments" : `Comments (${post.comment_count})`}
                  </button>
                  {expandedPost === post.id && (
                    <div className="space-y-2 border-t border-soft-200 pt-3">
                      {comments.length === 0 ? (
                        <p className="text-xs text-muted">No comments.</p>
                      ) : (
                        comments.map((c) => {
                          const row = c as {
                            id: string;
                            body: string;
                            author_name: string | null;
                            status: string;
                          };
                          return (
                            <div key={row.id} className="flex items-start justify-between gap-3 rounded-lg bg-soft/50 p-3">
                              <div>
                                <p className="text-xs font-semibold text-charcoal/60">{row.author_name ?? "—"}</p>
                                <p className="text-sm text-navy">{row.body}</p>
                              </div>
                              {row.status !== "hidden" && (
                                <button
                                  type="button"
                                  disabled={busyId === row.id}
                                  onClick={() => handleRemoveComment(row.id, post.id)}
                                  className="text-xs font-semibold text-red-600 hover:underline shrink-0"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {tab === "reports" && (
          <>
            {reportsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{reportsError}</div>
            )}
            {reportRows.length === 0 ? (
              <div className="card p-12 text-center text-sm text-muted">No reports yet.</div>
            ) : (
              reportRows.map((row) => {
                const r = row as {
                  id: string;
                  target_type: string;
                  target_id: string;
                  reason: string;
                  details: string | null;
                  status: string;
                  created_at: string;
                };
                return (
                  <div key={r.id} className="card p-5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase text-gold">{r.target_type}</span>
                      <span className={`text-xs font-semibold ${r.status === "pending" ? "text-gold" : "text-charcoal/45"}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-navy">{r.reason}</p>
                    {r.details && <p className="text-sm text-charcoal/60">{r.details}</p>}
                    <p className="text-xs text-muted font-mono">Target: {r.target_id.slice(0, 8)}…</p>
                    <p className="text-xs text-charcoal/40">{new Date(r.created_at).toLocaleString()}</p>
                    {r.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleResolveReport(r.id, "reviewed")}
                          className="btn-primary px-3 py-1.5 text-xs disabled:opacity-60"
                        >
                          Mark reviewed
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleResolveReport(r.id, "dismissed")}
                          className="btn-outline px-3 py-1.5 text-xs disabled:opacity-60"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
