'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import styles from './ActionBar.module.css';

type TProps = {
  slug: string;
};

const STORAGE_KEY = 'instruction-bookmarks';

const getBookmarks = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export const ActionBar = ({ slug }: TProps) => {
  const t = useTranslations('Instructions');
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(getBookmarks().includes(slug));
  }, [slug]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('Ссылка скопирована'));
  }, [t]);

  const handleBookmark = useCallback(() => {
    const current = getBookmarks();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setBookmarked(next.includes(slug));
  }, [slug]);

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.btn} onClick={handleCopy}>
        🔗 {t('Копировать ссылку')}
      </button>
      <button type="button" className={styles.btn} onClick={handleBookmark}>
        {bookmarked ? '🔖' : '🔖'}{' '}
        {bookmarked ? t('В закладках') : t('В закладки')}
      </button>
    </div>
  );
};
