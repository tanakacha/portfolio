import "server-only";
import { getAdminSupabase } from "./supabase";
import { AUTH_SECRET } from "./env";

export const LOGIN_RATE_LIMIT_WINDOW_MINUTES = 15;
export const LOGIN_RATE_LIMIT_MAX_FAILURES = 10;

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

export async function hashIp(ip: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(ip));
  return toHex(new Uint8Array(sig));
}

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }
  const real = headers.get("x-real-ip");
  if (real) return normalizeIp(real);
  return "unknown";
}

// IPv6 はプライバシー拡張 (RFC 4941) でホスト部 (下位 64bit) が動的に変わるため、
// /64 プレフィックスだけを使うことで同一ネットワークからのアクセスを束ねる。
// IPv4 はそのまま 32bit すべて使用する。
function normalizeIp(ip: string): string {
  if (!ip.includes(":")) return ip;
  const withoutZone = ip.split("%")[0] ?? ip;
  const groups = expandIpv6(withoutZone);
  if (!groups) return ip;
  return groups.slice(0, 4).join(":") + "::/64";
}

function expandIpv6(ip: string): string[] | null {
  const parts = ip.split("::");
  if (parts.length > 2) return null;
  const head = parts[0] ? parts[0].split(":") : [];
  const tail = parts.length === 2 && parts[1] ? parts[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0) return null;
  if (parts.length === 1 && head.length !== 8) return null;
  const zeros = Array(missing).fill("0");
  const full = [...head, ...zeros, ...tail];
  if (full.length !== 8) return null;
  return full.map((g) => g.toLowerCase().replace(/^0+(?=.)/, ""));
}

export async function isLoginRateLimited(ipHash: string): Promise<boolean> {
  const supabase = getAdminSupabase();
  const since = new Date(
    Date.now() - LOGIN_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();
  const { count, error } = await supabase
    .from("auth_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("attempted_at", since);
  if (error) {
    console.error("[rate-limit] count failed", error);
    return false;
  }
  return (count ?? 0) >= LOGIN_RATE_LIMIT_MAX_FAILURES;
}

export async function recordLoginFailure(ipHash: string): Promise<void> {
  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from("auth_attempts")
    .insert({ ip_hash: ipHash });
  if (error) console.error("[rate-limit] insert failed", error);
}
