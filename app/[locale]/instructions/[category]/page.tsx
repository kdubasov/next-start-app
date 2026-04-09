// app/[locale]/instructions/[category]/page.tsx

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
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
  params: Promise<{ locale: TLocale; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateStaticParams = async () => {
  const result: { locale: string; category: string }[] = [];
  for (const locale of routing.locales) {
    const cats = await getCategories({ locale: locale as TLocale });
    for (const c of cats) {
      result.push({ locale, category: c.slug });
    }
  }
  return result;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: TPageProps): Promise<Metadata> => {
  const { locale, category } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Instructions' });
  const categories = await getCategories({ locale });
  const cat = categories.find((c) => c.slug === category);
  if (!cat) {
    return { title: t('seoTitle') };
  }

  const parsed = parseSearchParams(sp, locale, category);
  const basePath = `/instructions/${category}`;
  const canonical = `${BASE_URL}/${locale}${buildCanonical(basePath, parsed)}`;
  const page = parsed.page ?? 1;

  const baseTitle = cat.seo.title;
  const title =
    page > 1 ? `${baseTitle} — ${t('pageSuffix', { page })}` : baseTitle;
  const description = cat.seo.description;

  return {
    title,
    description,
    keywords: cat.seo.keywords.join(', '),
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
      images: cat.seo.ogImageUrl
        ? [
            {
              url: cat.seo.ogImageUrl.startsWith('http')
                ? cat.seo.ogImageUrl
                : `${BASE_URL}${cat.seo.ogImageUrl}`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
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

export default async function InstructionsCategoryPage({
  params,
  searchParams,
}: TPageProps) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const categories = await getCategories({ locale });
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  if (isExplicitPageOne(sp)) {
    const clean = { ...sp };
    delete clean.page;
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(clean)) {
      if (typeof v === 'string') qs.set(k, v);
    }
    const s = qs.toString();
    redirect({
      href: `/instructions/${category}${s ? `?${s}` : ''}`,
      locale,
    });
  }

  const parsed = parseSearchParams(sp, locale, category);
  const response = await getInstructions(parsed);

  if (response.total > 0 && (parsed.page ?? 1) > response.totalPages) {
    notFound();
  }

  const basePath = `/instructions/${category}`;
  const canonicalPath = `/${locale}${buildCanonical(basePath, parsed)}`;

  return (
    <InstructionsList
      response={response}
      categories={categories}
      currentCategory={cat}
      params={parsed}
      basePath={basePath}
      canonicalPath={canonicalPath}
      locale={locale}
      baseUrl={BASE_URL}
    />
  );
}
