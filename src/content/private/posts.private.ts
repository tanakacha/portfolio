import "server-only";
import { Post } from "@/types/post";
import { getAdminSupabase } from "@/lib/supabase";

type Row = {
  id: number;
  body: string;
  created_at: string;
  like_count: number;
  next_post_id: number | null;
};

export async function getPrivatePosts(): Promise<Post[]> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("id, body, created_at, like_count, next_post_id")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getPrivatePosts: ${error.message}`);
  return (data as Row[]).map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    likeCount: r.like_count,
    nextPostId: r.next_post_id,
  }));
}
