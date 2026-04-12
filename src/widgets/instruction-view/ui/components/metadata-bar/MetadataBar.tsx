import Image from 'next/image';

import { useTranslations } from 'next-intl';

import type { TInstructionPageData } from '@/src/shared/api/instructions';

import styles from './MetadataBar.module.css';

type TProps = {
  article: TInstructionPageData;
};

export const MetadataBar = ({ article }: TProps) => {
  const t = useTranslations('Instructions');

  const date = new Date(article.created_at).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={styles.bar}>
      <div className={styles.author}>
        <Image
          src={article.author_avatar}
          alt={article.author_name}
          width={28}
          height={28}
          className={styles.avatar}
        />
        <span className={styles.authorName}>{article.author_name}</span>
      </div>
      <span className={styles.stat}>👁 {article.views_count}</span>
      <span className={styles.stat}>
        ⏱ {article.read_time} {t('мин')}
      </span>
      <span className={styles.stat}>📅 {date}</span>
    </div>
  );
};
