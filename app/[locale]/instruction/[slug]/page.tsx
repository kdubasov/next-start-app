// app/[locale]/instruction/[slug]/page.tsx
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import {
  getInstructionBySlug,
  getInstructions,
  type TLocale,
} from '@/src/shared/api/instructions';
import { InstructionView } from '@/src/widgets/instruction-view';

const BASE_URL = process.env.NEXT_PUBLIC_PROD_URL ?? '';

type TPageProps = {
  params: Promise<{ locale: TLocale; slug: string }>;
};

export const generateStaticParams = async () => {
  const result: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    const { items } = await getInstructions({
      locale: locale as TLocale,
      pageSize: 200,
    });
    for (const item of items) {
      result.push({ locale, slug: item.slug });
    }
  }
  return result;
};

export const generateMetadata = async ({
  params,
}: TPageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  const article = await getInstructionBySlug(slug, locale);
  if (!article) return {};

  const canonical = `${BASE_URL}/${locale}/instruction/${slug}`;

  return {
    title: article.seo.title,
    description: article.seo.description,
    keywords: article.seo.keywords.join(', '),
    alternates: {
      canonical,
      languages: {
        ru: `${BASE_URL}/ru/instruction/${slug}`,
        en: `${BASE_URL}/en/instruction/${slug}`,
      },
    },
    openGraph: {
      title: article.seo.title,
      description: article.seo.description,
      url: canonical,
      type: 'article',
      locale,
      images: [
        {
          url: article.card_image.startsWith('http')
            ? article.card_image
            : `${BASE_URL}${article.card_image}`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo.title,
      description: article.seo.description,
    },
  };
};

export default async function InstructionPage({ params }: TPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getInstructionBySlug(slug, locale);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: 'Instructions' });

  return (
    <InstructionView
      article={article}
      locale={locale}
      baseUrl={BASE_URL}
      breadcrumbHomeLabel={t('breadcrumbHome')}
      breadcrumbInstructionsLabel={t('breadcrumbInstructions')}
    />
  );
}
