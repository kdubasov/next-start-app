// InstructionsList.tsx
import { getTranslations } from 'next-intl/server';

import type {
  TCategoryWithSeo,
  TInstructionListParams,
  TInstructionListResponse,
  TLocale,
} from '@/src/shared/api/instructions';
import {
  Breadcrumbs,
  type TBreadcrumbItem,
} from '@/src/shared/ui/breadcrumbs';

import { buildListJsonLd } from '../model/json-ld';
import { EmptyState } from './components/empty-state/EmptyState';
import { FiltersBar } from './components/filters-bar/FiltersBar';
import { InstructionCard } from './components/instruction-card/InstructionCard';
import { Pagination } from './components/pagination/Pagination';
import { SearchInput } from './components/search-input/SearchInput';
import styles from './InstructionsList.module.css';

type TProps = {
  response: TInstructionListResponse;
  categories: TCategoryWithSeo[];
  currentCategory: TCategoryWithSeo | undefined;
  params: TInstructionListParams;
  basePath: string;
  canonicalPath: string;
  locale: TLocale;
  baseUrl: string;
  breadcrumbs: TBreadcrumbItem[];
};

export const InstructionsList = async ({
  response,
  categories,
  currentCategory,
  params,
  basePath,
  canonicalPath,
  locale,
  baseUrl,
  breadcrumbs,
}: TProps) => {
  const t = await getTranslations('Instructions');
  const title = currentCategory?.seo.title ?? t('seoTitle');
  const description = currentCategory?.seo.description ?? t('seoDescription');

  const jsonLd = buildListJsonLd({
    response,
    category: currentCategory,
    locale,
    baseUrl,
    canonicalPath,
    pageTitle: title,
    pageDescription: description,
    breadcrumbHomeLabel: t('breadcrumbHome'),
    breadcrumbInstructionsLabel: t('breadcrumbInstructions'),
    pageSuffixLabel: (page) => t('pageSuffix', { page }),
  });

  return (
    <section className={styles.root} data-testid="instructions-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={breadcrumbs} />
      <header className={styles.header}>
        <h1 className={styles.title}>
          {currentCategory?.label ?? t('pageTitle')}
        </h1>
        <p className={styles.subtitle}>{description}</p>
      </header>

      <FiltersBar
        params={params}
        categories={categories}
        currentCategory={currentCategory?.slug}
      />
      <SearchInput params={params} />

      {response.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={styles.grid}>
          {response.items.map((item) => (
            <InstructionCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <Pagination
        basePath={basePath}
        params={params}
        totalPages={response.totalPages}
      />
    </section>
  );
};
