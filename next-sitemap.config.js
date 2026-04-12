/** @type {import('next-sitemap').IConfig} */
// eslint-disable-next-line
module.exports = {
  // eslint-disable-next-line no-undef
  siteUrl: process.env.NEXT_PUBLIC_PROD_URL,
  generateRobotsTxt: true,
  transform: async (config, path) => {
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
      };
    }

    return {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
    };
  },
  additionalPaths: async () => {
    const locales = ['ru', 'en'];
    const categories = ['ai', 'crypto'];
    const maxPages = 5;
    const paths = [];
    for (const locale of locales) {
      paths.push({
        loc: `/${locale}/instructions`,
        changefreq: 'daily',
        priority: 0.8,
      });
      for (let p = 2; p <= maxPages; p++) {
        paths.push({
          loc: `/${locale}/instructions?page=${p}`,
          changefreq: 'daily',
          priority: 0.5,
        });
      }
      for (const cat of categories) {
        paths.push({
          loc: `/${locale}/instructions/${cat}`,
          changefreq: 'daily',
          priority: 0.8,
        });
        for (let p = 2; p <= maxPages; p++) {
          paths.push({
            loc: `/${locale}/instructions/${cat}?page=${p}`,
            changefreq: 'daily',
            priority: 0.5,
          });
        }
      }
    }
    // Individual instruction pages (only mocked articles with content)
    const articleSlugs = [
      'как-настроить-open-claw-на-сервере',
      'безопасность-в-web3-чек-лист',
      'как-настроить-claude-code-на-проекте',
      'промпт-инжиниринг-для-продуктовых-задач',
    ];
    for (const locale of locales) {
      for (const slug of articleSlugs) {
        // Match generated slugs — they have a trailing `-N` suffix
        paths.push({
          loc: `/${locale}/instruction/${slug}-1`,
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }
    return paths;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/*?utm_*',
          '/*?etext*',
          '/*?code*',
          '/*?yprqee*',
          '/*?_ym_debug*',
        ],
      },
    ],
    // eslint-disable-next-line no-undef
    additionalSitemaps: [process.env.NEXT_PUBLIC_PROD_URL + '/sitemap.xml'],
  },
};
