import type { ReactNode } from 'react';

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { BottomNav } from '@/src/widgets/bottom-nav';
import { Footer } from '@/src/widgets/footer';
import { Header } from '@/src/widgets/header';
import { NavBar } from '@/src/widgets/nav-bar';

import '../globals.css';
import Providers from '../providers';
import layoutStyles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Open Academy',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#5bbad5' },
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#a66cff',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const theme = (await cookies()).get('theme')?.value === 'dark' ? 'dark' : '';

  return (
    <html lang={locale} className={theme}>
      <body>
        <NextIntlClientProvider>
          <Providers>
            <div className={layoutStyles.appShell}>
              <NavBar />
              <div className={layoutStyles.contentColumn}>
                <Header />
                <main className={layoutStyles.main}>{children}</main>
                <Footer />
              </div>
              <BottomNav />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
