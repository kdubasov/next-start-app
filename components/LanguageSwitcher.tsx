'use client';

import { useTransition } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '../i18n/navigation';
import { routing } from '../i18n/routing';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: (typeof routing.locales)[number]) => {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div aria-label={t('label')} data-testid="language-switcher">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={l === locale || isPending}
          onClick={() => switchTo(l)}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
