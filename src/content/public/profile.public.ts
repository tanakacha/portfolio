import "server-only";
import { PublicProfile } from "@/types/profile";
import { getPublicSupabase } from "@/lib/supabase";

export async function getPublicProfile(): Promise<PublicProfile> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("public_profile")
    .select("display_name, tagline, hobbies, profile_image_path")
    .eq("id", 1)
    .single();
  if (error) throw new Error(`getPublicProfile: ${error.message}`);
  return {
    displayName: data.display_name,
    tagline: data.tagline ?? "",
    hobbies: data.hobbies ?? [],
    profileImage: data.profile_image_path ?? undefined,
  };
}
