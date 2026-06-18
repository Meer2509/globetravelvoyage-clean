import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CommunityPostDetail } from "@/components/community/CommunityPostDetail";
import {
  fetchPublicCommunityPost,
  fetchPostComments,
} from "@/lib/supabase/community-actions";
import { requireSession } from "@/lib/auth-server";

type Props = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchPublicCommunityPost(postId);
  if (!post) return { title: "Post not found — Globe Travel Voyage" };
  return {
    title: `${post.title} — Travel Community`,
    description: post.body.slice(0, 160),
  };
}

export default async function CommunityPostPage({ params }: Props) {
  const { postId } = await params;
  const [post, comments, session] = await Promise.all([
    fetchPublicCommunityPost(postId),
    fetchPostComments(postId),
    requireSession(),
  ]);

  if (!post) notFound();

  return (
    <CommunityPostDetail
      post={post}
      comments={comments}
      isLoggedIn={session.ok}
    />
  );
}
