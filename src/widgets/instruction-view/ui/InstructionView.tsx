import type {
  TInstructionDetail,
  TLocale,
} from '@/src/shared/api/instructions';
import { Breadcrumbs, type TBreadcrumbItem } from '@/src/shared/ui/breadcrumbs';

import { buildArticleJsonLd } from '../model/json-ld';
import { ActionBar } from './components/action-bar/ActionBar';
import { ArticleContent } from './components/article-content/ArticleContent';
import { HeroSection } from './components/hero-section/HeroSection';
import { MetadataBar } from './components/metadata-bar/MetadataBar';
import styles from './InstructionView.module.css';

type TProps = {
  article: TInstructionDetail;
  locale: TLocale;
  baseUrl: string;
  breadcrumbHomeLabel: string;
  breadcrumbInstructionsLabel: string;
  breadcrumbs: TBreadcrumbItem[];
};

export const InstructionView = ({
  article,
  locale,
  baseUrl,
  breadcrumbHomeLabel,
  breadcrumbInstructionsLabel,
  breadcrumbs,
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
        <Breadcrumbs items={breadcrumbs} />
        <HeroSection article={article} />
        <MetadataBar article={article} />
        <ActionBar slug={article.slug} />
        <ArticleContent content={article.content} />
      </div>

      {/* Mobile layout */}
      <div className={styles.mobile}>
        <Breadcrumbs items={breadcrumbs} />
        <h1 className={styles.mobileTitle}>{article.title}</h1>
        <MetadataBar article={article} />
        <ActionBar slug={article.slug} />
        <HeroSection article={article} />
        <ArticleContent content={article.content} />
      </div>
    </article>
  );
};
