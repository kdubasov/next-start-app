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
        background: item.gradient,
        borderColor: `${item.borderColor}25`,
      }}
    >
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
