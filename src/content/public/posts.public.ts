import "server-only";
import { Post } from "@/types/post";
import { getPublicSupabase } from "@/lib/supabase";

type Row = {
  id: number;
  body: string;
  created_at: string;
  like_count: number;
  next_post_id: number | null;
};

export async function getPublicPosts(): Promise<Post[]> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("id, body, created_at, like_count, next_post_id")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getPublicPosts: ${error.message}`);
  return (data as Row[]).map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    likeCount: r.like_count,
    nextPostId: r.next_post_id,
  }));
}
