export const DESIGN_TOKENS = {
  // ヘッダー＆ブランディング
  brandTitle: "text-mypalette-pink",            // ブランドタイトル（ピンク）
  brandTitleHover: "hover:text-mypalette-navy", // ブランドタイトルホバー（紺）
  
  // ナビゲーション状態
  navigationActive: "text-mypalette-navy",      // アクティブなナビ項目（紺）
  navigationDefault: "text-mypalette-gray",     // デフォルトナビ項目（グレー）
  navigationHover: "hover:text-mypalette-sky",  // ナビホバー効果（水色）
  
  // テーマカラー
  primaryText: "text-mypalette-navy",           // メインテキスト（紺）
  accentText: "text-mypalette-pink",            // アクセントテキスト（ピンク）
  highlightText: "text-mypalette-lime"          // ハイライトテキスト（ライムグリーン）
} as const;

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
