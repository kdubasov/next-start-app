// src/widgets/instruction-view/model/json-ld.ts
import type {
  TInstructionPageData,
  TLocale,
} from '@/src/shared/api/instructions';

type TBuildArgs = {
  article: TInstructionPageData;
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

  const url = absolute(`/${locale}/instruction/${article.slug}`);

  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: article.title,
    description: article.seo.description,
    image: absolute(article.card_image),
    url,
    inLanguage: locale,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author_name,
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
        item: absolute(`/${locale}`),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: breadcrumbInstructionsLabel,
        item: absolute(`/${locale}/instructions`),
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
