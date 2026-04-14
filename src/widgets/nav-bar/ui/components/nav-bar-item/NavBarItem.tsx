'use client';

import type { ComponentType, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import { Link, usePathname } from '@/i18n/navigation';
import { ExternalAppLink } from '@/src/shared/ui/external-app-link';

import styles from './NavBarItem.module.css';

type TNavBarItemProps = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  badge?: ReactNode;
  external?: boolean;
};

export function NavBarItem({
  href,
  icon: Icon,
  label,
  disabled,
  badge,
  external,
}: TNavBarItemProps) {
  const pathname = usePathname();
  const isActive =
    !external && (href === '/' ? pathname === '/' : pathname.startsWith(href));

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

  if (external) {
    return (
      <ExternalAppLink href={href} className={className}>
        {content}
      </ExternalAppLink>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
