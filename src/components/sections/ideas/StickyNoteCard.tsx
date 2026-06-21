'use client';

import { useEffect, useRef, useState } from 'react';
import { Idea, IdeaBranch, IdeaStatus } from '@/types/idea';
import { CURRENT_THEME } from '@/lib/constants';
import { STATUS_META } from './statusMeta';

const ROTATIONS = [-2, 1.5, -1, 2, -1.5, 1] as const;
const BRANCH_ROT = [-2.5, 2, -1.5, 1.5] as const;

function fmtDate(at: string): string {
  const [, m, d] = at.split('-');
  return m && d ? `${Number(m)}/${Number(d)}` : at;
}

// label / name / url / maker を持つリンク項目（exists の existings / partial の refs 共通）
interface LinkItem {
  label?: string;
  name?: string;
  url?: string;
  maker?: string;
}

// 同じ label の項目をまとめる（label の登場順を維持。label 無しは '' で1グループ）
function groupByLabel(items: LinkItem[]): { label: string; items: LinkItem[] }[] {
  const groups: { label: string; items: LinkItem[] }[] = [];
  for (const item of items) {
    const key = item.label ?? '';
    const found = groups.find((g) => g.label === key);
    if (found) found.items.push(item);
    else groups.push({ label: key, items: [item] });
  }
  return groups;
}

// グルーピングされたリンク一覧（exists / partial 共通表示）
function LinkGroupList({ items }: { items: LinkItem[] }) {
  return (
    <div
      className="mt-3 pt-3 text-xs space-y-2"
      style={{ borderTop: '1px solid rgba(25, 33, 56, 0.12)' }}
    >
      {groupByLabel(items).map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <span style={{ color: CURRENT_THEME.textSecondary }}>{group.label}:</span>
          )}
          <ul className={group.label ? 'mt-0.5 space-y-0.5' : 'space-y-0.5'}>
            {group.items.map((item, ii) => (
              <li key={ii} className="pl-3" style={{ color: CURRENT_THEME.text }}>
                ・
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-70"
                  >
                    {item.name ?? item.url}
                  </a>
                ) : (
                  <span>{item.name}</span>
                )}
                {item.maker && (
                  <span style={{ color: CURRENT_THEME.textSecondary }}> （{item.maker}）</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function BranchCard({ b, i }: { b: IdeaBranch; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setIsPortrait(el.offsetHeight >= el.offsetWidth * 0.75);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={
        isPortrait
          ? 'rounded-b-sm pt-[7px] px-2 pb-1.5 shadow-sm text-xs'
          : 'rounded-r-sm pl-[10px] pr-[5px] py-1.5 shadow-sm text-xs'
      }
      style={{
        background: isPortrait
          ? 'linear-gradient(to bottom, rgba(230,230,230,0.65) 0, rgba(250,250,250,0.95) 7px, rgba(255,255,255,0.65) 10px)'
          : 'linear-gradient(to right, rgba(230,230,230,0.65) 0, rgba(250,250,250,0.95) 7px, rgba(255,255,255,0.65) 10px)',
        color: CURRENT_THEME.text,
        transform: `rotate(${BRANCH_ROT[i % BRANCH_ROT.length]}deg)`,
      }}
    >
      <span className="block font-bold mb-0.5">{b.label}</span>
      {b.body.map((line, j) => (
        <span key={j} className="block leading-snug">{line}</span>
      ))}
    </div>
  );
}

function DevelopBlock({ idea }: { idea: Idea }) {
  const branches = idea.branches ?? [];
  const notes = idea.notes ?? [];
  if (branches.length === 0 && notes.length === 0) return null;
  return (
    <div className="mt-3">
      {branches.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-start">
          {branches.map((b, i) => (
            <BranchCard key={i} b={b} i={i} />
          ))}
        </div>
      )}
      {notes.length > 0 && (
        <div className="mt-3 space-y-0.5">
          {notes.map((n, i) => (
            <p
              key={i}
              className="text-xs"
              style={{ color: CURRENT_THEME.textSecondary }}
            >
              <span className="font-mono">{fmtDate(n.noted_at)}</span> {n.body}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function stickyTint(_i: number): string {
  return `color-mix(in srgb, var(--theme-border) 35%, #FFFFFF)`;
}

function StatusBadge({ status }: { status: Exclude<IdeaStatus, 'open'> }) {
  return (
    <span
      className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{
        backgroundColor: CURRENT_THEME.border,
        color: CURRENT_THEME.text,
      }}
    >
      {STATUS_META[status].label}
    </span>
  );
}

interface Props {
  idea: Idea;
  i: number;
  rotate?: boolean;
  className?: string;
  develop?: boolean;
  isNew?: boolean;
  isUpdated?: boolean;
}

export default function StickyNoteCard({
  idea,
  i,
  rotate = true,
  className = '',
  develop = false,
  isNew = false,
  isUpdated = false,
}: Props) {
  const no = String(idea.no).padStart(3, '0');
  const status: IdeaStatus = idea.status ?? 'open';
  const rot = rotate ? ROTATIONS[i % ROTATIONS.length] : 0;
  const isReserved = status === 'reserved';

  return (
    <div
      className={`relative rounded-md px-4 pt-3 pb-4 shadow-md ${className}`}
      style={{
        backgroundColor: stickyTint(i),
        color: CURRENT_THEME.text,
        transform: rot ? `rotate(${rot}deg)` : undefined,
      }}
    >
      {/* NEW / 更新バッジ */}
      {(isNew || isUpdated) && (
        <span
          className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded z-10"
          style={{
            backgroundColor: CURRENT_THEME.accent,
            color: CURRENT_THEME.text,
          }}
        >
          {isNew ? 'NEW' : '更新'}
        </span>
      )}

      {/* ヘッダー: No. → カテゴリ → ステータスバッジ（1行） */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="font-mono text-[0.65rem]" style={{ color: CURRENT_THEME.textSecondary }}>
          No.{no}
        </span>
        {idea.category && (
          <span
            className="px-2 py-0.5 rounded text-[0.65rem] font-semibold"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)', color: CURRENT_THEME.text }}
          >
            {idea.category}
          </span>
        )}
        {status !== 'open' && <StatusBadge status={status} />}
      </div>

      {/* タイトル（reserved でも表示） */}
      <h3 className="text-base font-bold leading-snug mb-2">{idea.title}</h3>

      {isReserved ? (
        <p className="text-sm" style={{ color: CURRENT_THEME.textSecondary }}>
          {idea.note ?? '詳細は一時非公開中です。'}
        </p>
      ) : (
        <>
          {idea.body.map((line, li) => (
            <p key={li} className="text-sm leading-relaxed">{line}</p>
          ))}

          {/* exists / partial 共通: 自由記述 note */}
          {idea.note && (
            <p className="mt-2 text-xs" style={{ color: CURRENT_THEME.textSecondary }}>
              {idea.note}
            </p>
          )}

          {develop && <DevelopBlock idea={idea} />}

          {status === 'exists' && idea.existings && idea.existings.length > 0 && (
            <LinkGroupList items={idea.existings} />
          )}

          {status === 'partial' && idea.refs && idea.refs.length > 0 && (
            <LinkGroupList items={idea.refs} />
          )}
        </>
      )}
    </div>
  );
}
