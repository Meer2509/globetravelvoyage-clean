"use server";

import { createAdminClient } from "./admin";
import { requireSession, requireAdmin } from "@/lib/auth-server";
import { logAdminAudit } from "@/lib/admin/phase1-actions";
import { uploadCommunityImage, isCommunityStorageReady } from "@/lib/community-storage";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  COMMUNITY_POST_SELECT,
  PUBLIC_POST_STATUS,
  type CommunityCommentRow,
  type CommunityPostRow,
  type PostStatus,
} from "./community-types";

export type CommunityResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function adminDb() {
  return createAdminClient();
}

async function requireActiveUserId(): Promise<string | { error: string }> {
  const session = await requireSession();
  if (!session.ok) return { error: session.error };

  const admin = adminDb();
  if (!admin) return { error: "Supabase is not configured." };

  const { data: profile } = await admin
    .from("profiles")
    .select("is_active")
    .eq("id", session.userId)
    .maybeSingle();

  if (profile && (profile as { is_active: boolean }).is_active === false) {
    return { error: "Your account is suspended. Contact support." };
  }

  return session.userId;
}

async function attachAuthors<T extends { user_id: string }>(
  rows: T[]
): Promise<(T & { author_name: string | null; author_avatar: string | null })[]> {
  const admin = adminDb();
  if (!admin || !rows.length) {
    return rows.map((r) => ({ ...r, author_name: null, author_avatar: null }));
  }

  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", ids);

  const map = new Map<string, { name: string; avatar: string | null }>();
  for (const p of profiles ?? []) {
    const row = p as { id: string; full_name: string | null; email: string; avatar_url: string | null };
    map.set(row.id, { name: row.full_name ?? row.email.split("@")[0], avatar: row.avatar_url });
  }

  return rows.map((r) => ({
    ...r,
    author_name: map.get(r.user_id)?.name ?? null,
    author_avatar: map.get(r.user_id)?.avatar ?? null,
  }));
}

function normalizePost(row: Record<string, unknown>): CommunityPostRow {
  return {
    ...(row as CommunityPostRow),
    like_count: Number(row.like_count ?? 0),
    comment_count: Number(row.comment_count ?? 0),
  };
}

// ── Membership ────────────────────────────────────────────────────────────────

export async function joinCommunity(): Promise<CommunityResult> {
  const userId = await requireActiveUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { error } = await admin.from("community_members").upsert({ user_id: userId });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: userId } };
}

export async function fetchCommunityMembership(): Promise<boolean> {
  const session = await requireSession();
  if (!session.ok) return false;

  const admin = adminDb();
  if (!admin) return false;

  const { data } = await admin
    .from("community_members")
    .select("user_id")
    .eq("user_id", session.userId)
    .maybeSingle();

  return Boolean(data);
}

// ── Public feed ───────────────────────────────────────────────────────────────

export async function fetchPublicCommunityPosts(limit = 40): Promise<CommunityPostRow[]> {
  const admin = adminDb();
  if (!admin) return [];

  const { data, error } = await admin
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("status", PUBLIC_POST_STATUS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[community] fetch posts failed", error.message);
    return [];
  }

  const posts = (data ?? []).map((r) => normalizePost(r as Record<string, unknown>));
  const withAuthors = await attachAuthors(posts);
  return enrichPostsForViewer(withAuthors);
}

export async function fetchPublicCommunityPost(postId: string): Promise<CommunityPostRow | null> {
  const admin = adminDb();
  if (!admin) return null;

  const { data, error } = await admin
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("id", postId)
    .eq("status", PUBLIC_POST_STATUS)
    .maybeSingle();

  if (error || !data) return null;
  const [withAuthor] = await attachAuthors([normalizePost(data as Record<string, unknown>)]);
  const [enriched] = await enrichPostsForViewer([withAuthor]);
  return enriched;
}

async function enrichPostsForViewer(
  posts: (CommunityPostRow & { author_name: string | null; author_avatar: string | null })[]
): Promise<CommunityPostRow[]> {
  const session = await requireSession();
  if (!session.ok || !posts.length) {
    return posts.map((p) => ({ ...p, liked_by_me: false, following_author: false }));
  }

  const admin = adminDb();
  if (!admin) return posts;

  const postIds = posts.map((p) => p.id);
  const authorIds = posts.map((p) => p.user_id);

  const [{ data: likes }, { data: follows }] = await Promise.all([
    admin.from("community_likes").select("post_id").eq("user_id", session.userId).in("post_id", postIds),
    admin.from("user_follows").select("following_id").eq("follower_id", session.userId).in("following_id", authorIds),
  ]);

  const likedSet = new Set((likes ?? []).map((l) => (l as { post_id: string }).post_id));
  const followSet = new Set((follows ?? []).map((f) => (f as { following_id: string }).following_id));

  return posts.map((p) => ({
    ...p,
    liked_by_me: likedSet.has(p.id),
    following_author: followSet.has(p.user_id),
  }));
}

export async function fetchPostComments(postId: string): Promise<CommunityCommentRow[]> {
  const admin = adminDb();
  if (!admin) return [];

  const { data, error } = await admin
    .from("community_comments")
    .select("id, post_id, user_id, body, status, created_at")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) return [];

  const comments = (data ?? []) as CommunityCommentRow[];
  const withAuthors = await attachAuthors(comments);
  return withAuthors.map((c) => ({
    id: c.id,
    post_id: c.post_id,
    user_id: c.user_id,
    body: c.body,
    status: c.status,
    created_at: c.created_at,
    author_name: c.author_name,
  }));
}

// ── User actions ──────────────────────────────────────────────────────────────

export async function createCommunityPost(input: {
  title: string;
  body: string;
  destination?: string;
  imageUrl?: string;
}): Promise<CommunityResult> {
  const userId = await requireActiveUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const isMember = await fetchCommunityMembership();
  if (!isMember) return { ok: false, error: "Join the community (free) before posting." };

  const rate = await enforceRateLimit("form", userId);
  if (!rate.ok) return { ok: false, error: rate.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { data, error } = await admin
    .from("community_posts")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      body: input.body.trim(),
      destination: input.destination?.trim() || null,
      image_url: input.imageUrl ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function updateCommunityPostImage(
  postId: string,
  imageUrl: string
): Promise<CommunityResult> {
  const userId = await requireActiveUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { error } = await admin
    .from("community_posts")
    .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: postId } };
}

export async function uploadPostImage(formData: FormData): Promise<CommunityResult<{ id: string; url: string }>> {
  const userId = await requireActiveUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const ready = await isCommunityStorageReady();
  if (!ready) return { ok: false, error: "Image uploads are not configured yet. Post without an image." };

  const file = formData.get("file");
  const postId = String(formData.get("postId") ?? "");
  if (!(file instanceof File) || !postId) {
    return { ok: false, error: "Invalid upload." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Only image files are allowed." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "Image must be under 5 MB." };
  }

  const bytes = await file.arrayBuffer();
  const result = await uploadCommunityImage({
    userId,
    postId,
    fileName: file.name,
    fileBytes: bytes,
    contentType: file.type,
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: { id: postId, url: result.publicUrl } };
}

export async function togglePostLike(postId: string): Promise<CommunityResult> {
  const userId = await requireActiveUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { data: existing } = await admin
    .from("community_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await admin.from("community_likes").delete().eq("id", (existing as { id: string }).id);
    await syncLikeCount(postId);
    return { ok: true, data: { id: postId } };
  }

  const { error } = await admin.from("community_likes").insert({ post_id: postId, user_id: userId });
  if (error) return { ok: false, error: error.message };
  await syncLikeCount(postId);
  return { ok: true, data: { id: postId } };
}

async function syncLikeCount(postId: string) {
  const admin = adminDb();
  if (!admin) return;
  const { count } = await admin
    .from("community_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  await admin.from("community_posts").update({ like_count: count ?? 0 }).eq("id", postId);
}

async function syncCommentCount(postId: string) {
  const admin = adminDb();
  if (!admin) return;
  const { count } = await admin
    .from("community_comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("status", "approved");
  await admin.from("community_posts").update({ comment_count: count ?? 0 }).eq("id", postId);
}

export async function addCommunityComment(postId: string, body: string): Promise<CommunityResult> {
  const userId = await requireActiveUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { data: post } = await admin
    .from("community_posts")
    .select("id, status")
    .eq("id", postId)
    .eq("status", PUBLIC_POST_STATUS)
    .maybeSingle();

  if (!post) return { ok: false, error: "Post not found." };

  const { data, error } = await admin
    .from("community_comments")
    .insert({
      post_id: postId,
      user_id: userId,
      body: body.trim(),
      status: "approved",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  await syncCommentCount(postId);
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function toggleFollowUser(targetUserId: string): Promise<CommunityResult> {
  const userId = await requireActiveUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };
  if (targetUserId === userId) return { ok: false, error: "You cannot follow yourself." };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { data: existing } = await admin
    .from("user_follows")
    .select("id")
    .eq("follower_id", userId)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await admin.from("user_follows").delete().eq("id", (existing as { id: string }).id);
    return { ok: true, data: { id: targetUserId } };
  }

  const { error } = await admin.from("user_follows").insert({
    follower_id: userId,
    following_id: targetUserId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: targetUserId } };
}

export async function reportCommunityContent(input: {
  targetType: "post" | "comment" | "user";
  targetId: string;
  reason: string;
  details?: string;
}): Promise<CommunityResult> {
  const userId = await requireActiveUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { data, error } = await admin
    .from("community_reports")
    .insert({
      reporter_id: userId,
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason.trim(),
      details: input.details?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function fetchMyCommunityPosts(): Promise<CommunityPostRow[]> {
  const session = await requireSession();
  if (!session.ok) return [];

  const admin = adminDb();
  if (!admin) return [];

  const { data } = await admin
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  const posts = (data ?? []).map((r) => normalizePost(r as Record<string, unknown>));
  return attachAuthors(posts);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function fetchAdminCommunityPosts(): Promise<{
  rows: CommunityPostRow[];
  error?: string;
}> {
  const auth = await requireAdmin();
  if (!auth.ok) return { rows: [], error: auth.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  const posts = (data ?? []).map((r) => normalizePost(r as Record<string, unknown>));
  const withAuthors = await attachAuthors(posts);
  return { rows: withAuthors };
}

export async function adminUpdatePostStatus(
  postId: string,
  status: PostStatus
): Promise<CommunityResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("community_posts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action: `community_post.${status}`,
    entityType: "community_posts",
    entityId: postId,
  });

  return { ok: true, data: { id: postId } };
}

export async function adminRemoveComment(commentId: string): Promise<CommunityResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: comment } = await admin
    .from("community_comments")
    .select("post_id")
    .eq("id", commentId)
    .maybeSingle();

  const { error } = await admin
    .from("community_comments")
    .update({ status: "hidden" })
    .eq("id", commentId);

  if (error) return { ok: false, error: error.message };

  if (comment) {
    await syncCommentCount((comment as { post_id: string }).post_id);
  }

  await logAdminAudit({
    action: "community_comment.remove",
    entityType: "community_comments",
    entityId: commentId,
  });

  return { ok: true, data: { id: commentId } };
}

export async function fetchAdminCommunityReports(): Promise<{
  rows: Array<Record<string, unknown>>;
  error?: string;
}> {
  const auth = await requireAdmin();
  if (!auth.ok) return { rows: [], error: auth.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("community_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as Array<Record<string, unknown>> };
}

export async function adminResolveCommunityReport(
  reportId: string,
  status: "reviewed" | "dismissed"
): Promise<CommunityResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("community_reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: reportId } };
}

export async function adminSuspendUser(userId: string, suspend: boolean): Promise<CommunityResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("profiles")
    .update({ is_active: !suspend, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action: suspend ? "user.suspend" : "user.unsuspend",
    entityType: "profiles",
    entityId: userId,
  });

  return { ok: true, data: { id: userId } };
}

export async function fetchAdminCommunityComments(postId?: string): Promise<CommunityCommentRow[]> {
  const auth = await requireAdmin();
  if (!auth.ok) return [];

  const admin = adminDb();
  if (!admin) return [];

  let q = admin
    .from("community_comments")
    .select("id, post_id, user_id, body, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (postId) q = q.eq("post_id", postId);

  const { data } = await q;
  const comments = (data ?? []) as CommunityCommentRow[];
  const withAuthors = await attachAuthors(comments);
  return withAuthors.map((c) => ({
    id: c.id,
    post_id: c.post_id,
    user_id: c.user_id,
    body: c.body,
    status: c.status,
    created_at: c.created_at,
    author_name: c.author_name,
  }));
}

export { isCommunityStorageReady };
