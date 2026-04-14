// src/widgets/instruction-view/model/json-ld.ts
import type {
  TInstructionDetail,
  TLocale,
} from '@/src/shared/api/instructions';

type TBuildArgs = {
  article: TInstructionDetail;
  locale: TLocale;
  baseUrl: string;
  breadcrumbHomeLabel: string;
  breadcrumbInstructionsLabel: string;
};

export const buildArticleJsonLd = ({
  article,
  locale,
  baseUrl,
  breadcrumbHomeLabel,
  breadcrumbInstructionsLabel,
}: TBuildArgs): Record<string, unknown>[] => {
  const absolute = (path: string): string =>
    path.startsWith('http') ? path : `${baseUrl}${path}`;

  const url = absolute(`/${locale}/guide/${article.slug}`);

  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: article.title,
    description: article.seo?.description,
    image: article.cardImage ? absolute(article.cardImage) : undefined,
    url,
    inLanguage: locale,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    timeRequired: article.timeToRead,
    author: {
      '@type': 'Person',
      name: article.author.name,
    },
  };

  const breadcrumbList: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: breadcrumbHomeLabel,
        item: absolute(`/`),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: breadcrumbInstructionsLabel,
        item: absolute(`/${locale}/guides`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: url,
      },
    ],
  };

  return [articleSchema, breadcrumbList];
};
