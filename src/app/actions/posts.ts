"use server";

import { getPublicSupabase } from "@/lib/supabase";

export async function likePost(postId: number): Promise<number> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase.rpc("increment_post_like", {
    p_post_id: postId,
  });
  if (error) throw new Error(`likePost: ${error.message}`);
  return data as number;
}
