'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { CURRENT_THEME } from '@/lib/constants';
import { Idea } from '@/types/idea';
import { useLastSeen } from '@/lib/use-last-seen';
import StickyNoteCard from './StickyNoteCard';

const SWIPE_THRESHOLD_PX = 50;
const DURATION_MS = 800;
const EASING = 'cubic-bezier(0.33, 1, 0.68, 1)';
const SIDE_SCALE = 0.7;
const SIDE_OPACITY = 0.45;

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function SpotlightVariant({ ideas }: { ideas: Idea[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // NEW / 更新バッジ: publishedAt と latestDetailAt の最新値を lastSeen と比較
  const latestTimestamp = ideas.reduce<string | undefined>((acc, idea) => {
    const candidates = [idea.publishedAt, idea.latestDetailAt].filter(Boolean) as string[];
    return candidates.reduce((a, b) => (!a || b > a ? b : a), acc);
  }, undefined);
  const { isNew } = useLastSeen('ideas:lastSeenAt', latestTimestamp);

  const n = ideas.length;
  const pad = n >= 2 ? Math.min(n, 3) : 0;
  const ext =
    pad > 0
      ? [...ideas.slice(n - pad), ...ideas, ...ideas.slice(0, pad)]
      : ideas;

  const [active, setActive] = useState(pad);
  const [translate, setTranslate] = useState(0);
  const [ready, setReady] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [showTapZones, setShowTapZones] = useState(false);

  const realIndex = pad > 0 ? (((active - pad) % n) + n) % n : active;
  const realOf = (j: number) => (pad > 0 ? (((j - pad) % n) + n) % n : j);

  const recenter = useCallback(() => {
    const vp = viewportRef.current;
    const rail = railRef.current;
    if (!vp || !rail) return;
    const card = rail.children[active] as HTMLElement | undefined;
    if (!card) return;
    const t = vp.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
    setTranslate(t);
    setReady(true);
    // サイドカードが30px未満しか見えない場合にタップゾーンを表示
    const GAP_PX = 20; // gap-5
    const sideVisible = (vp.clientWidth - card.offsetWidth - GAP_PX * 2) / 2;
    setShowTapZones(sideVisible < 30);
  }, [active]);

  useIsoLayoutEffect(() => { recenter(); }, [recenter]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(recenter);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [recenter]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (pad === 0) return;
    let snapped: number | null = null;
    if (active < pad) snapped = active + n;
    else if (active >= pad + n) snapped = active - n;
    if (snapped == null) return;
    setAnimate(false);
    setActive(snapped);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setAnimate(true));
    });
  };

  const moveTo = useCallback((target: number) => setActive(target), []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
      moveTo(dx > 0 ? active - 1 : active + 1);
    }
    touchStartX.current = null;
  };

  if (n === 0) return null;

  const transition = ready && animate ? `${DURATION_MS}ms ${EASING}` : 'none';

  return (
    <div>
      <div
        ref={viewportRef}
        className="relative overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={railRef}
          className="flex items-center gap-5 py-4"
          style={{
            transform: `translateX(${translate}px)`,
            transition: transition === 'none' ? 'none' : `transform ${transition}`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {ext.map((idea, i) => {
            const isActive = i === active;
            const r = realOf(i);
            const cardIsNew = !!(idea.publishedAt && isNew(idea.publishedAt));
            const cardIsUpdated = !!(
              idea.latestDetailAt &&
              isNew(idea.latestDetailAt) &&
              !cardIsNew
            );
            return (
              <div
                key={`${idea.id}-${i}`}
                onClick={isActive ? undefined : () => moveTo(i)}
                className={`relative shrink-0 w-[min(86vw,26rem)] ${isActive ? '' : 'cursor-pointer'}`}
                style={{
                  transform: isActive ? 'scale(1)' : `scale(${SIDE_SCALE})`,
                  opacity: isActive ? 1 : SIDE_OPACITY,
                  transformOrigin: 'center center',
                  transition:
                    transition === 'none'
                      ? 'none'
                      : `transform ${transition}, opacity ${transition}`,
                }}
              >
                {/* タップゾーン: サイドカードが30px未満しか見えないときのみ表示 */}
                {isActive && showTapZones && (
                  <>
                    <button
                      type="button"
                      className="absolute left-0 top-0 w-1/4 h-full z-10"
                      onClick={() => moveTo(active - 1)}
                      aria-label="前へ"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 w-1/4 h-full z-10"
                      onClick={() => moveTo(active + 1)}
                      aria-label="次へ"
                    />
                  </>
                )}
                <StickyNoteCard
                  idea={idea}
                  i={r}
                  rotate={false}
                  className="w-full"
                  develop
                  isNew={cardIsNew}
                  isUpdated={cardIsUpdated}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center mt-4">
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: CURRENT_THEME.textSecondary }}
        >
          {realIndex + 1} / {n}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        {ideas.map((idea, i) => (
          <button
            key={idea.id}
            type="button"
            onClick={() => moveTo(pad + i)}
            aria-label={`No.${String(idea.no).padStart(3, '0')} へ`}
            className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded transition-colors"
            style={{
              backgroundColor: i === realIndex ? CURRENT_THEME.border : 'transparent',
              color: i === realIndex ? CURRENT_THEME.background : CURRENT_THEME.textSecondary,
              border: `1px solid ${CURRENT_THEME.border}`,
              opacity: i === realIndex ? 1 : 0.6,
            }}
          >
            {String(idea.no).padStart(3, '0')}
          </button>
        ))}
      </div>
    </div>
  );
}
