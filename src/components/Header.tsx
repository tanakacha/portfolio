'use client';

import { COLOR_PALETTE } from "@/lib/constants";
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
              <li 
                className="font-medium cursor-pointer transition-colors"
                style={{ color: COLOR_PALETTE.hex.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.gray;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.text;
                }}
              >
                Top
              </li>
              <li 
                className="font-medium cursor-pointer transition-colors"
                style={{ color: COLOR_PALETTE.hex.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.gray;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.text;
                }}
              >
                Works
              </li>
              <li 
                className="font-medium cursor-pointer transition-colors"
                style={{ color: COLOR_PALETTE.hex.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.gray;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLOR_PALETTE.hex.text;
                }}
              >
                History
              </li>
            </ul>
          </nav>
        </nav>
        
        {/* モバイル用ハンバーガーメニューボタン */}
        {/* <button>
          ☰
        </button> */}
      </div>
    </header>
  );
}
