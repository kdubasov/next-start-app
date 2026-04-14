'use client';

import { useTranslations } from 'next-intl';
import {
  LuBookMarked,
  LuBookOpen,
  LuCoins,
  LuHouse,
  LuLayoutGrid,
  LuListChecks,
  LuSparkles,
  LuUsers,
} from 'react-icons/lu';

import { ExternalAppLink } from '@/src/shared/ui/external-app-link';
import { AcademyLogoFull } from '@/src/shared/ui/logo';

import { Divider } from './components/divider/Divider';
import { NavBarItem } from './components/nav-bar-item/NavBarItem';
import styles from './NavBar.module.css';

export function NavBar() {
  const t = useTranslations('NavBar');

  return (
    <nav className={styles.nav}>
      <ExternalAppLink href="/" className={styles.logoLink}>
        <AcademyLogoFull className={styles.logoIcon} />
      </ExternalAppLink>

      <ul className={styles.list}>
        <li>
          <NavBarItem href="/" icon={LuHouse} label={t('Главная')} external />
        </li>
        <li>
          <NavBarItem
            href="/library"
            icon={LuLayoutGrid}
            label={t('Каталог')}
            external
          />
        </li>
        <li>
          <NavBarItem
            href="/my-courses"
            icon={LuBookOpen}
            label={t('Мои курсы')}
            external
          />
        </li>
      </ul>

      <Divider />

      <ul className={styles.list}>
        <li>
          <NavBarItem
            href="/tasks"
            icon={LuListChecks}
            label={t('Задания')}
            external
          />
        </li>
        <li>
          <NavBarItem
            href="/my-token"
            icon={LuCoins}
            label={t('Мой токен')}
            external
          />
        </li>
        <li>
          <NavBarItem
            href="/referral-program"
            icon={LuUsers}
            label={t('Реферальная программа')}
            external
          />
        </li>
      </ul>

      <Divider />

      <ul className={styles.list}>
        <li>
          <NavBarItem
            href="/guides"
            icon={LuBookMarked}
            label={t('Инструкции')}
          />
        </li>
      </ul>

      <Divider />

      <ul className={styles.list}>
        <li>
          <NavBarItem
            href="/rumi"
            icon={LuSparkles}
            label={t('Course Studio')}
            disabled
            badge={t('Скоро')}
            external
          />
        </li>
      </ul>
    </nav>
  );
}
