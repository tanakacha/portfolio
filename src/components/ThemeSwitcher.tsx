'use client';

import { useEffect, useState } from 'react';
import {
  THEME_COLORS,
  THEME_NAMES,
  DEFAULT_THEME_NAME,
  THEME_STORAGE_KEY,
  type ThemeName,
} from '@/lib/constants';

function applyTheme(name: ThemeName) {
  const t = THEME_COLORS[name];
  const root = document.documentElement;
  root.style.setProperty('--theme-background', t.background);
  root.style.setProperty('--theme-text', t.text);
  root.style.setProperty('--theme-text-secondary', t.textSecondary);
  root.style.setProperty('--theme-border', t.border);
  root.style.setProperty('--theme-accent', t.accent);
}

export default function ThemeSwitcher() {
  const [current, setCurrent] = useState<ThemeName>(DEFAULT_THEME_NAME);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
    if (stored && THEME_NAMES.includes(stored)) {
      setCurrent(stored);
      applyTheme(stored);
    }
  }, []);

  const handleSwitch = () => {
    const others = THEME_NAMES.filter((n) => n !== current);
    if (others.length === 0) return;
    const next = others[Math.floor(Math.random() * others.length)];
    setCurrent(next);
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className="text-sm transition-opacity hover:opacity-70 bg-transparent p-1"
      style={{ color: 'var(--theme-text)', border: 'none' }}
      aria-label="テーマカラーをランダムに切り替え"
      title="テーマカラーを切り替え"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125 0-.939.726-1.688 1.688-1.688H16c3.314 0 6-2.686 6-6 0-4.962-4.484-9-10-9z" />
      </svg>
    </button>
  );
}
