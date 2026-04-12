import type {
  TInstructionPageData,
  TLocale,
} from '@/src/shared/api/instructions';

import { buildArticleJsonLd } from '../model/json-ld';
import { ActionBar } from './components/action-bar/ActionBar';
import { ArticleContent } from './components/article-content/ArticleContent';
import { BackButton } from './components/back-button/BackButton';
import { HeroSection } from './components/hero-section/HeroSection';
import { MetadataBar } from './components/metadata-bar/MetadataBar';
import styles from './InstructionView.module.css';

type TProps = {
  article: TInstructionPageData;
  locale: TLocale;
  baseUrl: string;
  breadcrumbHomeLabel: string;
  breadcrumbInstructionsLabel: string;
};

export const InstructionView = ({
  article,
  locale,
  baseUrl,
  breadcrumbHomeLabel,
  breadcrumbInstructionsLabel,
}: TProps) => {
  const jsonLd = buildArticleJsonLd({
    article,
    locale,
    baseUrl,
    breadcrumbHomeLabel,
    breadcrumbInstructionsLabel,
  });

  return (
    <article className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Desktop layout */}
      <div className={styles.desktop}>
        <BackButton />
        <HeroSection article={article} />
        <MetadataBar article={article} />
        <ActionBar slug={article.slug} />
        <ArticleContent content={article.content} />
      </div>

      {/* Mobile layout */}
      <div className={styles.mobile}>
        <div className={styles.toolbar}>
          <BackButton />
          <div className={styles.toolbarActions}>
            <ActionBar slug={article.slug} />
          </div>
        </div>
        <h1 className={styles.mobileTitle}>{article.title}</h1>
        <MetadataBar article={article} />
        <HeroSection article={article} />
        <ArticleContent content={article.content} />
      </div>
    </article>
  );
};
