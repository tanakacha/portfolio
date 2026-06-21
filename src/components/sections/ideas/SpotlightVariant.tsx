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

  // No. ストリップが1行に収まるか（収まらなければモバイル向けウィンドウ表示）
  const stripContainerRef = useRef<HTMLDivElement>(null);
  const stripMeasureRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

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
    const container = stripContainerRef.current;
    const measure = stripMeasureRef.current;
    if (!container || !measure) return;
    // 全番号がコンテナ幅の80%以上を占めるならコンパクト表示に切り替える
    const check = () => setCompact(measure.scrollWidth > container.clientWidth * 0.8);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    return () => ro.disconnect();
  }, [n]);

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

  // モバイル用ウィンドウ（現在地±2 の最大5個。端では寄せる）
  const WINDOW = 5;
  const windowStart = Math.max(0, Math.min(realIndex - 2, Math.max(0, n - WINDOW)));
  const windowEnd = Math.min(n, windowStart + WINDOW);
  const windowIndices: number[] = [];
  for (let i = windowStart; i < windowEnd; i++) windowIndices.push(i);

  // real index d を、ループ上で現在地 active に最も近い ext 上の位置に変換
  // （末尾から先頭など、ぐるっと繋がっている側へ最短で移動する）
  const nearestActive = (d: number) => {
    const candidates =
      pad > 0
        ? [pad + d - n, pad + d, pad + d + n].filter((c) => c >= 0 && c < ext.length)
        : [d];
    return candidates.reduce((best, c) =>
      Math.abs(c - active) < Math.abs(best - active) ? c : best
    );
  };

  const NumBtn = ({ no, active, onClick }: { no: number; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={`No.${String(no).padStart(3, '0')} へ`}
      className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded transition-colors"
      style={{
        backgroundColor: active ? CURRENT_THEME.border : 'transparent',
        color: active ? CURRENT_THEME.background : CURRENT_THEME.textSecondary,
        border: `1px solid ${CURRENT_THEME.border}`,
        opacity: active ? 1 : 0.6,
      }}
    >
      {String(no).padStart(3, '0')}
    </button>
  );

  const ArrowBtn = ({
    label,
    disabled,
    onClick,
    children,
  }: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="font-mono text-[0.6rem] px-1.5 py-0.5 rounded transition-opacity"
      style={{
        color: CURRENT_THEME.textSecondary,
        border: `1px solid ${CURRENT_THEME.border}`,
        opacity: disabled ? 0.25 : 0.6,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {children}
    </button>
  );

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

      <div ref={stripContainerRef} className="relative mt-3">
        {/* 計測用（常に全番号を1行で持ち、自然幅を測る。非表示） */}
        <div
          ref={stripMeasureRef}
          aria-hidden
          className="absolute left-0 top-0 flex flex-nowrap gap-1.5 opacity-0 pointer-events-none"
        >
          {ideas.map((idea) => (
            <span key={idea.id} className="font-mono text-[0.6rem] px-1.5 py-0.5 border whitespace-nowrap">
              {String(idea.no).padStart(3, '0')}
            </span>
          ))}
        </div>

        {compact ? (
          // モバイル: |< < [現在地±2] > >|
          <div className="flex items-center justify-center gap-1.5">
            <ArrowBtn label="先頭へ" disabled={realIndex === 0} onClick={() => moveTo(nearestActive(0))}>
              |&lt;
            </ArrowBtn>
            <ArrowBtn label="5個前へ" disabled={realIndex === 0} onClick={() => moveTo(pad + Math.max(0, realIndex - 5))}>
              &lt;5
            </ArrowBtn>
            {windowIndices.map((i) => (
              <NumBtn key={ideas[i].id} no={ideas[i].no} active={i === realIndex} onClick={() => moveTo(pad + i)} />
            ))}
            <ArrowBtn label="5個先へ" disabled={realIndex === n - 1} onClick={() => moveTo(pad + Math.min(n - 1, realIndex + 5))}>
              5&gt;
            </ArrowBtn>
            <ArrowBtn label="末尾へ" disabled={realIndex === n - 1} onClick={() => moveTo(nearestActive(n - 1))}>
              &gt;|
            </ArrowBtn>
          </div>
        ) : (
          // PC: 全番号を1行表示
          <div className="flex flex-nowrap justify-center gap-1.5">
            {ideas.map((idea, i) => (
              <NumBtn key={idea.id} no={idea.no} active={i === realIndex} onClick={() => moveTo(pad + i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
