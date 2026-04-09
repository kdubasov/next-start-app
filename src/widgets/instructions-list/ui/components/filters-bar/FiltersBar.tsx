// FiltersBar.tsx
'use client';

import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import type {
  TCategoryWithSeo,
  TInstructionListParams,
  TSortOption,
} from '@/src/shared/api/instructions/types';

import { buildHref } from '../../../model/url-state';
import styles from './FiltersBar.module.css';

type TProps = {
  params: TInstructionListParams;
  categories: TCategoryWithSeo[];
  currentCategory: string | undefined;
};

export const FiltersBar = ({ params, categories, currentCategory }: TProps) => {
  const t = useTranslations('Instructions');
  const router = useRouter();
  const pathname = usePathname();

  const onSortChange = (value: string) => {
    const sort =
      value === 'newest' || value === 'popular'
        ? (value as TSortOption)
        : undefined;
    router.push(
      buildHref(pathname, {
        ...params,
        sort,
        page: 1,
      }),
    );
  };

  const onCategoryChange = (value: string) => {
    if (!value) {
      router.push(
        buildHref('/instructions', {
          sort: params.sort,
          q: params.q,
          page: 1,
        }),
      );
    } else {
      router.push(
        buildHref(`/instructions/${value}`, {
          sort: params.sort,
          q: params.q,
          page: 1,
        }),
      );
    }
  };

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="instructions-category">
          {t('filterCategoryLabel')}
        </label>
        <select
          id="instructions-category"
          className={styles.select}
          value={currentCategory ?? ''}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">{t('categoryAll')}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="instructions-sort">
          {t('sortLabel')}
        </label>
        <select
          id="instructions-sort"
          className={styles.select}
          value={params.sort ?? 'newest'}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="newest">{t('sortNewest')}</option>
          <option value="popular">{t('sortPopular')}</option>
        </select>
      </div>
    </div>
  );
};
