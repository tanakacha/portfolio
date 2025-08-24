'use client';

import { works } from '@/content/works';
import Image from 'next/image';
import { CURRENT_THEME } from '@/lib/constants';
import { useState } from 'react';

// アイコンのマッピング
const iconMap: Record<string, { src: string; alt: string }> = {
  github: { src: '/icons/github.svg', alt: 'GitHub' },
  appStore: { src: '/icons/appstore.svg', alt: 'App Store' },
  googlePlay: { src: '/icons/googlePlay.png', alt: 'Google Play' },
};

const ImageWithLinks = ({ src, alt, links }: { src: string, alt: string, links?: { key: string, url: string }[] }) => (
  <div className="w-full flex flex-col items-center">
    {links && links.length > 0 && (
      <div className="flex flex-row gap-2 mb-3 items-center justify-center">
        {links.map((link, i) => {
          const iconInfo = iconMap[link.key];
          return (
            <a href={link.url} target="_blank" rel="noopener noreferrer" key={i} className="inline-block">
              {iconInfo ? (
                <Image
                  src={iconInfo.src}
                  alt={iconInfo.alt}
                  width={
                    link.key === 'appStore' ? 80 : 
                    link.key === 'googlePlay' ? 95 : 
                    24
                  }
                  height={
                    link.key === 'appStore' ? 30 : 
                    link.key === 'googlePlay' ? 28 : 
                    24
                  }
                  className="hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-400"></div>
              )}
            </a>
          );
        })}
      </div>
    )}
    <Image
      src={src}
      alt={alt}
      width={400}
      height={200}
      className="rounded object-cover"
      style={{ borderColor: CURRENT_THEME.border }}
    />
  </div>
);

export default function WorksSection() {
  const [imgIndexes, setImgIndexes] = useState(Array(works.length).fill(0));

  const handlePrev = (idx: number) => {
    setImgIndexes(arr => arr.map((v, i) => i === idx ? Math.max(v - 1, 0) : v));
  };
  const handleNext = (idx: number, imagesLen: number) => {
    setImgIndexes(arr => arr.map((v, i) => i === idx ? Math.min(v + 1, imagesLen - 1) : v));
  };

  return (
    <section
      id='works'
      className='py-16'
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className='max-w-6xl mx-auto px-4'>
        <h2
          className='text-2xl font-bold mb-8'
          style={{ color: CURRENT_THEME.text }}
        >
          Works
        </h2>
        <div className='flex flex-col gap-8'>
          {works.map((work, idx) => {
            const images = work.images ?? [];
            const imgIndex = imgIndexes[idx] ?? 0;
            const showPrev = imgIndex > 0;
            const showNext = imgIndex < images.length - 1;
            // linksオブジェクトを配列化
            const linkIcons = Object.entries(work.links ?? {}).filter(([, url]) => !!url).map(([key, url]) => ({ key, url }));

            return (
              <div
                key={work.id}
                className='flex flex-col md:flex-row items-center border-2 rounded-lg p-6 shadow'
                style={{
                  borderColor: CURRENT_THEME.border,
                  backgroundColor: CURRENT_THEME.background
                }}
              >
                {/* 左半分: タイトル+画像+説明（PC:タイトル+説明, モバイル:タイトル→画像→説明） */}
                <div className='w-full md:w-1/2 flex flex-col md:justify-start md:items-start md:self-start'>
                  <h3 
                    className='text-lg font-semibold mb-2 order-1'
                    style={{ color: CURRENT_THEME.text }}
                  >
                    {work.title}
                  </h3>
                  <div className='order-2 mb-4 md:hidden flex items-center justify-center gap-2'>
                    <button
                      onClick={() => handlePrev(idx)}
                      disabled={!showPrev}
                      className='px-2 py-1 rounded border border-gray-300 bg-white disabled:opacity-50'
                    >
                      ←
                    </button>
                    <ImageWithLinks src={images[imgIndex]} alt={work.title} links={linkIcons} />
                    <button
                      onClick={() => handleNext(idx, images.length)}
                      disabled={!showNext}
                      className='px-2 py-1 rounded border border-gray-300 bg-white disabled:opacity-50'
                    >
                      →
                    </button>
                  </div>
                  <div
                    className='text-sm order-3 md:order-1 md:pr-8'
                    style={{ color: CURRENT_THEME.text }}
                  >
                    {work.description.map((line, index) => (
                      <div key={index}>
                        {line === '' ? <br /> : line}
                      </div>
                    ))}
                  </div>
                </div>
                {/* 右半分: 画像（PCのみ表示） */}
                <div className='hidden md:flex w-1/2 justify-center md:justify-start items-center gap-2'>
                  <button
                    onClick={() => handlePrev(idx)}
                    disabled={!showPrev}
                    className='px-2 py-1 rounded border border-gray-300 bg-white disabled:opacity-50'
                  >
                    ←
                  </button>
                  <ImageWithLinks src={images[imgIndex]} alt={work.title} links={linkIcons} />
                  <button
                    onClick={() => handleNext(idx, images.length)}
                    disabled={!showNext}
                    className='px-2 py-1 rounded border border-gray-300 bg-white disabled:opacity-50'
                  >
                    →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}