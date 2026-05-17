import "server-only";
import { getAdminSupabase } from "./supabase";
import { AUTH_SECRET, DISCORD_ALERT_WEBHOOK_URL } from "./env";

// 段階的ロックアウト: いずれかの条件を満たすとロック
// (短期の brute force と、IP 切替や時間をかけた総当たり攻撃の両方を捉える)
const LOGIN_LOCKOUT_TIERS = [
  { windowMinutes: 15, maxFailures: 5 },
  { windowMinutes: 60, maxFailures: 10 },
  { windowMinutes: 60 * 24, maxFailures: 20 },
] as const;

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
  const now = Date.now();
  // 最大ウィンドウ (24h) 分の試行を取得し、各ティアの判定はメモリ上で行う
  const longestWindowMs = Math.max(...LOGIN_LOCKOUT_TIERS.map((t) => t.windowMinutes)) * 60 * 1000;
  const since = new Date(now - longestWindowMs).toISOString();
  const { data, error } = await supabase
    .from("auth_attempts")
    .select("attempted_at")
    .eq("ip_hash", ipHash)
    .gte("attempted_at", since);
  if (error) {
    console.error("[rate-limit] count failed", error);
    return false;
  }
  if (!data) return false;
  const timestamps = data.map((r) => new Date(r.attempted_at).getTime());
  return LOGIN_LOCKOUT_TIERS.some(
    (tier) =>
      timestamps.filter((t) => now - t <= tier.windowMinutes * 60 * 1000).length >=
      tier.maxFailures,
  );
}

export async function recordLoginFailure(ipHash: string): Promise<void> {
  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from("auth_attempts")
    .insert({ ip_hash: ipHash });
  if (error) {
    console.error("[rate-limit] insert failed", error);
    return;
  }
  await maybeAlertOnLockout(ipHash);
}

// この失敗で「ちょうどロックアウト閾値に到達した」場合のみ通知する。
// 各ティアで「count == 閾値」の瞬間だけ発火するので、同じ攻撃で最大 3通 (5/10/20)。
async function maybeAlertOnLockout(ipHash: string): Promise<void> {
  if (!DISCORD_ALERT_WEBHOOK_URL) return;
  const supabase = getAdminSupabase();
  const now = Date.now();
  const longestWindowMs =
    Math.max(...LOGIN_LOCKOUT_TIERS.map((t) => t.windowMinutes)) * 60 * 1000;
  const since = new Date(now - longestWindowMs).toISOString();
  const { data, error } = await supabase
    .from("auth_attempts")
    .select("attempted_at")
    .eq("ip_hash", ipHash)
    .gte("attempted_at", since);
  if (error || !data) return;
  const timestamps = data.map((r) => new Date(r.attempted_at).getTime());
  const crossed = LOGIN_LOCKOUT_TIERS.filter(
    (tier) =>
      timestamps.filter((t) => now - t <= tier.windowMinutes * 60 * 1000).length ===
      tier.maxFailures,
  );
  if (crossed.length === 0) return;
  await sendDiscordAlert(ipHash, crossed);
}

async function sendDiscordAlert(
  ipHash: string,
  crossed: readonly { windowMinutes: number; maxFailures: number }[],
): Promise<void> {
  if (!DISCORD_ALERT_WEBHOOK_URL) return;
  const tierLines = crossed
    .map((t) => `- 直近 ${t.windowMinutes} 分以内に ${t.maxFailures} 回失敗`)
    .join("\n");
  const content = [
    "[Portfolio] ログインロックアウトが発火しました",
    `ip_hash (先頭12文字): \`${ipHash.slice(0, 12)}\``,
    "条件:",
    tierLines,
  ].join("\n");
  try {
    const res = await fetch(DISCORD_ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      console.error("[rate-limit] discord alert non-ok", res.status);
    }
  } catch (e) {
    console.error("[rate-limit] discord alert failed", e);
  }
}
