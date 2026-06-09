'use client';

import { useEffect, useState } from 'react';
import { CURRENT_THEME } from '@/lib/constants';

const STORAGE_KEY = 'pf_welcome_seen';

interface WelcomeModalProps {
  isAuthed: boolean;
}

export default function WelcomeModal({ isAuthed }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isAuthed) return;
    // レート制限経由で公開ページに来た場合は、モーダルを出さない
    // (localStorage は触らないので、後日普通に訪問すれば再度表示される)
    try {
      if (new URLSearchParams(window.location.search).get('welcome') === 'skip') return;
    } catch {
      // ignore
    }
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      return;
    }
    setVisible(true);
  }, [isAuthed]);

  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible]);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={dismiss}
    >
      <div
        className="w-full max-w-md rounded-lg border-2 p-8 shadow-lg"
        style={{
          borderColor: CURRENT_THEME.border,
          backgroundColor: CURRENT_THEME.background,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-xl font-bold mb-3 text-center"
          style={{ color: CURRENT_THEME.text }}
        >
          ようこそ！
        </h2>
        <p
          className="text-sm mb-6 text-center leading-relaxed"
          style={{ color: CURRENT_THEME.textSecondary }}
        >
          このサイトは公開ページが本体です。
          <br />
          限定ページは知り合い向けで、もう少しゆるい内容や、ちょっとした機能が増えています。
        </p>

        <button
          type="button"
          onClick={dismiss}
          className="w-full rounded px-4 py-2 font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: CURRENT_THEME.border,
            color: CURRENT_THEME.background,
          }}
        >
          公開ページを見る
        </button>

        <form
          action="/api/auth/login"
          method="POST"
          className="flex flex-col gap-2 text-left mt-6"
        >
          <div
            className="h-px mb-2"
            style={{ backgroundColor: CURRENT_THEME.textSecondary, opacity: 0.3 }}
          />
          <p
            className="text-xs leading-relaxed"
            style={{ color: CURRENT_THEME.textSecondary }}
          >
            知り合いの方へ: 顔写真が検索で引っかからないようにしたいだけなので、いつでも連絡ください
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: CURRENT_THEME.textSecondary }}
          >
            {/* 狭めモバイル (< 380px): "ヒント: ... +" / 右寄せ "大量..." */}
            <span className="whitespace-nowrap min-[380px]:hidden">ヒント: 好きな短歌の初句(ローマ字) +</span>
            <span className="block text-right whitespace-nowrap min-[380px]:hidden">大量に作りたいもの(英語)</span>
            {/* 中間モバイル (380-767px): "ヒント:" / 内容 */}
            <span className="hidden min-[380px]:inline md:hidden">ヒント:</span>
            <span className="hidden min-[380px]:block md:hidden whitespace-nowrap">好きな短歌の初句(ローマ字) + 大量に作りたいもの(英語)</span>
            {/* PC (≥ 768px): 1行 */}
            <span className="hidden md:inline whitespace-nowrap">ヒント: 好きな短歌の初句(ローマ字) + 大量に作りたいもの(英語)</span>
          </p>
          <input type="hidden" name="from" value="/private" />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="パスワード"
            className="border rounded px-3 py-2 text-sm"
            style={{
              borderColor: CURRENT_THEME.border,
              color: CURRENT_THEME.text,
            }}
          />
          <button
            type="submit"
            className="rounded px-4 py-2 text-sm border transition-opacity hover:opacity-80"
            style={{
              borderColor: CURRENT_THEME.border,
              color: CURRENT_THEME.text,
              backgroundColor: 'transparent',
            }}
          >
            限定ページに入る
          </button>
        </form>
      </div>
    </div>
  );
}
