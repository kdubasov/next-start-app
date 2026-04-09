'use client';

import type { ComponentType, ReactNode } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/src/shared/lib/cn';

import styles from './NavBarItem.module.css';

type TNavBarItemProps = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  badge?: ReactNode;
};

export function NavBarItem({
  href,
  icon: Icon,
  label,
  disabled,
  badge,
}: TNavBarItemProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  const className = cn(
    styles.item,
    isActive && styles.active,
    disabled && styles.disabled,
  );

  const content = (
    <>
      <Icon />
      <span className={styles.label}>{label}</span>
      {badge ? <span className={styles.badge}>{badge}</span> : null}
    </>
  );

  if (disabled) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
