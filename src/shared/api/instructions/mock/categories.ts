// src/shared/api/instructions/mock/categories.ts

import type { TCategoryWithSeo, TLocale } from '../types';

export const CATEGORY_SLUGS = ['ai', 'crypto'] as const;

export const CATEGORIES_BY_LOCALE: Record<TLocale, TCategoryWithSeo[]> = {
  ru: [
    {
      slug: 'ai',
      label: 'AI',
      seo: {
        title: 'AI-инструкции — Open Academy',
        description:
          'Гайды по AI, промпт-инжинирингу, LLM-агентам и интеграции ИИ в продукты.',
        keywords: ['ai', 'llm', 'промпты', 'агенты', 'open academy'],
        ogImageUrl: '/instructions/placeholder.svg',
        canonical: '/ru/instructions/ai',
      },
    },
    {
      slug: 'crypto',
      label: 'Крипта',
      seo: {
        title: 'Крипто-инструкции — Open Academy',
        description:
          'Практические гайды по Web3, кошелькам, смарт-контрактам и DeFi.',
        keywords: ['crypto', 'web3', 'кошельки', 'defi', 'open academy'],
        ogImageUrl: '/instructions/placeholder.svg',
        canonical: '/ru/instructions/crypto',
      },
    },
  ],
  en: [
    {
      slug: 'ai',
      label: 'AI',
      seo: {
        title: 'AI guides — Open Academy',
        description:
          'Guides on AI, prompt engineering, LLM agents and shipping AI features.',
        keywords: ['ai', 'llm', 'prompts', 'agents', 'open academy'],
        ogImageUrl: '/instructions/placeholder.svg',
        canonical: '/en/instructions/ai',
      },
    },
    {
      slug: 'crypto',
      label: 'Crypto',
      seo: {
        title: 'Crypto guides — Open Academy',
        description:
          'Practical guides on Web3, wallets, smart contracts and DeFi.',
        keywords: ['crypto', 'web3', 'wallets', 'defi', 'open academy'],
        ogImageUrl: '/instructions/placeholder.svg',
        canonical: '/en/instructions/crypto',
      },
    },
  ],
};
