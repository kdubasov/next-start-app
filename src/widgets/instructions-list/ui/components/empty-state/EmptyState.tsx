// EmptyState.tsx
import { getTranslations } from 'next-intl/server';

import styles from './EmptyState.module.css';

export const EmptyState = async () => {
  const t = await getTranslations('Instructions');
  return (
    <div className={styles.root} data-testid="instructions-empty">
      <h2 className={styles.title}>{t('empty')}</h2>
      <p className={styles.hint}>{t('emptyHint')}</p>
    </div>
  );
};
