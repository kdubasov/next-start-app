'use client';

import { useMemo, useTransition } from 'react';

import Image from 'next/image';

import { useLocale } from 'next-intl';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/src/shared/lib/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select';

import styles from './LanguageSelect.module.css';

type TLanguage = (typeof routing.locales)[number];

interface ILanguageConfig {
  code: TLanguage;
  label: string;
  flagSrc: string;
}

const LANGUAGES: ILanguageConfig[] = [
  { code: 'en', label: 'EN', flagSrc: '/brand/flag-en.svg' },
  { code: 'ru', label: 'RU', flagSrc: '/brand/flag-ru.svg' },
];

interface ILanguageSelectProps {
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export default function LanguageSelect({
  className,
  align,
}: ILanguageSelectProps) {
  const currentLanguage = useLocale() as TLanguage;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLanguageConfig = useMemo(
    () =>
      LANGUAGES.find((langConfig) => langConfig.code === currentLanguage) ??
      LANGUAGES[0],
    [currentLanguage],
  );

  const handleChange = (next: string) => {
    if (next === currentLanguage) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('i18nextLng', next);
    }
    startTransition(() => {
      router.replace(pathname, { locale: next as TLanguage });
    });
  };

  return (
    <Select
      value={currentLanguage}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn(styles.trigger, className)}
        icon={<LuChevronDown className={styles.triggerIcon} />}
      >
        <div className={styles.triggerInner}>
          <Image
            src={currentLanguageConfig.flagSrc}
            alt=""
            width={27}
            height={18}
            className={styles.flag}
          />
          <SelectValue>
            <span className={styles.valueText}>
              {currentLanguage.toUpperCase()}
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className={styles.content} align={align}>
        <div className={styles.contentInner}>
          {LANGUAGES.map((langConfig) => {
            const isSelected = langConfig.code === currentLanguage;
            return (
              <SelectItem
                key={langConfig.code}
                value={langConfig.code}
                isIconHidden
                className={cn(
                  styles.option,
                  isSelected && styles.optionSelected,
                )}
              >
                <div className={styles.optionInner}>
                  <Image
                    src={langConfig.flagSrc}
                    alt=""
                    width={27}
                    height={18}
                    className={styles.flag}
                  />
                  <span>{langConfig.label}</span>
                  {isSelected && <LuCheck className={styles.check} />}
                </div>
              </SelectItem>
            );
          })}
        </div>
      </SelectContent>
    </Select>
  );
}
