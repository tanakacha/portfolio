import type { Metadata } from "next";
import Link from "next/link";
import { CURRENT_THEME } from "@/lib/constants";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ from?: string; error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : "/private";
  const hasError = params.error === "1";
  const isRateLimited = params.error === "ratelimit";

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div
        className="w-full max-w-sm rounded-lg border-2 p-8 shadow"
        style={{ borderColor: CURRENT_THEME.border }}
      >
        <h1
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: CURRENT_THEME.text }}
        >
          Private
        </h1>
        <form action="/api/auth/login" method="POST" className="flex flex-col gap-4">
          <input type="hidden" name="from" value={from} />
          <label
            className="flex flex-col gap-2 text-sm"
            style={{ color: CURRENT_THEME.text }}
          >
            パスワード
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={isRateLimited}
              className="border rounded px-3 py-2 text-base disabled:cursor-not-allowed"
              style={{
                borderColor: isRateLimited ? "#d4d4d4" : CURRENT_THEME.border,
                backgroundColor: isRateLimited ? "#f5f5f5" : "transparent",
                color: isRateLimited ? "#a3a3a3" : CURRENT_THEME.text,
              }}
            />
          </label>
          {hasError && (
            <p className="text-sm" style={{ color: CURRENT_THEME.border }}>
              パスワードが違います
            </p>
          )}
          {isRateLimited && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: CURRENT_THEME.border }}
            >
              試行回数が多すぎます。しばらく時間を置いてから、ページを再読み込みしてお試しください。<br />
              公開ページは <Link href="/" className="underline">こちら</Link> から見られます。<br />
              パスワードが分からない場合はご連絡ください。
            </p>
          )}
          <p
            className="text-xs leading-relaxed"
            style={{ color: CURRENT_THEME.textSecondary }}
          >
            ヒント: 好きな短歌の初句（ローマ字）+ 大量に作りたいお菓子(英語)
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: CURRENT_THEME.textSecondary }}
          >
            知り合いの方へ: 顔写真が検索で引っかからないようにしたいだけなので、いつでも連絡ください
          </p>
          <button
            type="submit"
            disabled={isRateLimited}
            className="rounded px-4 py-2 font-medium transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: CURRENT_THEME.border, color: CURRENT_THEME.background }}
          >
            Enter
          </button>
          <Link
            href="/"
            className="text-sm text-center mt-2"
            style={{ color: CURRENT_THEME.textSecondary }}
          >
            ← Public に戻る
          </Link>
        </form>
      </div>
    </main>
  );
}
