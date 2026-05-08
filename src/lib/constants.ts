// テーマカラーセット定義
export const THEME_COLORS = {
  /// ライトモード
  // デフォルトテーマ(ボーダー：ピンク、アクセント：ライム)
  default: {
    background: '#FFFFFF',
    text: '#192138',
    textSecondary: '#A6A8B2',
    border: '#F3B6B4',
    accent: '#A5DBC0',
  },
  // ライムテーマ(ボーダー：ライム、アクセント：ピンク)
  lime: {
    background: '#FFFFFF',
    text: '#192138',
    textSecondary: '#A6A8B2',
    border: '#A5DBC0',
    accent: '#F3B6B4',
  },
} as const;

// テーマ名のリスト (ランダム切替や localStorage 永続化で使う)
export type ThemeName = keyof typeof THEME_COLORS;
export const THEME_NAMES = Object.keys(THEME_COLORS) as ThemeName[];
export const DEFAULT_THEME_NAME: ThemeName = 'default';
export const THEME_STORAGE_KEY = 'site:themeName';

// UI コンポーネントが参照する色は CSS 変数経由にする (テーマ切替で動的に変わる)
// 値の実体は globals.css の :root と ThemeSwitcher 経由で書き換わる
export const CURRENT_THEME = {
  background: 'var(--theme-background)',
  text: 'var(--theme-text)',
  textSecondary: 'var(--theme-text-secondary)',
  border: 'var(--theme-border)',
  accent: 'var(--theme-accent)',
} as const;

// 本番サイト URL (metadata / OG / sitemap で使用)
export const SITE_URL = "https://portfolio-pearl-five-82.vercel.app";

// ナビゲーションアイテム
export const NAVIGATION_ITEMS = [
  { id: "top", label: "Top", href: "#top" },
  { id: "works", label: "Works", href: "#works" },
  { id: "history", label: "History", href: "#history" }
] as const;
