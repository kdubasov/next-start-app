import Image from 'next/image';

import { getTranslations } from 'next-intl/server';

import { ExternalAppLink } from '@/src/shared/ui/external-app-link';

import styles from './not-found.module.css';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>{t('heading')}</h1>
      <ExternalAppLink href="/" className={styles.homeLink}>
        {t('homeLink')}
      </ExternalAppLink>
      <Image
        src="/images/not-found-illustration.svg"
        alt=""
        width={240}
        height={240}
        className={styles.illustration}
      />
    </div>
  );
}
