import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSSクラスを統合するユーティリティ関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// スムーズスクロール関数
export function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

// next/image の placeholder="blur" 用。テーマ切替は非同期なので
// CSS 変数ではなくニュートラルな静的色 (default テーマ近似) を埋め込む
export const BLUR_DATA_URL =
  "data:image/svg+xml;xcharset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'8'%20height%3D'5'%3E%3Crect%20width%3D'8'%20height%3D'5'%20fill%3D'%23f5efe6'%2F%3E%3C%2Fsvg%3E";
