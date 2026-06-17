import { CURRENT_THEME } from '@/lib/constants';
import { Idea } from '@/types/idea';
import SpotlightVariant from './ideas/SpotlightVariant';

export default function IdeasSection({ ideas }: { ideas: Idea[] }) {
  if (ideas.length === 0) return null;
  return (
    <section
      id="ideas"
      className="py-16"
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-1" style={{ color: CURRENT_THEME.text }}>
          Ideas
        </h2>
        <div className="text-sm mb-6 space-y-2" style={{ color: CURRENT_THEME.textSecondary }}>
          <p>ご自由にお使いください。アイデアを思いつくペースが、作るペースを上回っているお年頃なので、自分では着手できそうにないけれど、世の中にあったら嬉しいものをメモ代わりに置いておきます。</p>
          <p>思い出せる範囲で昔考えていたものも含むので、すでに実現しているものがあるかもしれません。</p>
          <p>着手・公開のタイミングで一言もらえると嬉しいです（重複開発を避けたいので）。「作り手あり」「一時非公開」などのステータスも随時更新します。</p>
        </div>
          <SpotlightVariant ideas={ideas} />
      </div>
    </section>
  );
}
