import { getTranslations } from 'next-intl/server';

import styles from '../../page.module.css';

export default async function GuidesPage() {
  const t = await getTranslations('Home');

  return (
    <main className={styles.main} data-testid="guides-page">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </main>
  );
}
