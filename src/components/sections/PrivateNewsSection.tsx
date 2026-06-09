import { getPrivateNews } from '@/content/private/news.private';
import NewsList from './NewsList';

export default async function PrivateNewsSection() {
  const news = await getPrivateNews();
  if (news.length === 0) return null;
  return <NewsList news={news} storageKey="news:lastSeenAt" />;
}
