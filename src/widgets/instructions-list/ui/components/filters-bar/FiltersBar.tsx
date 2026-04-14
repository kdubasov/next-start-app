// FiltersBar.tsx
'use client';

import { useTranslations } from 'next-intl';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import type {
  TCategory,
  TInstructionListParams,
  TSortOption,
} from '@/src/shared/api/instructions/types';

import { buildHref } from '../../../model/url-state';
import styles from './FiltersBar.module.css';

type TProps = {
  params: TInstructionListParams;
  categories: TCategory[];
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

  const tabHref = (slug: string | null): string =>
    slug ? `/guides/${slug}` : '/guides';

  const isActive = (slug: string | null): boolean =>
    slug === null ? !currentCategory : currentCategory === slug;

  return (
    <div className={styles.bar}>
      <nav className={styles.tabs} aria-label={t('filterCategoryLabel')}>
        <Link
          href={tabHref(null)}
          className={`${styles.tab} ${isActive(null) ? styles.tabActive : ''}`}
        >
          {t('categoryAllShort')}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={tabHref(c.slug)}
            className={`${styles.tab} ${isActive(c.slug) ? styles.tabActive : ''}`}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <div className={styles.sort}>
        <label className={styles.sortLabel} htmlFor="instructions-sort">
          {t('sortLabel')}:
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
