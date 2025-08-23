import { history } from '@/content/history';
import { COLOR_PALETTE } from '@/lib/constants';

export default function HistorySection() {
  return (
    <section
      id='history'
      className='py-16'
      style={{ backgroundColor: COLOR_PALETTE.hex.white }}
    >
      <div className='max-w-6xl mx-auto px-4'>
        <h2
          className='text-2xl font-bold mb-8'
        >
          History
        </h2>
        {/* モバイル用 */}
        <div className='block md:hidden relative'>
          {/* 全体 */}
          <div
            className='absolute left-16 top-0 bottom-0 w-0.5'
            style={{ backgroundColor: COLOR_PALETTE.hex.sky, height: '100%'}}
          >
          </div>
          {history.map(item => (
            <div key={item.id} className='flex mb-6 relative'>
              {/* 時期 */}
              <div className='w-16 flex-shrink-0 pt-3'>
                <p
                  className='text-xs'
                  style={{ color: COLOR_PALETTE.hex.gray}}
                >
                  {item.date}
                </p>
              </div>

              {/* 出来事 */}
              <div className='flex-1 pl-4 pb-6 relative'>
                {/* 丸 */}
                <div
                  className='absolute w-2 h-2 rounded-full top-4 z-10'
                  style={{
                    backgroundColor: COLOR_PALETTE.hex.sky,
                    left: '-3px'
                  }}
                ></div>

                <h3
                  className='text-base font-semibold mb-1'
                  style={{ color: COLOR_PALETTE.hex.text }}
                >
                  {item.title}
                </h3>
                <p
                  className='text-sm'
                  style={{ color: COLOR_PALETTE.hex.text }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PC用 */}
        <div className='hidden md:block relative'>
          {/* 全体 */}
          <div
            className='absolute left-28 top-0 bottom-0 w-0.5'
            style={{ backgroundColor: COLOR_PALETTE.hex.sky, height: '100%' }}
          ></div>

          {history.map(item => (
            <div key={item.id} className='flex mb-8 relative'>
              {/* 時期 */}
              <div className='w-28 flex-shrink-0 pt-5'>
                <p
                  className='text-sm font-medium'
                  style={{ color: COLOR_PALETTE.hex.gray }}
                >
                  {item.date}
                </p>
              </div>
              {/* 出来事 */}
              <div
                className='flex-1 pl-8 pb-8 relative'
              >
                {/* 丸 */}
                <div
                  className='absolute w-3 h-3 rounded-full top-6 z-10'
                  style={{ 
                    backgroundColor: COLOR_PALETTE.hex.sky,
                    left: '-5px'
                  }}
                ></div>

                <h3
                  className='text-lg font-semibold mb-2'
                  style={{ color: COLOR_PALETTE.hex.text }}
                >
                  {item.title}
                </h3>
                <p className='text-sm'
                  style={{ color: COLOR_PALETTE.hex.text }}
                >
                  {item.description}
                </p>
              </div>
            </div>
            
          ))}
        </div>
      </div>

    </section>
  )
}