'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import Image from 'next/image';
import { Work } from '@/types/work';
import { CURRENT_THEME } from '@/lib/constants';
import { BLUR_DATA_URL } from '@/lib/utils';

// Works カードの画像はビューポート幅に対して PC で max-w-6xl の半分(約 560px),
// モバイルで全幅相当 → next/image が適切な srcset を選べるように指定
const WORK_IMAGE_SIZES = '(min-width: 768px) 560px, 100vw';

const iconMap: Record<string, { src: string; alt: string }> = {
  github: { src: '/icons/github.svg', alt: 'GitHub' },
  appStore: { src: '/icons/appstore.svg', alt: 'App Store' },
  googlePlay: { src: '/icons/googlePlay.png', alt: 'Google Play' },
};

const AUTO_ADVANCE_MS = 5000;
const PAUSE_AFTER_INTERACTION_MS = 10000;
const SWIPE_THRESHOLD_PX = 50;

interface Props {
  work: Work;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="36"
      height="36"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === 'left' ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export default function WorkCard({ work }: Props) {
  const images = work.images ?? [];
  const links = Object.entries(work.links ?? {})
    .filter(([, url]) => !!url)
    .map(([key, url]) => ({ key, url }));

  // imgIndex: 本物の画像インデックス (0..N-1)
  // displayIndex: 表示位置 (0..N+1, 前後にクローンあり)
  //   0     = 最後の画像のクローン (左端)
  //   1..N  = 本物の 0..N-1
  //   N+1   = 最初の画像のクローン (右端)
  const NORMAL_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const LOOP_EASING = 'cubic-bezier(.7,0,.7,1)';

  const [imgIndex, setImgIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [transitionMs, setTransitionMs] = useState(420);
  const [transitionEasing, setTransitionEasing] = useState(NORMAL_EASING);
  const [isInView, setIsInView] = useState(false);
  const [pausedUntil, setPausedUntil] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || images.length <= 1) return;
    const interval = setInterval(() => {
      if (Date.now() < pausedUntil) return;
      goNext();
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, images.length, pausedUntil, imgIndex, displayIndex]);

  // unmount 時にタイマー掃除
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  if (images.length === 0) return null;

  const NORMAL_TRANSITION_MS = 420;
  const LOOP_TRANSITION_MS = 650;

  // 端→反対端のループ時は「クローン位置までアニメ → 本物の位置に瞬時切替」
  // ループ時は duration を長めにしてゆったり感を出す
  const goNext = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setTransitionEnabled(true);
    if (imgIndex === images.length - 1) {
      setTransitionMs(LOOP_TRANSITION_MS);
      setTransitionEasing(LOOP_EASING);
      setDisplayIndex(images.length + 1);
      setImgIndex(0);
      animTimerRef.current = setTimeout(() => {
        setTransitionEnabled(false);
        setDisplayIndex(1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionEnabled(true);
            setTransitionMs(NORMAL_TRANSITION_MS);
            setTransitionEasing(NORMAL_EASING);
          });
        });
      }, LOOP_TRANSITION_MS);
    } else {
      setTransitionMs(NORMAL_TRANSITION_MS);
      setTransitionEasing(NORMAL_EASING);
      setDisplayIndex(displayIndex + 1);
      setImgIndex(imgIndex + 1);
    }
    setPausedUntil(Date.now() + PAUSE_AFTER_INTERACTION_MS);
  };

  const goPrev = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setTransitionEnabled(true);
    if (imgIndex === 0) {
      setTransitionMs(LOOP_TRANSITION_MS);
      setTransitionEasing(LOOP_EASING);
      setDisplayIndex(0);
      setImgIndex(images.length - 1);
      animTimerRef.current = setTimeout(() => {
        setTransitionEnabled(false);
        setDisplayIndex(images.length);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionEnabled(true);
            setTransitionMs(NORMAL_TRANSITION_MS);
            setTransitionEasing(NORMAL_EASING);
          });
        });
      }, LOOP_TRANSITION_MS);
    } else {
      setTransitionMs(NORMAL_TRANSITION_MS);
      setTransitionEasing(NORMAL_EASING);
      setDisplayIndex(displayIndex - 1);
      setImgIndex(imgIndex - 1);
    }
    setPausedUntil(Date.now() + PAUSE_AFTER_INTERACTION_MS);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
      if (dx > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  };

  const LinkRow = links.length > 0 && (
    <div className="flex flex-row gap-2 items-center mb-3">
      {links.map((link, i) => {
        const iconInfo = iconMap[link.key];
        return (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            key={i}
            className="inline-block hover:opacity-80 transition-opacity"
          >
            {iconInfo ? (() => {
              const w = link.key === 'appStore' ? 80 : link.key === 'googlePlay' ? 95 : 24;
              const h = link.key === 'appStore' ? 30 : link.key === 'googlePlay' ? 28 : 24;
              return (
                <Image
                  src={iconInfo.src}
                  alt={iconInfo.alt}
                  width={w}
                  height={h}
                  style={{ width: `${w}px`, height: `${h}px` }}
                />
              );
            })() : (
              <div className="w-6 h-6 rounded-full bg-gray-400" />
            )}
          </a>
        );
      })}
    </div>
  );

  const ImageBlock = (
    <div className="w-full flex flex-col items-center">
      {/* リンクアイコン (画像の上) */}
      {LinkRow}
      <div
        className="relative w-full overflow-hidden rounded"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex w-full"
          style={{
            transform: `translateX(-${displayIndex * 100}%)`,
            transition: transitionEnabled
              ? `transform ${transitionMs}ms ${transitionEasing}`
              : 'none',
          }}
        >
          {/* 左端クローン: 最後の画像 */}
          <div className="w-full shrink-0">
            <Image
              src={images[images.length - 1]}
              alt=""
              width={400}
              height={200}
              sizes={WORK_IMAGE_SIZES}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="w-full h-auto object-cover"
              aria-hidden="true"
            />
          </div>
          {/* 本物 */}
          {images.map((src, i) => (
            <div key={i} className="w-full shrink-0">
              <Image
                src={src}
                alt={`${work.title} ${i + 1}/${images.length}`}
                width={400}
                height={200}
                sizes={WORK_IMAGE_SIZES}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
          {/* 右端クローン: 最初の画像 */}
          <div className="w-full shrink-0">
            <Image
              src={images[0]}
              alt=""
              width={400}
              height={200}
              sizes={WORK_IMAGE_SIZES}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="w-full h-auto object-cover"
              aria-hidden="true"
            />
          </div>
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-1 top-1/2 -translate-y-1/2 p-1 opacity-[0.55] hover:opacity-100 transition-opacity bg-transparent"
              style={{ color: CURRENT_THEME.text, border: 'none' }}
              aria-label="前の画像"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 opacity-[0.55] hover:opacity-100 transition-opacity bg-transparent"
              style={{ color: CURRENT_THEME.text, border: 'none' }}
              aria-label="次の画像"
            >
              <ChevronIcon direction="right" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex items-center gap-1 mt-2">
          {images.map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-opacity"
              style={{
                backgroundColor: CURRENT_THEME.border,
                opacity: i === imgIndex ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={cardRef}
      className="flex flex-col md:flex-row items-center border-2 rounded-lg p-6 shadow"
      style={{
        borderColor: CURRENT_THEME.border,
        backgroundColor: CURRENT_THEME.background,
      }}
    >
      <div className="w-full md:w-1/2 flex flex-col md:justify-start md:items-start md:self-start">
        <h3
          className="text-lg font-semibold mb-2 order-1"
          style={{ color: CURRENT_THEME.text }}
        >
          {work.title}
        </h3>
        {work.technologies.length > 0 && (
          <ul className="order-2 flex flex-wrap gap-2 mb-4">
            {work.technologies.map((tech, i) => (
              <li
                key={i}
                className="px-3 py-1 rounded-full text-xs border-2"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: CURRENT_THEME.border,
                  color: CURRENT_THEME.text,
                }}
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
        <div className="order-3 mb-4 md:hidden w-full">{ImageBlock}</div>
        <div
          className="text-sm order-4 md:order-3 md:pr-8 flex flex-col gap-4"
          style={{ color: CURRENT_THEME.text }}
        >
          <div>
            {work.description.map((line, index) => (
              <div key={index}>{line === '' ? <br /> : line}</div>
            ))}
          </div>

          {work.details.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {work.details.map((d) => (
                <Fragment key={d.id}>
                  <dt className="font-semibold whitespace-nowrap">
                    {d.label}
                  </dt>
                  <dd>{d.value}</dd>
                </Fragment>
              ))}
            </dl>
          )}

          {/* 開発秘話 */}
          {work.stories.length > 0 && (
            <div className="flex flex-col gap-3">
              {work.stories.map((s) => (
                <div
                  key={s.id}
                  className="border-l-2 pl-3"
                  style={{ borderColor: CURRENT_THEME.border }}
                >
                  {s.title && (
                    <h4 className="font-semibold mb-1">{s.title}</h4>
                  )}
                  {s.body.map((line, i) => (
                    <div key={i}>{line === '' ? <br /> : line}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:flex w-1/2 justify-center md:justify-start items-center">
        {ImageBlock}
      </div>
    </div>
  );
}
