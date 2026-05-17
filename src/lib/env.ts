import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const AUTH_SECRET = required("AUTH_SECRET");
export const SITE_PASSWORD = required("SITE_PASSWORD");
export const SUPABASE_URL = required("SUPABASE_URL");
export const SUPABASE_ANON_KEY = required("SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = required("SUPABASE_SERVICE_ROLE_KEY");
// 設定されていれば、ロックアウト発火時に Discord Webhook 経由で通知する
export const DISCORD_ALERT_WEBHOOK_URL = optional("DISCORD_ALERT_WEBHOOK_URL");
