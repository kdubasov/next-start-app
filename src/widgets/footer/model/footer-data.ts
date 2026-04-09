export type TFooterLinkItem = {
  label: string;
  link: string;
  isExternal: boolean;
  soon: boolean;
};

export type TFooterColumn = {
  title: string;
  links: TFooterLinkItem[];
};

export const footerData: TFooterColumn[] = [
  {
    title: 'Продукт',
    links: [
      {
        label: 'Обзор',
        link: 'http://open-academy.app',
        isExternal: true,
        soon: false,
      },
      {
        label: 'Telegram Mini App',
        link: 'https://t.me/nutsfarm_bot/',
        isExternal: true,
        soon: false,
      },
      {
        label: 'Course Studio',
        link: '',
        isExternal: false,
        soon: true,
      },
    ],
  },
  {
    title: 'Документы',
    links: [
      {
        label: 'Вайтпейпер',
        link: 'https://openacademy.gitbook.io/docs',
        isExternal: true,
        soon: false,
      },
      {
        label: 'Токеномика',
        link: 'https://openacademy.gitbook.io/docs/token/usdoa',
        isExternal: true,
        soon: false,
      },
      {
        label: 'Privacy Policy',
        link: '/docs/privacy-policy.pdf',
        isExternal: true,
        soon: false,
      },
      {
        label: 'Terms of Use',
        link: '/docs/terms-of-use.pdf',
        isExternal: true,
        soon: false,
      },
      {
        label: 'Cookie Policy',
        link: '/docs/cookies.pdf',
        isExternal: true,
        soon: false,
      },
    ],
  },
  {
    title: 'Контакты',
    links: [
      {
        label: 'Поддержка',
        link: 'https://t.me/open_academy_support_bot',
        isExternal: true,
        soon: false,
      },
      {
        label: 'Обратная связь',
        link: 'https://t.me/open_academy_support_bot',
        isExternal: true,
        soon: false,
      },
      {
        label: 'Партнёрство',
        link: 'https://t.me/openacademy_team',
        isExternal: true,
        soon: false,
      },
    ],
  },
];
