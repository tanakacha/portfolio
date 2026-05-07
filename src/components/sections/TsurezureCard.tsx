'use client';

import { useState, useEffect, useMemo } from 'react';
import { Post } from '@/types/post';
import { CURRENT_THEME } from '@/lib/constants';
import { likePost, unlikePost } from '@/app/actions/posts';

type SortOrder = 'random' | 'newest' | 'oldest';

const STORAGE_KEY = 'tsurezure:lastSeenPostId';
const LIKES_STORAGE_KEY = 'tsurezure:likedPostIds';
const FLIP_DURATION_MS = 800;

interface Props {
  posts: Post[];
  showLikeCount?: boolean;
}

interface HeartButtonProps {
  liked: boolean;
  count: number;
  showCount: boolean;
  onClick: () => void;
  disabled: boolean;
}

function HeartButton({
  liked,
  count,
  showCount,
  onClick,
  disabled,
}: HeartButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="flex items-center gap-1 hover:opacity-70 transition-opacity bg-transparent p-1 disabled:cursor-default"
      style={{ border: 'none' }}
      aria-label={liked ? 'いいねを取り消す' : 'いいねする'}
      aria-pressed={liked}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill={liked ? CURRENT_THEME.border : 'none'}
        stroke={CURRENT_THEME.border}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {showCount && (
        <span
          className="text-xs tabular-nums"
          style={{ color: CURRENT_THEME.text }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

interface CardFaceProps {
  post: Post | null;
  isNew: boolean;
  rotated: boolean;
  onPrev: () => void;
  onNext: () => void;
  onLike: () => void;
  liked: boolean;
  count: number;
  showCount: boolean;
  navDisabled: boolean;
  likeDisabled: boolean;
}

function CardFace({
  post,
  isNew,
  rotated,
  onPrev,
  onNext,
  onLike,
  liked,
  count,
  showCount,
  navDisabled,
  likeDisabled,
}: CardFaceProps) {
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
              className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded z-20"
              style={{
                backgroundColor: CURRENT_THEME.accent,
                color: CURRENT_THEME.text,
              }}
            >
              NEW
            </span>
          )}
          <div className="flex-1 px-6 py-6 w-full flex items-center justify-center">
            <p
              className="text-xs leading-relaxed whitespace-pre-line w-full"
              style={{ color: CURRENT_THEME.text }}
            >
              {post.body}
            </p>
          </div>
          {/* 左右クリック領域 (z-10) */}
          <button
            type="button"
            onClick={onPrev}
            disabled={navDisabled}
            className="absolute left-0 top-0 w-1/2 h-full bg-transparent disabled:cursor-default cursor-pointer z-10"
            style={{ border: 'none' }}
            aria-label="前のつぶやき"
          />
          <button
            type="button"
            onClick={onNext}
            disabled={navDisabled}
            className="absolute right-0 top-0 w-1/2 h-full bg-transparent disabled:cursor-default cursor-pointer z-10"
            style={{ border: 'none' }}
            aria-label="次のつぶやき"
          />
          {/* ハート (z-20、左右ボタンより上) */}
          <div className="absolute bottom-2 right-2 z-20">
            <HeartButton
              liked={liked}
              count={count}
              showCount={showCount}
              onClick={onLike}
              disabled={likeDisabled}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function TsurezureCard({ posts, showLikeCount = false }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('random');
  const [lastSeenId, setLastSeenId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [frontIndex, setFrontIndex] = useState(0);
  const [backIndex, setBackIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  // posts 初期同期: like_count をローカル state に取り込む
  useEffect(() => {
    const initial: Record<number, number> = {};
    posts.forEach((p) => {
      initial[p.id] = p.likeCount;
    });
    setLikeCounts(initial);
  }, [posts]);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    setLastSeenId(stored ? Number(stored) : null);
    const storedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
    if (storedLikes) {
      try {
        const arr = JSON.parse(storedLikes) as number[];
        setLikedIds(new Set(arr));
      } catch {
        // パース失敗時は無視
      }
    }
    return () => {
      if (posts.length > 0) {
        const maxId = Math.max(...posts.map((p) => p.id));
        localStorage.setItem(STORAGE_KEY, String(maxId));
      }
    };
  }, [posts]);

  const sortedPosts = useMemo(() => {
    let base: Post[];
    if (sortOrder === 'newest') {
      base = [...posts].sort((a, b) => b.id - a.id);
    } else if (sortOrder === 'oldest') {
      base = [...posts].sort((a, b) => a.id - b.id);
    } else {
      const shuffled = [...posts];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      base = shuffled;
    }

    // ペア制約: A.nextPostId = B.id なら、ベース順序にかかわらず A の直後に B を挿入
    const childIds = new Set(
      posts.filter((p) => p.nextPostId != null).map((p) => p.nextPostId!),
    );
    const byId = new Map(posts.map((p) => [p.id, p]));
    const visited = new Set<number>();
    const result: Post[] = [];

    const appendChain = (start: Post) => {
      if (visited.has(start.id)) return;
      visited.add(start.id);
      result.push(start);
      let nextId = start.nextPostId;
      while (nextId != null && !visited.has(nextId)) {
        const child = byId.get(nextId);
        if (!child) break;
        visited.add(child.id);
        result.push(child);
        nextId = child.nextPostId;
      }
    };

    // チェーンの先頭 (= 子として参照されていない) から並べる
    for (const p of base) {
      if (childIds.has(p.id)) continue;
      appendChain(p);
    }
    // 循環があった場合のフォールバック: visited 漏れを末尾に追加
    for (const p of base) {
      if (!visited.has(p.id)) result.push(p);
    }
    return result;
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
      <div id="tsurezure" aria-label="Tsurezure" className="flex flex-col w-full max-w-[300px] mx-auto md:max-w-none">
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

  const toggleLike = async (postId: number) => {
    const wasLiked = likedIds.has(postId);
    const currentCount =
      likeCounts[postId] ??
      sortedPosts.find((p) => p.id === postId)?.likeCount ??
      0;

    // 楽観的更新
    const newLikedIds = new Set(likedIds);
    if (wasLiked) {
      newLikedIds.delete(postId);
    } else {
      newLikedIds.add(postId);
    }
    setLikedIds(newLikedIds);

    const optimisticCount = wasLiked
      ? Math.max(0, currentCount - 1)
      : currentCount + 1;
    setLikeCounts((c) => ({ ...c, [postId]: optimisticCount }));
    localStorage.setItem(
      LIKES_STORAGE_KEY,
      JSON.stringify(Array.from(newLikedIds)),
    );

    // サーバ呼び出し
    try {
      const newCount = wasLiked
        ? await unlikePost(postId)
        : await likePost(postId);
      setLikeCounts((c) => ({ ...c, [postId]: newCount }));
    } catch {
      // 失敗時はロールバック
      const rolledBack = new Set(likedIds);
      if (wasLiked) {
        rolledBack.add(postId);
      } else {
        rolledBack.delete(postId);
      }
      setLikedIds(rolledBack);
      setLikeCounts((c) => ({ ...c, [postId]: currentCount }));
      localStorage.setItem(
        LIKES_STORAGE_KEY,
        JSON.stringify(Array.from(rolledBack)),
      );
    }
  };

  const frontCount =
    frontPost !== null
      ? likeCounts[frontPost.id] ?? frontPost.likeCount
      : 0;
  const frontLiked = frontPost !== null && likedIds.has(frontPost.id);
  const backCount =
    backPost !== null ? likeCounts[backPost.id] ?? backPost.likeCount : 0;
  const backLiked = backPost !== null && likedIds.has(backPost.id);

  return (
    <div id="tsurezure" aria-label="Tsurezure" className="flex flex-col w-full max-w-[300px] mx-auto md:max-w-none">
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
          <CardFace
            post={frontPost}
            isNew={frontIsNew}
            rotated={false}
            onPrev={handlePrev}
            onNext={handleNext}
            onLike={() => frontPost && toggleLike(frontPost.id)}
            liked={frontLiked}
            count={frontCount}
            showCount={showLikeCount}
            navDisabled={isAnimating}
            likeDisabled={isAnimating}
          />
          <CardFace
            post={backPost}
            isNew={backIsNew}
            rotated={true}
            onPrev={handlePrev}
            onNext={handleNext}
            onLike={() => backPost && toggleLike(backPost.id)}
            liked={backLiked}
            count={backCount}
            showCount={showLikeCount}
            navDisabled={isAnimating}
            likeDisabled={isAnimating}
          />
        </div>
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
