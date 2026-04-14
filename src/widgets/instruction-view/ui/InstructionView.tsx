import { Link } from '@/i18n/navigation';
import type {
  TInstructionDetail,
  TLocale,
} from '@/src/shared/api/instructions';
import { type TBreadcrumbItem } from '@/src/shared/ui/breadcrumbs';

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
  backLabel: string;
  breadcrumbs: TBreadcrumbItem[];
};

export const InstructionView = ({
  article,
  locale,
  baseUrl,
  breadcrumbHomeLabel,
  breadcrumbInstructionsLabel,
  backLabel,
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
        <Link href="/instructions" className={styles.backLink}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>{backLabel}</span>
        </Link>
        <HeroSection article={article} />
        <MetadataBar article={article} />
        <ActionBar slug={article.slug} />
        <ArticleContent content={article.content} />
      </div>

      {/* Mobile layout */}
      <div className={styles.mobile}>
        <div className={styles.toolbar}>
          <Link href="/instructions" className={styles.backLink}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>{backLabel}</span>
          </Link>
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
