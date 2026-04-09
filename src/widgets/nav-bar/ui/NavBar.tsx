'use client';

import Image from 'next/image';

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

import { Link } from '@/i18n/navigation';

import { Divider } from './components/divider/Divider';
import { NavBarItem } from './components/nav-bar-item/NavBarItem';
import styles from './NavBar.module.css';

export function NavBar() {
  const t = useTranslations('NavBar');

  return (
    <nav className={styles.nav}>
      <Link href="/guides" className={styles.logoLink}>
        <Image
          src="/brand/academy-logo-full.svg"
          alt="Open Academy"
          width={175}
          height={40}
          className={styles.logoIcon}
          priority
        />
      </Link>

      <ul className={styles.list}>
        <li>
          <NavBarItem href="/home" icon={LuHouse} label={t('Главная')} />
        </li>
        <li>
          <NavBarItem
            href="/library"
            icon={LuLayoutGrid}
            label={t('Каталог')}
          />
        </li>
        <li>
          <NavBarItem
            href="/my-courses"
            icon={LuBookOpen}
            label={t('Мои курсы')}
          />
        </li>
      </ul>

      <Divider />

      <ul className={styles.list}>
        <li>
          <NavBarItem href="/tasks" icon={LuListChecks} label={t('Задания')} />
        </li>
        <li>
          <NavBarItem href="/my-token" icon={LuCoins} label={t('Мой токен')} />
        </li>
        <li>
          <NavBarItem
            href="/referral-program"
            icon={LuUsers}
            label={t('Реферальная программа')}
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
          />
        </li>
      </ul>
    </nav>
  );
}
