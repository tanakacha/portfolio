'use client';

import { CURRENT_THEME } from '@/lib/constants';
import { Work } from '@/types/work';
import { useLastSeen } from '@/lib/use-last-seen';
import WorkCard from './WorkCard';

export default function WorksSection({ works }: { works: Work[] }) {
  const latestCreatedAt = works.reduce<string | undefined>(
    (acc, w) => (acc && acc > w.createdAt ? acc : w.createdAt),
    undefined,
  );
  const { isNew } = useLastSeen('works:lastSeenAt', latestCreatedAt);

  return (
    <section
      id="works"
      className="py-16"
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2
          className="text-2xl font-bold mb-8"
          style={{ color: CURRENT_THEME.text }}
        >
          Works
        </h2>
        <div className="flex flex-col gap-8">
          {works.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              isNew={isNew(work.createdAt)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
