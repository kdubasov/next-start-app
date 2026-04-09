import type { ReactNode } from 'react';

import Image from 'next/image';

import { getLocale, getTranslations } from 'next-intl/server';
import { FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { LuMessageCircle } from 'react-icons/lu';

import { Link } from '@/i18n/navigation';
import { cn } from '@/src/shared/lib/cn';

import { footerData } from '../model/footer-data';
import styles from './Footer.module.css';

export default async function Footer() {
  const t = await getTranslations('Footer');
  const locale = await getLocale();
  const isRu = locale === 'ru';

  return (
    <footer className={styles.footer}>
      <Link href="/">
        <Image
          src="/brand/academy-logo-full.svg"
          alt="Open Academy"
          width={196}
          height={40}
          className={styles.logo}
        />
      </Link>

      <div className={styles.items}>
        {footerData.map((column) => (
          <div className={styles.column} key={column.title}>
            <span className={styles.title}>{t(column.title)}</span>

            {column.links.map((link, idx) => (
              <FooterLink
                key={idx}
                to={link.link}
                external={link.isExternal}
                disabled={link.soon}
              >
                {t(link.label)}
                {link.soon && (
                  <span className={styles.badge}>{t('Скоро')}</span>
                )}
              </FooterLink>
            ))}
          </div>
        ))}

        <div className={styles.columnSocial}>
          <span className={styles.title}>{t('Мы в соцсетях')}</span>

          <div className={styles.socials}>
            <a
              href={
                isRu
                  ? 'https://t.me/+hPmh_Cfm-XgyZDhi'
                  : 'https://t.me/+eufNwtAoSrZmZjQy'
              }
              target="_blank"
              rel="noreferrer"
              className={styles.socialBtn}
            >
              <LuMessageCircle />
            </a>

            <a
              href={
                isRu ? 'https://t.me/nutsfarm_cis' : 'https://t.me/nutsfarm'
              }
              target="_blank"
              rel="noreferrer"
              className={styles.socialBtn}
            >
              <FaTelegramPlane />
            </a>

            <a
              href="https://x.com/OpenAcademyAI"
              target="_blank"
              rel="noreferrer"
              className={styles.socialBtn}
            >
              <FaXTwitter />
            </a>

            <a
              href="https://www.linkedin.com/company/open-academy-crypton/"
              target="_blank"
              rel="noreferrer"
              className={styles.socialBtn}
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  children,
  to,
  external,
  disabled,
}: {
  children: ReactNode;
  to: string;
  external?: boolean;
  disabled?: boolean;
}) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(styles.link, disabled && styles.disabled)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={to} className={cn(styles.link, disabled && styles.disabled)}>
      {children}
    </Link>
  );
}
