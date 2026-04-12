import Image from 'next/image';

import type { TInstructionPageData } from '@/src/shared/api/instructions';

import styles from './HeroSection.module.css';

type TProps = {
  article: TInstructionPageData;
};

export const HeroSection = ({ article }: TProps) => {
  return (
    <div className={styles.hero} style={{ background: article.gradient }}>
      <h1 className={styles.title}>{article.title}</h1>
      <div className={styles.imageWrap}>
        <Image
          src={article.card_image}
          alt={article.title}
          width={200}
          height={200}
          className={styles.image}
          priority
        />
      </div>
    </div>
  );
};
