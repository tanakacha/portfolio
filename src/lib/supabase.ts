import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} from "./env";

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

const baseOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
};

export function getPublicSupabase(): SupabaseClient {
  if (!publicClient) {
    publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, baseOptions);
  }
  return publicClient;
}

export function getAdminSupabase(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      baseOptions,
    );
  }
  return adminClient;
}

export const PROFILE_IMAGES_BUCKET = "profile-images";
export const PROFILE_IMAGE_TTL_SECONDS = 60 * 60;
