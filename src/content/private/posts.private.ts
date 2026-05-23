import "server-only";
import { Post } from "@/types/post";
import { ReactionKey } from "@/lib/reactions";
import { getAdminSupabase } from "@/lib/supabase";

type PostRow = {
  id: number;
  body: string;
  created_at: string;
  published_at: string | null;
  next_post_id: number | null;
};

type ReactionRow = {
  post_id: number;
  reaction_key: string;
  count: number;
};

export async function getPrivatePosts(): Promise<Post[]> {
  const supabase = getAdminSupabase();
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("id, body, created_at, published_at, next_post_id")
    .neq("visibility", "draft")
    .order("published_at", { ascending: false });
  if (postsError) throw new Error(`getPrivatePosts: ${postsError.message}`);
  const posts = postsData as PostRow[];
  if (posts.length === 0) return [];

  const { data: reactionsData, error: reactionsError } = await supabase
    .from("post_reactions")
    .select("post_id, reaction_key, count")
    .in(
      "post_id",
      posts.map((p) => p.id),
    );
  if (reactionsError)
    throw new Error(`getPrivatePosts (reactions): ${reactionsError.message}`);

  const reactionsByPost = new Map<number, Partial<Record<ReactionKey, number>>>();
  for (const r of reactionsData as ReactionRow[]) {
    const existing = reactionsByPost.get(r.post_id) ?? {};
    existing[r.reaction_key as ReactionKey] = r.count;
    reactionsByPost.set(r.post_id, existing);
  }
  return posts.map((p) => ({
    id: p.id,
    body: p.body,
    createdAt: p.created_at,
    publishedAt: p.published_at,
    reactions: reactionsByPost.get(p.id) ?? {},
    nextPostId: p.next_post_id,
  }));
}
