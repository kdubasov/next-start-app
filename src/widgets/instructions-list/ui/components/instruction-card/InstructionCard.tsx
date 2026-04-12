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
        borderColor: `${item.border_color}25`,
      }}
    >
      <div className={styles.imageWrap}>
        <Image
          src={item.card_image}
          alt={item.title}
          width={328}
          height={181}
          className={styles.image}
          loading="lazy"
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles.meta}>
          <Image
            src={item.author_avatar}
            alt={item.author_name}
            width={24}
            height={24}
            className={styles.avatar}
          />
          <span>{item.author_name}</span>
          <span aria-hidden>·</span>
          <span>{item.views_count}</span>
        </div>
      </div>
    </Link>
  );
};
