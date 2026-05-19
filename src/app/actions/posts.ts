"use server";

import { getPublicSupabase } from "@/lib/supabase";
import type { ReactionKey } from "@/lib/reactions";

export async function addReaction(
  postId: number,
  key: ReactionKey,
): Promise<number> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase.rpc("increment_post_reaction", {
    p_post_id: postId,
    p_key: key,
  });
  if (error) throw new Error(`addReaction: ${error.message}`);
  return data as number;
}

export async function removeReaction(
  postId: number,
  key: ReactionKey,
): Promise<number> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase.rpc("decrement_post_reaction", {
    p_post_id: postId,
    p_key: key,
  });
  if (error) throw new Error(`removeReaction: ${error.message}`);
  return data as number;
}
