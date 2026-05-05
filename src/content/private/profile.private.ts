import "server-only";
import { PrivateProfile } from "@/types/profile";
import {
  getAdminSupabase,
  PROFILE_IMAGES_BUCKET,
  PROFILE_IMAGE_TTL_SECONDS,
} from "@/lib/supabase";

export async function getPrivateProfile(): Promise<PrivateProfile> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("private_profile")
    .select("full_name, university, major, hobbies, profile_image_path")
    .eq("id", 1)
    .single();
  if (error) throw new Error(`getPrivateProfile: ${error.message}`);

  const { data: signed, error: signErr } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .createSignedUrl(data.profile_image_path, PROFILE_IMAGE_TTL_SECONDS);
  if (signErr) throw new Error(`getPrivateProfile signedUrl: ${signErr.message}`);

  return {
    fullName: data.full_name,
    university: data.university ?? "",
    major: data.major ?? "",
    hobbies: data.hobbies ?? [],
    profileImage: signed.signedUrl,
  };
}
