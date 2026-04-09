// Pagination.tsx
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import type { TInstructionListParams } from '@/src/shared/api/instructions';

import { buildHref, buildPageRange } from '../../../model/url-state';
import styles from './Pagination.module.css';

type TProps = {
  basePath: string;
  params: TInstructionListParams;
  totalPages: number;
};

export const Pagination = async ({ basePath, params, totalPages }: TProps) => {
  const t = await getTranslations('Instructions');
  if (totalPages <= 1) return null;

  const current = params.page ?? 1;
  const range = buildPageRange(current, totalPages);

  const hrefFor = (page: number): string =>
    buildHref(basePath, { ...params, page });

  return (
    <nav className={styles.nav} aria-label={t('paginationLabel')}>
      {current > 1 ? (
        <Link
          href={hrefFor(current - 1)}
          className={styles.item}
          rel="prev"
          aria-label={t('paginationPrev')}
        >
          ←
        </Link>
      ) : (
        <span
          className={`${styles.item} ${styles.disabled}`}
          aria-hidden="true"
        >
          ←
        </span>
      )}

      {range.map((entry, idx) =>
        entry === '…' ? (
          <span key={`e-${idx}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : entry === current ? (
          <span
            key={entry}
            className={`${styles.item} ${styles.active}`}
            aria-current="page"
          >
            {entry}
          </span>
        ) : (
          <Link key={entry} href={hrefFor(entry)} className={styles.item}>
            {entry}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link
          href={hrefFor(current + 1)}
          className={styles.item}
          rel="next"
          aria-label={t('paginationNext')}
        >
          →
        </Link>
      ) : (
        <span
          className={`${styles.item} ${styles.disabled}`}
          aria-hidden="true"
        >
          →
        </span>
      )}
    </nav>
  );
};
