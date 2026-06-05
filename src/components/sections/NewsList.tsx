import { News } from '@/types/news';
import { CURRENT_THEME } from '@/lib/constants';

interface Props {
  news: News[];
}

export default function NewsList({ news }: Props) {
  return (
    <section
      id='news'
      className='py-12'
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className='max-w-3xl mx-auto px-4'>
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
              className='flex flex-col md:flex-row gap-1 md:gap-6 py-3 border-b last:border-b-0'
              style={{ borderColor: CURRENT_THEME.border }}
            >
              <div className='md:w-28 flex-shrink-0'>
                <time
                  className='text-xs md:text-sm'
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
