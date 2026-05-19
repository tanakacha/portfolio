'use client';

import { useState, useEffect, useMemo, type ComponentType } from 'react';
import { Heart } from 'lucide-react';
import { Post } from '@/types/post';
import { CURRENT_THEME } from '@/lib/constants';
import {
  ALL_REACTIONS,
  PUBLIC_REACTIONS,
  type ReactionDef,
  type ReactionKey,
} from '@/lib/reactions';
import { addReaction, removeReaction } from '@/app/actions/posts';

interface IconProps {
  size?: number;
  // 2色構成: 元 SVG で「黒/暗い」だった部分の色
  ink?: string;
  // 2色構成: 元 SVG で「白/明るい」だった部分の色 (sclera 等)
  light?: string;
  // eyes 専用: sclera (白目) に縁取りを付けるか (通常時に円フレームがない代わりに sclera を強調する)
  outlined?: boolean;
  // heart 専用: 内部を塗りつぶすか (押下時)
  filled?: boolean;
}

function HeartIcon({ size = 20, ink, filled }: IconProps) {
  return (
    <Heart
      size={size}
      stroke={ink}
      fill={filled ? ink : 'none'}
      strokeWidth={2}
    />
  );
}

function SushiIcon({ size = 20, ink }: IconProps) {
  // 黒シルエットの SVG を CSS mask で扱い、ink 色でシルエットを塗る
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundColor: ink,
        maskImage: 'url(/icons/sushi.svg)',
        WebkitMaskImage: 'url(/icons/sushi.svg)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

function EyesIcon({ size = 20, ink, light, outlined }: IconProps) {
  // Twemoji 由来の多色 SVG を 2色にマッピング:
  //   元の暗い部分 (虹彩リング #8899A6 / 瞳 #292F33) → ink
  //   元の明るい部分 (白目 #F5F8FA / 明るいグレー #E1E8ED / ハイライト) → light
  // outlined=true のとき sclera より少し大きい別 ellipse を最後に重ねて外周線を出す
  // (sclera 自体に stroke を付けても、後続の path に覆われて見えないため)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <ellipse fill={light} cx="8.828" cy="18" rx="7.953" ry="13.281" />
      <path
        fill={light}
        d="M8.828 32.031C3.948 32.031.125 25.868.125 18S3.948 3.969 8.828 3.969S17.531 10.132 17.531 18s-3.823 14.031-8.703 14.031zm0-26.562C4.856 5.469 1.625 11.09 1.625 18s3.231 12.531 7.203 12.531S16.031 24.91 16.031 18S12.8 5.469 8.828 5.469z"
      />
      <circle fill={ink} cx="6.594" cy="18" r="4.96" />
      <circle fill={ink} cx="6.594" cy="18" r="3.565" />
      <circle fill={light} cx="7.911" cy="15.443" r="1.426" />
      <ellipse fill={light} cx="27.234" cy="18" rx="7.953" ry="13.281" />
      <path
        fill={light}
        d="M27.234 32.031c-4.88 0-8.703-6.163-8.703-14.031s3.823-14.031 8.703-14.031S35.938 10.132 35.938 18s-3.824 14.031-8.704 14.031zm0-26.562c-3.972 0-7.203 5.622-7.203 12.531c0 6.91 3.231 12.531 7.203 12.531S34.438 24.91 34.438 18S31.206 5.469 27.234 5.469z"
      />
      <circle fill={ink} cx="25" cy="18" r="4.96" />
      <circle fill={ink} cx="25" cy="18" r="3.565" />
      <circle fill={light} cx="26.317" cy="15.443" r="1.426" />
      {outlined && (
        <>
          <ellipse
            fill="none"
            stroke={ink}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            cx="8.828"
            cy="18"
            rx="8.3"
            ry="13.7"
          />
          <ellipse
            fill="none"
            stroke={ink}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            cx="27.234"
            cy="18"
            rx="8.3"
            ry="13.7"
          />
        </>
      )}
    </svg>
  );
}

const ICON_BY_KEY: Record<ReactionKey, ComponentType<IconProps>> = {
  heart: HeartIcon,
  sushi: SushiIcon,
  eyes: EyesIcon,
};

type SortOrder = 'random' | 'newest' | 'oldest';
type ReactedMap = Record<number, ReactionKey[]>;

const STORAGE_KEY = 'tsurezure:lastSeenPostId';
const REACTIONS_STORAGE_KEY = 'tsurezure:reactedKeys';
const LEGACY_LIKES_STORAGE_KEY = 'tsurezure:likedPostIds';
const FLIP_DURATION_MS = 800;

interface Props {
  posts: Post[];
  showLikeCount?: boolean;
  variant?: 'public' | 'private';
}

interface ReactionIconProps {
  reactionKey: ReactionKey;
  active: boolean;
}

function ReactionIcon({ reactionKey, active }: ReactionIconProps) {
  // heart: ピル bg なし、押下時はハート内部を塗りつぶすだけ (ink/light は固定)
  // sushi: 2色構成、active で ink/light を入れ替え + ピル bg をテーマ色に
  // eyes: アイコン自体は反転させず固定 (ink=テーマ色, light=白)
  //   - 通常: 円フレームは出さず、sclera (白目) を ink 色で縁取って強調
  //   - 押下: 円フレーム + テーマ色 bg fill、sclera は縁取りなし (フレームが代わり)
  const Icon = ICON_BY_KEY[reactionKey];
  const isEyes = reactionKey === 'eyes';
  const isHeart = reactionKey === 'heart';
  const ink =
    isEyes || isHeart
      ? CURRENT_THEME.border
      : active
        ? CURRENT_THEME.background
        : CURRENT_THEME.border;
  const light =
    isEyes || isHeart
      ? CURRENT_THEME.background
      : active
        ? CURRENT_THEME.border
        : CURRENT_THEME.background;
  const size = isEyes ? 28 : 32;
  const showEyeFrame = isEyes && active;
  // heart はピル bg を持たない (押下時はハート自身の塗りつぶしで表現)
  const backgroundColor = isHeart
    ? 'transparent'
    : active
      ? CURRENT_THEME.border
      : 'transparent';
  return (
    <span
      className="inline-flex items-center justify-center rounded-full transition-colors"
      style={{
        width: size,
        height: size,
        backgroundColor,
        border: showEyeFrame ? `1.5px solid ${CURRENT_THEME.border}` : 'none',
      }}
    >
      <Icon
        size={20}
        ink={ink}
        light={light}
        outlined={isEyes && !active}
        filled={isHeart && active}
      />
    </span>
  );
}

interface ReactionButtonProps {
  def: ReactionDef;
  active: boolean;
  count: number;
  showCount: boolean;
  onClick: () => void;
  disabled: boolean;
}

function ReactionButton({
  def,
  active,
  count,
  showCount,
  onClick,
  disabled,
}: ReactionButtonProps) {
  const [popCount, setPopCount] = useState(0);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopCount((p) => p + 1);
    onClick();
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="flex items-center gap-1 hover:opacity-70 transition-opacity bg-transparent p-1 disabled:cursor-default"
      style={{ border: 'none' }}
      aria-label={active ? def.ariaActive : def.ariaInactive}
      aria-pressed={active}
    >
      <span key={popCount} className={popCount > 0 ? 'heart-pop inline-flex' : 'inline-flex'}>
        <ReactionIcon reactionKey={def.key} active={active} />
      </span>
      {showCount && count > 0 && (
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
  onToggleReaction: (key: ReactionKey) => void;
  reactionDefs: readonly ReactionDef[];
  activeKeys: ReactionKey[];
  counts: Partial<Record<ReactionKey, number>>;
  showCount: boolean;
  navDisabled: boolean;
  reactionDisabled: boolean;
}

function CardFace({
  post,
  isNew,
  rotated,
  onPrev,
  onNext,
  onToggleReaction,
  reactionDefs,
  activeKeys,
  counts,
  showCount,
  navDisabled,
  reactionDisabled,
}: CardFaceProps) {
  return (
    <div
      className="absolute inset-0 border-2 flex flex-col overflow-hidden washi-texture"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        borderColor: CURRENT_THEME.border,
        backgroundColor: CURRENT_THEME.background,
        borderRadius: '14px 14px 12px 12px',
        boxShadow:
          '0 6px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
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
          {/* テキスト領域 (左右クリック領域はここ内に限定) */}
          <div className="flex-1 relative w-full flex items-center justify-center px-7 pt-7 pb-2">
            <p
              className="text-xs whitespace-pre-line w-full"
              style={{
                color: CURRENT_THEME.text,
                lineHeight: 1.85,
                letterSpacing: '0.04em',
              }}
            >
              {post.body}
            </p>
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
          </div>
          {/* リアクション行 (フロー配置、テキスト領域とは独立) */}
          <div className="flex items-center justify-end gap-1 px-3 pb-2">
            {reactionDefs.map((def) => (
              <ReactionButton
                key={def.key}
                def={def}
                active={activeKeys.includes(def.key)}
                count={counts[def.key] ?? 0}
                showCount={showCount}
                onClick={() => onToggleReaction(def.key)}
                disabled={reactionDisabled}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TsurezureCard({
  posts,
  showLikeCount = false,
  variant = 'public',
}: Props) {
  const reactionDefs = variant === 'private' ? ALL_REACTIONS : PUBLIC_REACTIONS;
  const [sortOrder, setSortOrder] = useState<SortOrder>('random');
  const [lastSeenId, setLastSeenId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [frontIndex, setFrontIndex] = useState(0);
  const [backIndex, setBackIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reactedMap, setReactedMap] = useState<ReactedMap>({});
  const [reactionCounts, setReactionCounts] = useState<
    Record<number, Partial<Record<ReactionKey, number>>>
  >({});

  // posts 初期同期: サーバー側 reaction counts をローカル state に取り込む
  useEffect(() => {
    const initial: Record<number, Partial<Record<ReactionKey, number>>> = {};
    posts.forEach((p) => {
      initial[p.id] = { ...p.reactions };
    });
    setReactionCounts(initial);
  }, [posts]);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    setLastSeenId(stored ? Number(stored) : null);

    const storedReactions = localStorage.getItem(REACTIONS_STORAGE_KEY);
    if (storedReactions) {
      try {
        setReactedMap(JSON.parse(storedReactions) as ReactedMap);
      } catch {
        // ignore
      }
    } else {
      // 旧形式 (tsurezure:likedPostIds = number[]) からの移行
      const legacy = localStorage.getItem(LEGACY_LIKES_STORAGE_KEY);
      if (legacy) {
        try {
          const arr = JSON.parse(legacy) as number[];
          const migrated: ReactedMap = {};
          arr.forEach((id) => {
            migrated[id] = ['heart'];
          });
          setReactedMap(migrated);
          localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(migrated));
        } catch {
          // ignore
        }
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

    // ペア制約: A.nextPostId = B.id なら A の直後に B を挿入
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

    for (const p of base) {
      if (childIds.has(p.id)) continue;
      appendChain(p);
    }
    for (const p of base) {
      if (!visited.has(p.id)) result.push(p);
    }
    return result;
  }, [posts, sortOrder]);

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
          className="border-2 aspect-[40/33]"
          style={{
            borderColor: CURRENT_THEME.border,
            backgroundColor: CURRENT_THEME.background,
            borderRadius: '14px 11px 13px 12px',
            boxShadow:
              '0 6px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
          }}
        />
      </div>
    );
  }

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

  const toggleReaction = async (postId: number, key: ReactionKey) => {
    const currentKeys = reactedMap[postId] ?? [];
    const wasActive = currentKeys.includes(key);
    const currentCount =
      reactionCounts[postId]?.[key] ??
      sortedPosts.find((p) => p.id === postId)?.reactions[key] ??
      0;

    // 楽観的更新
    const nextKeys = wasActive
      ? currentKeys.filter((k) => k !== key)
      : [...currentKeys, key];
    const nextMap: ReactedMap = { ...reactedMap, [postId]: nextKeys };
    if (nextKeys.length === 0) delete nextMap[postId];
    setReactedMap(nextMap);
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(nextMap));

    const optimisticCount = wasActive
      ? Math.max(0, currentCount - 1)
      : currentCount + 1;
    setReactionCounts((c) => ({
      ...c,
      [postId]: { ...c[postId], [key]: optimisticCount },
    }));

    try {
      const newCount = wasActive
        ? await removeReaction(postId, key)
        : await addReaction(postId, key);
      setReactionCounts((c) => ({
        ...c,
        [postId]: { ...c[postId], [key]: newCount },
      }));
    } catch {
      // ロールバック
      const rolledMap: ReactedMap = { ...reactedMap, [postId]: currentKeys };
      if (currentKeys.length === 0) delete rolledMap[postId];
      setReactedMap(rolledMap);
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(rolledMap));
      setReactionCounts((c) => ({
        ...c,
        [postId]: { ...c[postId], [key]: currentCount },
      }));
    }
  };

  const reactionsForFace = (post: Post | null) => {
    if (!post) return { activeKeys: [] as ReactionKey[], counts: {} };
    const activeKeys = reactedMap[post.id] ?? [];
    const counts = reactionCounts[post.id] ?? post.reactions;
    return { activeKeys, counts };
  };

  const front = reactionsForFace(frontPost);
  const back = reactionsForFace(backPost);

  return (
    <div id="tsurezure" aria-label="Tsurezure" className="flex flex-col w-full max-w-[300px] mx-auto md:max-w-none">
      <div
        className="relative aspect-[40/33] mb-4"
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
            onToggleReaction={(key) => frontPost && toggleReaction(frontPost.id, key)}
            reactionDefs={reactionDefs}
            activeKeys={front.activeKeys}
            counts={front.counts}
            showCount={showLikeCount}
            navDisabled={isAnimating}
            reactionDisabled={isAnimating}
          />
          <CardFace
            post={backPost}
            isNew={backIsNew}
            rotated={true}
            onPrev={handlePrev}
            onNext={handleNext}
            onToggleReaction={(key) => backPost && toggleReaction(backPost.id, key)}
            reactionDefs={reactionDefs}
            activeKeys={back.activeKeys}
            counts={back.counts}
            showCount={showLikeCount}
            navDisabled={isAnimating}
            reactionDisabled={isAnimating}
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
