import { Link } from '@/i18n/navigation';

import styles from './Breadcrumbs.module.css';

export type TBreadcrumbItem = {
  label: string;
  href?: string;
};

type TProps = {
  items: TBreadcrumbItem[];
};

export const Breadcrumbs = ({ items }: TProps) => {
  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, idx) => (
          <li key={idx} className={styles.item}>
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={styles.current}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
