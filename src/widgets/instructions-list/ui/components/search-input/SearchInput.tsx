// SearchInput.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import type { TInstructionListParams } from '@/src/shared/api/instructions';

import { buildHref } from '../../../model/url-state';
import styles from './SearchInput.module.css';

type TProps = {
  params: TInstructionListParams;
};

export const SearchInput = ({ params }: TProps) => {
  const t = useTranslations('Instructions');
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(params.q ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(params.q ?? '');
  }, [params.q]);

  const pushQuery = (next: string) => {
    const trimmed = next.trim();
    router.push(
      buildHref(pathname, {
        ...params,
        q: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
    );
  };

  const onChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushQuery(next), 300);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    pushQuery(value);
  };

  return (
    <form className={styles.form} role="search" onSubmit={onSubmit}>
      <input
        className={styles.input}
        type="search"
        placeholder={t('searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('searchPlaceholder')}
      />
    </form>
  );
};
