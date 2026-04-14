'use client';

import type { ComponentType } from 'react';

import { useTranslations } from 'next-intl';
import {
  LuBookOpen,
  LuHouse,
  LuLayoutGrid,
  LuListChecks,
  LuUsers,
} from 'react-icons/lu';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/src/shared/lib/cn';
import { ExternalAppLink } from '@/src/shared/ui/external-app-link';

import s from './BottomNav.module.css';

type TIconType = ComponentType<{ className?: string }>;

type TItem = {
  to: string;
  labelKey: 'Главная' | 'Каталог' | 'Мои курсы' | 'Задания' | 'Реферал';
  Icon: TIconType;
  external?: boolean;
};

const ITEMS: TItem[] = [
  { to: '/', labelKey: 'Главная', Icon: LuHouse, external: true },
  { to: '/library', labelKey: 'Каталог', Icon: LuLayoutGrid, external: true },
  {
    to: '/my-courses',
    labelKey: 'Мои курсы',
    Icon: LuBookOpen,
    external: true,
  },
  { to: '/tasks', labelKey: 'Задания', Icon: LuListChecks, external: true },
  {
    to: '/referral-program',
    labelKey: 'Реферал',
    Icon: LuUsers,
    external: true,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('BottomNav');

  return (
    <nav className={s.nav}>
      {ITEMS.map(({ to, labelKey, Icon, external }) => {
        const isActive =
          !external &&
          (to === '/' ? pathname === '/' : pathname.startsWith(to));
        const className = cn(s.item, isActive && s.active);
        const content = (
          <>
            <span className={s.iconWrap}>
              <Icon />
            </span>
            <span className={s.label}>{t(labelKey)}</span>
          </>
        );

        if (external) {
          return (
            <ExternalAppLink key={to} href={to} className={className}>
              {content}
            </ExternalAppLink>
          );
        }

        return (
          <Link key={to} href={to} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
