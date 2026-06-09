'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 「最終訪問以降に追加されたか」を判定するためのフック
 * - storageKey: localStorage キー
 * - latestCreatedAt: 全アイテム中の最新 created_at (ISO)
 * - 初回訪問 (last_seen が未保存) では isNew は常に false (= NEW を出さない)
 * - 保存はマウント後 SAVE_DELAY_MS 経過時に行う (即離脱では NEW が維持される)
 * - firstVisitCampaign: 初回訪問者にも一時的に NEW を見せたい期間。
 *     `firstVisitThreshold` 以降に追加されたものを NEW 扱いにする (`firstVisitEnd` まで)
 */
const SAVE_DELAY_MS = 5 * 60 * 1000; // 5 分

interface FirstVisitCampaign {
  /** この時刻以降に追加された createdAt を NEW 扱いにする (ISO) */
  threshold: string;
  /** この時刻を過ぎたらキャンペーン無効 (ISO) */
  end: string;
}

export function useLastSeen(
  storageKey: string,
  latestCreatedAt: string | undefined,
  firstVisitCampaign?: FirstVisitCampaign,
) {
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const latestRef = useRef(latestCreatedAt);

  useEffect(() => {
    latestRef.current = latestCreatedAt;
  }, [latestCreatedAt]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setLastSeen(stored);
    } catch {
      // ignore
    }
    setMounted(true);

    // 一定時間ページに留まったら lastSeen を保存
    const timerId = setTimeout(() => {
      const latest = latestRef.current;
      if (latest) {
        try {
          localStorage.setItem(storageKey, latest);
        } catch {
          // ignore
        }
      }
    }, SAVE_DELAY_MS);

    return () => clearTimeout(timerId);
  }, [storageKey]);

  // 初回訪問者向けキャンペーンが有効なら、null の代わりに threshold を使う
  const effectiveLastSeen = (() => {
    if (lastSeen !== null) return lastSeen;
    if (!firstVisitCampaign) return null;
    if (Date.now() >= new Date(firstVisitCampaign.end).getTime()) return null;
    return firstVisitCampaign.threshold;
  })();

  const isNew = (createdAt: string): boolean => {
    if (!mounted || effectiveLastSeen === null) return false;
    // ISO 文字列のフォーマット差異 (Z vs +00:00) を吸収するため Date で比較
    return new Date(createdAt).getTime() > new Date(effectiveLastSeen).getTime();
  };

  return { isNew, mounted };
}
