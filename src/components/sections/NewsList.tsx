'use client';

import { News } from '@/types/news';
import { CURRENT_THEME } from '@/lib/constants';
import { useLastSeen } from '@/lib/use-last-seen';

interface Props {
  news: News[];
  storageKey: string;
}

// シェア開始 (2026-06-09) 〜 2026-06-20 の間、初回訪問者にも対象期間内に
// 追加された News に NEW を表示する一時キャンペーン。期間後は無効。
const FIRST_VISIT_CAMPAIGN = {
  threshold: '2026-06-09T00:00:00+09:00',
  end: '2026-06-21T00:00:00+09:00',
};

export default function NewsList({ news, storageKey }: Props) {
  const latestCreatedAt = news.reduce<string | undefined>(
    (acc, n) => (acc && acc > n.createdAt ? acc : n.createdAt),
    undefined,
  );
  const { isNew } = useLastSeen(storageKey, latestCreatedAt, FIRST_VISIT_CAMPAIGN);

  return (
    <section
      id='news'
      className='py-12'
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className='max-w-5xl mx-auto px-4'>
        <h2
          className='text-2xl font-bold mb-6'
          style={{ color: CURRENT_THEME.text }}
        >
          News
        </h2>
        <ul className='flex flex-col'>
          {news.map((item) => (
            <li
              key={item.id}
              className='flex flex-col md:flex-row gap-1 md:gap-4 py-3 border-b last:border-b-0'
              style={{ borderColor: CURRENT_THEME.border }}
            >
              {/* NEW + 日付 専用列 (NEW なしでもスペースを確保して見た目を揃える) */}
              <div className='flex items-center gap-2 md:gap-3'>
                <div className='w-12 flex-shrink-0'>
                  {isNew(item.createdAt) && (
                    <span
                      className='inline-block text-xs font-bold px-2 py-0.5 rounded'
                      style={{
                        backgroundColor: CURRENT_THEME.accent,
                        color: CURRENT_THEME.text,
                      }}
                    >
                      NEW
                    </span>
                  )}
                </div>
                <time
                  className='md:w-28 flex-shrink-0 text-xs md:text-sm'
                  style={{ color: CURRENT_THEME.textSecondary }}
                >
                  {item.date}
                </time>
              </div>
              <div className='flex-1'>
                <p
                  className='text-sm whitespace-pre-line'
                  style={{ color: CURRENT_THEME.text, lineHeight: 1.7 }}
                >
                  {item.body}
                  {item.link && (
                    <>
                      {' '}
                      <a
                        href={item.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='underline text-xs'
                        style={{ color: CURRENT_THEME.textSecondary }}
                      >
                        ↗ link
                      </a>
                    </>
                  )}
                </p>
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=''
                    className='mt-2 max-w-xs rounded'
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
