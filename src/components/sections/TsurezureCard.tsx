'use client';

import { useState, useEffect, useMemo } from 'react';
import { Post } from '@/types/post';
import { CURRENT_THEME } from '@/lib/constants';

type SortOrder = 'random' | 'newest' | 'oldest';

const STORAGE_KEY = 'tsurezure:lastSeenPostId';
const FLIP_DURATION_MS = 800;

interface Props {
  posts: Post[];
}

interface CardFaceProps {
  post: Post | null;
  isNew: boolean;
  rotated: boolean;
}

function CardFace({ post, isNew, rotated }: CardFaceProps) {
  return (
    <div
      className="absolute inset-0 border-2 rounded-lg flex flex-col overflow-hidden"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        borderColor: CURRENT_THEME.border,
        backgroundColor: CURRENT_THEME.background,
        transform: rotated ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      {post && (
        <>
          {isNew && (
            <span
              className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded z-10"
              style={{
                backgroundColor: CURRENT_THEME.accent,
                color: CURRENT_THEME.text,
              }}
            >
              NEW
            </span>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-6 w-full">
            <div className="min-h-full flex items-center justify-center">
              <p
                className="text-xs leading-relaxed whitespace-pre-line w-full"
                style={{ color: CURRENT_THEME.text }}
              >
                {post.body}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TsurezureCard({ posts }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('random');
  const [lastSeenId, setLastSeenId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [frontIndex, setFrontIndex] = useState(0);
  const [backIndex, setBackIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    setLastSeenId(stored ? Number(stored) : null);
    return () => {
      if (posts.length > 0) {
        const maxId = Math.max(...posts.map((p) => p.id));
        localStorage.setItem(STORAGE_KEY, String(maxId));
      }
    };
  }, [posts]);

  const sortedPosts = useMemo(() => {
    if (sortOrder === 'newest') {
      return [...posts].sort((a, b) => b.id - a.id);
    }
    if (sortOrder === 'oldest') {
      return [...posts].sort((a, b) => a.id - b.id);
    }
    const shuffled = [...posts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [posts, sortOrder]);

  // 並び替え変更時はリセット
  useEffect(() => {
    setRotation(0);
    setFrontIndex(0);
    setBackIndex(null);
  }, [sortOrder]);

  if (posts.length === 0) return null;

  if (!isMounted) {
    return (
      <div id="tsurezure" aria-label="Tsurezure" className="flex flex-col">
        <div
          className="border-2 rounded-lg aspect-[4/3]"
          style={{
            borderColor: CURRENT_THEME.border,
            backgroundColor: CURRENT_THEME.background,
          }}
        />
      </div>
    );
  }

  // rotation が偶数の 180度 の倍数(0, 360, 720, -360, ...)なら front が見えている
  const turnCount = Math.round(rotation / 180);
  const isFrontVisible = ((turnCount % 2) + 2) % 2 === 0;
  const visibleIndex = isFrontVisible ? frontIndex : backIndex;
  const visiblePost =
    visibleIndex !== null ? sortedPosts[visibleIndex] : null;

  const frontPost = sortedPosts[frontIndex] ?? null;
  const backPost = backIndex !== null ? sortedPosts[backIndex] ?? null : null;

  const frontIsNew =
    lastSeenId !== null && frontPost ? frontPost.id > lastSeenId : false;
  const backIsNew =
    lastSeenId !== null && backPost ? backPost.id > lastSeenId : false;

  const move = (direction: 'forward' | 'backward') => {
    if (isAnimating || visibleIndex === null) return;
    const delta = direction === 'forward' ? 1 : -1;
    const newIdx =
      (visibleIndex + delta + sortedPosts.length) % sortedPosts.length;
    if (isFrontVisible) {
      setBackIndex(newIdx);
    } else {
      setFrontIndex(newIdx);
    }
    setRotation((r) => r - delta * 180);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), FLIP_DURATION_MS);
  };

  const handleNext = () => move('forward');
  const handlePrev = () => move('backward');

  return (
    <div id="tsurezure" aria-label="Tsurezure" className="flex flex-col">
      <div
        className="relative aspect-[4/3] mb-4"
        style={{ perspective: '1200px' }}
      >
        <div
          className="w-full h-full relative"
          style={{
            transformStyle: 'preserve-3d',
            transition: `transform ${FLIP_DURATION_MS}ms`,
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          <CardFace post={frontPost} isNew={frontIsNew} rotated={false} />
          <CardFace post={backPost} isNew={backIsNew} rotated={true} />
        </div>
        <button
          type="button"
          onClick={handlePrev}
          disabled={isAnimating}
          className="absolute left-0 top-0 w-1/2 h-full bg-transparent disabled:cursor-default cursor-pointer"
          style={{ border: 'none' }}
          aria-label="前のつぶやき"
        />
        <button
          type="button"
          onClick={handleNext}
          disabled={isAnimating}
          className="absolute right-0 top-0 w-1/2 h-full bg-transparent disabled:cursor-default cursor-pointer"
          style={{ border: 'none' }}
          aria-label="次のつぶやき"
        />
      </div>
      <div className="flex items-center justify-center gap-2">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="bg-transparent text-xs cursor-pointer appearance-none outline-none px-1"
          style={{ color: CURRENT_THEME.text, border: "none" }}
        >
          <option value="random">ランダム</option>
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
        </select>
        <span
          className="text-xs"
          style={{ color: CURRENT_THEME.textSecondary }}
        >
          {(visibleIndex ?? 0) + 1} / {sortedPosts.length}
        </span>
      </div>
    </div>
  );
}
