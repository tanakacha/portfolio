import Image from 'next/image';
import { profile } from '@/content/profile';
import { CURRENT_THEME } from '@/lib/constants';

export default function TopSection() {
  return (
    <section 
      id='top'
      className='w-full'
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className='max-w-6xl mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-8 items-center'>
          <div className='flex justify-center md:justify-start'>
            <div 
              className='w-60 h-60 rounded-full overflow-hidden border-4'
              style={{ borderColor: CURRENT_THEME.border }}
            >
              <Image
                src={'/image/profile.png'}
                alt={profile.name}
                width={200}
                height={200}
                className='w-full h-full object-cover'
              />
            </div>
          </div>
          <div className='text-center md:text-left'>
            <h1
              className='text-3xl md:text-4xl font-bold mb-4'
              style={{ color: CURRENT_THEME.text }}
            >
              {profile.name}
            </h1>
            <p
              className='text-lg mb-2'
              style={{ color: CURRENT_THEME.text }}
            >
              {profile.university}
            </p>
            <p
              className='text-lg mb-2'
              style={{ color: CURRENT_THEME.text }}
            >
              {profile.major}
            </p>
            <div>
              <h2
                className='font-semibold mb-2'
                style={{ color: CURRENT_THEME.text }}
              >
                趣味
              </h2>
              <ul className='flex flex-wrap gap-2 justify-center md:justify-start'>
                {profile.hobbies.map((hobby, idx) => (
                  <li
                    key={idx}
                    className='px-3 py-1 rounded-full text-sm border-2'
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: CURRENT_THEME.border,
                      color: CURRENT_THEME.text
                  }}
                  >
                    {hobby}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}