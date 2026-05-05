import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const AUTH_SECRET = required("AUTH_SECRET");
export const SITE_PASSWORD = required("SITE_PASSWORD");
export const SUPABASE_URL = required("SUPABASE_URL");
export const SUPABASE_ANON_KEY = required("SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = required("SUPABASE_SERVICE_ROLE_KEY");
