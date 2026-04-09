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

import s from './BottomNav.module.css';

type TIconType = ComponentType<{ className?: string }>;

type TItem = {
  to: string;
  labelKey: 'Главная' | 'Каталог' | 'Мои курсы' | 'Задания' | 'Реферал';
  Icon: TIconType;
};

const ITEMS: TItem[] = [
  { to: '/', labelKey: 'Главная', Icon: LuHouse },
  { to: '/library', labelKey: 'Каталог', Icon: LuLayoutGrid },
  { to: '/my-courses', labelKey: 'Мои курсы', Icon: LuBookOpen },
  { to: '/tasks', labelKey: 'Задания', Icon: LuListChecks },
  { to: '/referral-program', labelKey: 'Реферал', Icon: LuUsers },
];

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('BottomNav');

  return (
    <nav className={s.nav}>
      {ITEMS.map(({ to, labelKey, Icon }) => {
        const isActive =
          to === '/' ? pathname === '/' : pathname.startsWith(to);
        return (
          <Link key={to} href={to} className={cn(s.item, isActive && s.active)}>
            <span className={s.iconWrap}>
              <Icon />
            </span>
            <span className={s.label}>{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
