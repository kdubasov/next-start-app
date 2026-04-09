// src/widgets/instructions-list/model/json-ld.ts
import type {
  TCategoryWithSeo,
  TInstructionListResponse,
  TLocale,
} from '@/src/shared/api/instructions';

type TBuildArgs = {
  response: TInstructionListResponse;
  category: TCategoryWithSeo | undefined;
  locale: TLocale;
  baseUrl: string;
  canonicalPath: string;
  pageTitle: string;
  pageDescription: string;
  breadcrumbHomeLabel: string;
  breadcrumbInstructionsLabel: string;
  pageSuffixLabel: (page: number) => string;
};

export const buildListJsonLd = ({
  response,
  category,
  locale,
  baseUrl,
  canonicalPath,
  pageTitle,
  pageDescription,
  breadcrumbHomeLabel,
  breadcrumbInstructionsLabel,
  pageSuffixLabel,
}: TBuildArgs): Record<string, unknown>[] => {
  const absolute = (path: string): string =>
    path.startsWith('http') ? path : `${baseUrl}${path}`;

  const url = absolute(canonicalPath);

  const collectionPage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    name: pageTitle,
    description: pageDescription,
    url,
    inLanguage: locale,
  };

  const breadcrumbs: Record<string, unknown>[] = [
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
  ];
  if (category) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 3,
      name: category.label,
      item: absolute(`/${locale}/instructions/${category.slug}`),
    });
  }
  if (response.page > 1) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: breadcrumbs.length + 1,
      name: pageSuffixLabel(response.page),
      item: url,
    });
  }

  const breadcrumbList: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs,
  };

  const itemList: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: response.items.map((item, idx) => ({
      '@type': 'ListItem',
      position: (response.page - 1) * response.pageSize + idx + 1,
      url: absolute(`/${locale}/instructions/${item.slug}`),
      item: {
        '@type': 'Article',
        headline: item.title,
        description: item.seo.description,
        image: absolute(item.card_image),
        author: {
          '@type': 'Person',
          name: item.author_name,
        },
        datePublished: item.created_at,
        dateModified: item.updated_at,
        inLanguage: locale,
      },
    })),
  };

  return [collectionPage, breadcrumbList, itemList];
};
