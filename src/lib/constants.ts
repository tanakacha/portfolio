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

// 現在のテーマ
export const CURRENT_THEME = THEME_COLORS.default;

// ナビゲーションアイテム
export const NAVIGATION_ITEMS = [
  { id: "top", label: "Top", href: "#top" },
  { id: "works", label: "Works", href: "#works" },
  { id: "history", label: "History", href: "#history" }
] as const;
