// InstructionCard.tsx
import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import type { TInstructionListItem } from '@/src/shared/api/instructions';

import styles from './InstructionCard.module.css';

type TProps = {
  item: TInstructionListItem;
};

export const InstructionCard = ({ item }: TProps) => {
  return (
    <Link
      href={`/instruction/${item.slug}`}
      className={styles.card}
      style={{
        background: item.gradient ?? undefined,
        borderColor: item.borderColor ? `${item.borderColor}25` : undefined,
      }}
    >
      <span className={styles.bookmark} aria-hidden>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </span>
      {item.cardImage && (
        <div className={styles.imageWrap}>
          <Image
            src={item.cardImage}
            alt={item.title}
            width={328}
            height={181}
            className={styles.image}
            loading="lazy"
          />
        </div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles.meta}>
          <Image
            src={item.author.avatar}
            alt={item.author.name}
            width={24}
            height={24}
            className={styles.avatar}
          />
          <span>{item.author.name}</span>
          <span aria-hidden>·</span>
          <span>{item.viewsCount}</span>
        </div>
      </div>
    </Link>
  );
};
