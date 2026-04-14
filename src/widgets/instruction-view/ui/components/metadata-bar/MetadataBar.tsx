import Image from 'next/image';

import { useLocale } from 'next-intl';

import type {
  TInstructionDetail,
  TLocale,
} from '@/src/shared/api/instructions';
import { formatDuration } from '@/src/shared/lib/duration';

import styles from './MetadataBar.module.css';

type TProps = {
  article: TInstructionDetail;
};

export const MetadataBar = ({ article }: TProps) => {
  const locale = useLocale() as TLocale;

  const date = new Date(article.createdAt).toLocaleDateString(
    locale === 'en' ? 'en-US' : 'ru-RU',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  );

  const readTimeText = formatDuration(article.timeToRead, locale);

  return (
    <div className={styles.bar}>
      <div className={styles.author}>
        <Image
          src={article.author.avatar}
          alt={article.author.name}
          width={28}
          height={28}
          className={styles.avatar}
        />
        <span className={styles.authorName}>{article.author.name}</span>
      </div>
      <span className={styles.stat}>👁 {article.viewsCount}</span>
      {readTimeText && <span className={styles.stat}>⏱ {readTimeText}</span>}
      <span className={styles.stat}>📅 {date}</span>
    </div>
  );
};
