import { getTranslations } from 'next-intl/server';

import LanguageSwitcher from '../../components/LanguageSwitcher';

import styles from '../page.module.css';

export default async function Home() {
  const t = await getTranslations('Home');

  return (
    <main className={styles.main} data-testid="home-page">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <LanguageSwitcher />
    </main>
  );
}
