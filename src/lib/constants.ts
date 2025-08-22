// カラーパレット定義（16進数値）
export const COLOR_PALETTE = {
  hex: {
    white: '#FFFFFF',      // ベース背景色
    pink: '#F3B6B4',       // ブランドカラー（優しいピンク）
    gray: '#A6A8B2',       // ニュートラル（グレー）
    lime: '#A5DBC0',       // ポイントカラー（ライムグリーン）
    lightNavy: '#8A91D3',  // サブカラー（薄い紺）
    sky: '#7CC4E8',        // アクション（水色）
    navy: '#6C7EBC',       // プライマリー（紺）
    text: '#192138',       // テキスト（ダークネイビー）
  }
} as const;

// ナビゲーションアイテム
export const NAVIGATION_ITEMS = [
  { id: "top", label: "Top", href: "#top" },
  { id: "works", label: "Works", href: "#works" },
  { id: "history", label: "History", href: "#history" }
] as const;
