import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import styles from './BackButton.module.css';

export const BackButton = () => {
  const t = useTranslations('Instructions');
  return (
    <Link href="/instructions" className={styles.back}>
      <span aria-hidden>←</span> {t('К инструкциям')}
    </Link>
  );
};
