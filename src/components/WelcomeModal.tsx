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
        className="w-full max-w-sm rounded-lg border-2 p-8 shadow-lg"
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
          限定ページの方が、プロフィールや History を少し詳しく載せています。
        </p>

        <form
          action="/api/auth/login"
          method="POST"
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="from" value="/private" />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="パスワード"
            className="border rounded px-3 py-2 text-base"
            style={{
              borderColor: CURRENT_THEME.border,
              color: CURRENT_THEME.text,
            }}
          />
          <button
            type="submit"
            className="rounded px-4 py-2 font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: CURRENT_THEME.border,
              color: CURRENT_THEME.background,
            }}
          >
            限定ページに入る
          </button>
        </form>

        <div
          className="flex items-center gap-3 my-5 text-xs"
          style={{ color: CURRENT_THEME.textSecondary }}
        >
          <div className="flex-1 h-px" style={{ backgroundColor: CURRENT_THEME.textSecondary }} />
          <span>または</span>
          <div className="flex-1 h-px" style={{ backgroundColor: CURRENT_THEME.textSecondary }} />
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="w-full rounded px-4 py-2 text-sm border-2 transition-opacity hover:opacity-80"
          style={{
            borderColor: CURRENT_THEME.border,
            color: CURRENT_THEME.text,
            backgroundColor: 'transparent',
          }}
        >
          一般公開ページを見る
        </button>
      </div>
    </div>
  );
}
