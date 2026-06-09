import { getPublicNews } from '@/content/public/news.public';
import NewsList from './NewsList';

export default async function NewsSection() {
  const news = await getPublicNews();
  if (news.length === 0) return null;
  return <NewsList news={news} storageKey="news:lastSeenAt" />;
}
