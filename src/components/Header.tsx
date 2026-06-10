'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CURRENT_THEME, NAVIGATION_ITEMS } from '@/lib/constants';
import ThemeSwitcher from './ThemeSwitcher';

type Variant = 'public' | 'private';

interface HeaderProps {
  variant?: Variant;
  isAuthed?: boolean;
  title: string;
}

export default function Header({ variant = 'public', isAuthed = false, title }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (href: string) => {
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const section = document.querySelector(href);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const AuthAction = () => {
    if (variant === 'private') {
      return (
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm transition-colors min-w-[4.5rem] text-center"
            style={{ color: CURRENT_THEME.textSecondary }}
          >
            ← Public
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm transition-colors"
              style={{ color: CURRENT_THEME.textSecondary }}
            >
              Logout
            </button>
          </form>
        </div>
      );
    }
    if (isAuthed) {
      return (
        <div className="flex items-center gap-4">
          <Link
            href="/private"
            className="text-sm transition-colors min-w-[4.5rem] text-center"
            style={{ color: CURRENT_THEME.text }}
          >
            Private →
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm transition-colors"
              style={{ color: CURRENT_THEME.textSecondary }}
            >
              Logout
            </button>
          </form>
        </div>
      );
    }
    return (
      <Link
        href="/login"
        className="text-sm transition-colors min-w-[4.5rem] text-center"
        style={{ color: CURRENT_THEME.textSecondary }}
      >
        Private →
      </Link>
    );
  };

  return (
    <header
      className="fixed top-0 left-0 w-full shadow-sm z-50"
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <div
            className="text-xl font-bold transition-colors"
            style={{ color: CURRENT_THEME.text }}
          >
            {title}
          </div>
          <div className="flex items-center gap-8">
            <ul className="hidden md:flex space-x-8">
              {NAVIGATION_ITEMS.map((item) => (
                <li
                  key={item.id}
                  className="font-medium cursor-pointer transition-colors"
                  style={{ color: CURRENT_THEME.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = CURRENT_THEME.textSecondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = CURRENT_THEME.text;
                  }}
                  onClick={() => handleNavClick(item.href)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
            <div className="hidden md:flex items-center gap-3">
              <ThemeSwitcher />
              <AuthAction />
            </div>
            <div className="md:hidden flex items-center gap-2">
              <ThemeSwitcher />
              <button
                className="text-xl transition-colors"
                style={{ color: CURRENT_THEME.text }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open menu"
              >
                ☰
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ backgroundColor: CURRENT_THEME.background }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-end">
            <button
              className="text-2xl transition-colors"
              style={{ color: CURRENT_THEME.text }}
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-full space-y-8 -mt-16">
          {NAVIGATION_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="text-2xl font-medium transition-colors"
              style={{ color: CURRENT_THEME.text }}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                handleNavClick(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
          <div className="mt-8">
            <AuthAction />
          </div>
        </div>
      </div>
    </header>
  );
}
