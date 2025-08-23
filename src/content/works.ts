import { Work } from '@/types/work';

export const works: Work[] = [
  // {
  //   id: '0',
  //   title: '仮タイトル',
  //   description: '仮説明あああああああああああああああああああああああああああ説明1行目\n説明2行目あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ',
  //   image: '/image/works/tmp/IMG_3351.JPG',
  //   images: ['/image/works/tmp/IMG_3351.JPG', '/image/works/tmp/IMG_5236.jpg', '/image/works/tmp/IMG_9899.JPG'],
  //   technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
  //   links: {
  //     // store: 'https://example.com/store',
  //   },
  //   achievements: ['Achievement 1', 'Achievement 2'],
  // },
  {
    id: '1',
    title: 'あみぬり',
    description: [
      'リアルなプレビューで事前に完成がわかる編み物デザインアプリです。',
      '完成を確認しながら、デザインを修正することで、',
      '全てのニッターさんの編み物ライフをサポートします。',
      'また、独自の画像変換を実現し、指定の色だけを使用したデザインの作成が簡単にできます。',
      '',
      'Flutterによるクロスプラットフォーム開発で、iOS・Android両対応を実現しました。',
      '',
      '188名48チームが参加したEngineer Guild Hackathonで開発し、準優勝、企業賞を受賞しました。',
      'App Store・Google Playで配信中です。',
    ],
    image: '/image/profile.png',
    images: ['/image/works/aminuri/1.JPEG', '/image/works/aminuri/2.JPEG', '/image/works/aminuri/3.JPEG', '/image/works/aminuri/4.jpg', '/image/works/aminuri/5.jpg', '/image/works/aminuri/6.jpg', '/image/works/aminuri/7.jpg', '/image/works/aminuri/8.JPEG'],
    technologies: ['Flutter', 'Python'],
    links: {
      github: 'https://github.com/nobu74658/guild_hackathon',
      appStore: 'https://apps.apple.com/jp/app/%E3%81%82%E3%81%BF%E3%81%AC%E3%82%8A/id6742402884',
      googlePlay: 'https://play.google.com/store/apps/details?id=com.yiwashita.knitting',
    },
    achievements: ['Achievement 1', 'Achievement 2'],
  },
  {
    id: '2',
    title: '眠眠撃撃',
    description: [
      'FPSゲームをクリアするまで止まらない!?新感覚目覚ましアプリです。',
      '',
      'Flutter Jr. ハッカソンで開発し、チーム賞、企業賞を受賞しました。',
    ],
    image: '/image/works/sleep/1.png',
    images: ['/image/works/sleep/1.JPEG', '/image/works/sleep/2.JPEG', '/image/works/sleep/3.JPEG', '/image/works/sleep/4.JPEG'],
    technologies: ['Flutter'],
    links: {
      github: 'https://github.com/tanakacha/flutter_jr_hackathon',
    },
  }
]