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
