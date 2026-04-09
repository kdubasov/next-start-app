'use client';

import { useEffect, useState } from 'react';

import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { FiMoon, FiSun } from 'react-icons/fi';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/shared/ui/tooltip';

import styles from './ThemeToggle.module.css';

type TTheme = 'light' | 'dark';

const COOKIE_NAME = 'theme';
const COOKIE_EXPIRES_DAYS = 365;

export default function ThemeToggle() {
  const t = useTranslations('Header');
  const [theme, setTheme] = useState<TTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial: TTheme = document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
    setTheme(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: TTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    Cookies.set(COOKIE_NAME, next, {
      expires: COOKIE_EXPIRES_DAYS,
      sameSite: 'lax',
      path: '/',
    });
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const tooltipText = theme === 'dark' ? t('darkMode') : t('lightMode');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={styles.button}
            onClick={toggle}
            aria-label={tooltipText}
            suppressHydrationWarning
          >
            {mounted && theme === 'dark' ? (
              <FiMoon className={styles.iconDark} />
            ) : (
              <FiSun className={styles.iconLight} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
