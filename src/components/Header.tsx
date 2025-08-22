'use client';

import { COLOR_PALETTE, NAVIGATION_ITEMS } from "@/lib/constants";
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header 
      className="fixed top-0 left-0 w-full shadow-sm z-50"
      style={{ backgroundColor: COLOR_PALETTE.hex.white }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <div 
            className="text-xl font-bold cursor-pointer transition-colors"
            style={{ color: COLOR_PALETTE.hex.text }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLOR_PALETTE.hex.navy;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLOR_PALETTE.hex.text;
            }}
          >
            田中智彩
          </div>
          <nav>
            <ul className="hidden md:flex space-x-8">
              {NAVIGATION_ITEMS.map((item) => (
                <li 
                  key={item.id}
                  className="font-medium cursor-pointer transition-colors"
                  style={{ color: COLOR_PALETTE.hex.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLOR_PALETTE.hex.gray;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLOR_PALETTE.hex.text;
                  }}
                >
                  {item.label}
                </li>
              ))}
            </ul>
            {/* モバイル用ハンバーガーメニューボタン */}
            <button
              className="md:hidden text-xl transition-colors"
              style={{ color: COLOR_PALETTE.hex.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLOR_PALETTE.hex.gray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = COLOR_PALETTE.hex.text;
              }}
              onClick={() => setIsOpen(!isOpen)}
            >
              ☰
            </button>
          </nav>
        </nav>
      </div>

      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-500 ease-in-out ${
          isOpen 
            ? 'opacity-100 visible' 
            : 'opacity-0 invisible'
        }`}
        style={{ backgroundColor: COLOR_PALETTE.hex.white }}
      >
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-end">
              <button
                className="text-2xl transition-colors"
                style={{ color: COLOR_PALETTE.hex.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.gray;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.text;
                }}
                onClick={() => setIsOpen(false)}
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
                style={{ color: COLOR_PALETTE.hex.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.sky;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.text;
                }}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      
    </header>
  );
}
