import { CURRENT_THEME } from '@/lib/constants';
import { Work } from '@/types/work';
import WorkCard from './WorkCard';

export default function WorksSection({ works }: { works: Work[] }) {
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
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </div>
    </section>
  );
}
