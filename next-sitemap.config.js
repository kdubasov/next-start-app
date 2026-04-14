/** @type {import('next-sitemap').IConfig} */
// eslint-disable-next-line no-undef
const SITE_URL = process.env.NEXT_PUBLIC_PROD_URL;
// eslint-disable-next-line no-undef
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const LOCALES = ['ru', 'en'];
const PAGE_SIZE = 50;

const fetchListPage = async (locale, page, category) => {
  const url = new URL(`${API_BASE}/instructions`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(PAGE_SIZE));
  if (category) url.searchParams.set('category', category);

  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': locale, Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`sitemap: ${url.toString()} → ${res.status}`);
  }
  return res.json();
};

const collectLocaleData = async (locale) => {
  const first = await fetchListPage(locale, 1);
  const categories = first.categories ?? [];
  const allItems = [...first.items];

  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchListPage(locale, page);
    allItems.push(...next.items);
  }

  const categoryPages = {};
  for (const cat of categories) {
    const firstCat = await fetchListPage(locale, 1, cat.slug);
    categoryPages[cat.slug] = firstCat.totalPages;
  }

  return {
    categories,
    items: allItems,
    categoryPages,
    totalPages: first.totalPages,
  };
};

// eslint-disable-next-line no-undef
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  transform: async (config, path) => {
    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0 };
    }
    return { loc: path, changefreq: 'daily', priority: 0.7 };
  },
  additionalPaths: async () => {
    const paths = [];

    for (const locale of LOCALES) {
      let data;
      try {
        data = await collectLocaleData(locale);
      } catch (e) {
        console.error(
          `[sitemap] API unavailable for ${locale}, falling back:`,
          e,
        );
        paths.push({
          loc: `/${locale}/instructions`,
          changefreq: 'daily',
          priority: 0.8,
        });
        continue;
      }

      paths.push({
        loc: `/${locale}/instructions`,
        changefreq: 'daily',
        priority: 0.8,
      });
      for (let p = 2; p <= data.totalPages; p++) {
        paths.push({
          loc: `/${locale}/instructions?page=${p}`,
          changefreq: 'daily',
          priority: 0.5,
        });
      }

      for (const cat of data.categories) {
        paths.push({
          loc: `/${locale}/instructions/${cat.slug}`,
          changefreq: 'daily',
          priority: 0.8,
        });
        const totalCatPages = data.categoryPages[cat.slug] ?? 1;
        for (let p = 2; p <= totalCatPages; p++) {
          paths.push({
            loc: `/${locale}/instructions/${cat.slug}?page=${p}`,
            changefreq: 'daily',
            priority: 0.5,
          });
        }
      }

      for (const item of data.items) {
        paths.push({
          loc: `/${locale}/instruction/${item.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: item.updatedAt,
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
    additionalSitemaps: [SITE_URL + '/sitemap.xml'],
  },
};
