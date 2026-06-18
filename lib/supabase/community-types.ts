export const PUBLIC_POST_STATUS = "approved" as const;

export const POST_STATUSES = ["pending", "approved", "hidden", "rejected"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export type CommunityPostRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  destination: string | null;
  image_url: string | null;
  status: PostStatus;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  liked_by_me?: boolean;
  following_author?: boolean;
};

export type CommunityCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  status: string;
  created_at: string;
  author_name?: string | null;
};

export const COMMUNITY_POST_SELECT =
  "id, user_id, title, body, destination, image_url, status, like_count, comment_count, created_at, updated_at";
