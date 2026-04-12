// app/[locale]/instructions/page.tsx
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';
import {
  getCategories,
  getInstructions,
  type TLocale,
} from '@/src/shared/api/instructions';
import { InstructionsList } from '@/src/widgets/instructions-list';
import {
  buildCanonical,
  isExplicitPageOne,
  parseSearchParams,
  shouldNoindex,
} from '@/src/widgets/instructions-list/model/url-state';

const BASE_URL = process.env.NEXT_PUBLIC_PROD_URL ?? '';

type TPageProps = {
  params: Promise<{ locale: TLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: TPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Instructions' });

  const parsed = parseSearchParams(sp, locale);
  const basePath = '/instructions';
  const canonical = `${BASE_URL}/${locale}${buildCanonical(basePath, parsed)}`;
  const page = parsed.page ?? 1;

  const baseTitle = t('seoTitle');
  const title =
    page > 1 ? `${baseTitle} — ${t('pageSuffix', { page })}` : baseTitle;
  const description = t('seoDescription');

  return {
    title,
    description,
    keywords: t('seoKeywords'),
    alternates: {
      canonical,
      languages: {
        ru: `${BASE_URL}/ru${buildCanonical(basePath, { ...parsed, locale: 'ru' })}`,
        en: `${BASE_URL}/en${buildCanonical(basePath, { ...parsed, locale: 'en' })}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: !shouldNoindex(parsed),
      follow: true,
    },
  };
};

export default async function InstructionsPage({
  params,
  searchParams,
}: TPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  if (isExplicitPageOne(sp)) {
    const clean = { ...sp };
    delete clean.page;
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(clean)) {
      if (typeof v === 'string') qs.set(k, v);
    }
    const s = qs.toString();
    redirect({
      href: `/instructions${s ? `?${s}` : ''}`,
      locale,
    });
  }

  const parsed = parseSearchParams(sp, locale);
  const [response, categories] = await Promise.all([
    getInstructions(parsed),
    getCategories({ locale }),
  ]);

  if (response.total > 0 && (parsed.page ?? 1) > response.totalPages) {
    notFound();
  }

  const basePath = '/instructions';
  const canonicalPath = `/${locale}${buildCanonical(basePath, parsed)}`;
  const t = await getTranslations({ locale, namespace: 'Instructions' });

  return (
    <InstructionsList
      response={response}
      categories={categories}
      currentCategory={undefined}
      params={parsed}
      basePath={basePath}
      canonicalPath={canonicalPath}
      locale={locale}
      baseUrl={BASE_URL}
      breadcrumbs={[
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbInstructions') },
      ]}
    />
  );
}
