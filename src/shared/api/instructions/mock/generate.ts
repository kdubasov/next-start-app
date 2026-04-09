// src/shared/api/instructions/mock/generate.ts

import type {
  TInstructionListItem,
  TCategorySlug,
  TLocale,
} from '../types';

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T,>(rng: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)] as T;

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);

const CATEGORY_PRESETS: Record<
  string,
  { gradient: string; border_color: string }
> = {
  ai: {
    gradient: 'linear-gradient(180deg, #DCEBFB 0%, #2F6BBE 100%)',
    border_color: '#96BFFF',
  },
  crypto: {
    gradient: 'linear-gradient(180deg, #E8DCFB 0%, #7B2FBE 100%)',
    border_color: '#BF96FF',
  },
};

const POOLS: Record<
  TLocale,
  {
    aiTitles: string[];
    cryptoTitles: string[];
    aiExcerpts: string[];
    cryptoExcerpts: string[];
    authors: { name: string; avatar: string }[];
  }
> = {
  ru: {
    aiTitles: [
      'Как настроить Claude Code на проекте',
      'Промпт-инжиниринг для продуктовых задач',
      'RAG на практике: от PDF до ответа',
      'Собираем агентную систему на LangChain',
      'Дообучение LLM: когда это реально нужно',
      'Векторные базы: сравнение и выбор',
      'Оптимизация токенов и стоимости запросов',
      'MCP-серверы: подключение и отладка',
      'Evals для AI-продукта с нуля',
      'Структурированный вывод и function calling',
      'Guardrails и безопасность LLM в продакшене',
      'Claude vs GPT: что выбрать под задачу',
      'Streaming-ответы в Next.js приложении',
      'Мультиагентные паттерны: обзор',
      'Как отлаживать галлюцинации модели',
    ],
    cryptoTitles: [
      'Как настроить Open Claw на сервере',
      'Безопасность в Web3: чек-лист',
      'Мультисиг-кошельки: зачем и как',
      'DEX vs CEX: практическое сравнение',
      'Стейкинг Solana для начинающих',
      'Аудит смарт-контракта: что смотреть',
      'Как читать транзакции в Etherscan',
      'Хранение seed-фразы: лучшие практики',
      'MEV: как не попасть под сэндвич',
      'Бриджи: риски и выбор',
      'NFT-коллекция: запуск с нуля',
      'Токеномика: основы для продактов',
      'Газовые оптимизации в EVM',
      'L2-решения: сравнение Arbitrum, Base, Optimism',
      'Криптокошельки: горячие и холодные',
    ],
    aiExcerpts: [
      'Разбираем конфиг, хуки и настройку под команду.',
      'Шаблоны, антипаттерны и метрики качества промптов.',
      'Полный пайплайн с примерами кода и замерами.',
    ],
    cryptoExcerpts: [
      'Пошаговая инструкция с примерами и подводными камнями.',
      'Практический чек-лист, который экономит деньги и нервы.',
      'Опыт с прод-окружения, а не только теория.',
    ],
    authors: [
      { name: 'Дмитрий Волков', avatar: '/instructions/placeholder.svg' },
      { name: 'Анна Сычёва', avatar: '/instructions/placeholder.svg' },
      { name: 'Алекс Громов', avatar: '/instructions/placeholder.svg' },
      { name: 'Мария Лебедева', avatar: '/instructions/placeholder.svg' },
    ],
  },
  en: {
    aiTitles: [
      'Setting up Claude Code on a project',
      'Prompt engineering for product tasks',
      'RAG in practice: from PDF to answer',
      'Building an agent system with LangChain',
      'Fine-tuning LLMs: when it really pays off',
      'Vector databases: comparison and choice',
      'Optimizing tokens and request cost',
      'MCP servers: wiring and debugging',
      'Evals for an AI product from scratch',
      'Structured output and function calling',
      'Guardrails and LLM safety in production',
      'Claude vs GPT: which to pick per task',
      'Streaming responses in a Next.js app',
      'Multi-agent patterns: an overview',
      'Debugging model hallucinations',
    ],
    cryptoTitles: [
      'Configuring Open Claw on a server',
      'Web3 security: a checklist',
      'Multisig wallets: why and how',
      'DEX vs CEX: a practical comparison',
      'Solana staking for beginners',
      'Smart contract audits: what to look for',
      'Reading Etherscan transactions',
      'Seed phrase storage: best practices',
      'MEV: avoiding sandwich attacks',
      'Bridges: risks and selection',
      'Launching an NFT collection from zero',
      'Tokenomics basics for product managers',
      'Gas optimizations in the EVM',
      'L2s compared: Arbitrum, Base, Optimism',
      'Crypto wallets: hot vs cold',
    ],
    aiExcerpts: [
      'Config, hooks and team-level setup walk-through.',
      'Templates, anti-patterns and prompt quality metrics.',
      'Full pipeline with code samples and measurements.',
    ],
    cryptoExcerpts: [
      'Step-by-step guide with examples and pitfalls.',
      'A practical checklist that saves money and nerves.',
      'Production experience, not just theory.',
    ],
    authors: [
      { name: 'Dmitry Volkov', avatar: '/instructions/placeholder.svg' },
      { name: 'Anna Sycheva', avatar: '/instructions/placeholder.svg' },
      { name: 'Alex Gromov', avatar: '/instructions/placeholder.svg' },
      { name: 'Maria Lebedeva', avatar: '/instructions/placeholder.svg' },
    ],
  },
};

export const generateDataset = (
  locale: TLocale,
  categories: readonly TCategorySlug[],
  count: number,
  seed: number,
): TInstructionListItem[] => {
  const rng = mulberry32(seed);
  const pool = POOLS[locale];
  const now = Date.now();
  const DAY = 86_400_000;

  const items: TInstructionListItem[] = [];
  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length] as TCategorySlug;
    const titles =
      category === 'ai' ? pool.aiTitles : pool.cryptoTitles;
    const excerpts =
      category === 'ai' ? pool.aiExcerpts : pool.cryptoExcerpts;
    const title = `${titles[i % titles.length]} #${i + 1}`;
    const excerpt = pick(rng, excerpts);
    const author = pick(rng, pool.authors);
    const preset = CATEGORY_PRESETS[category] ?? {
      gradient: 'linear-gradient(180deg, #eee 0%, #888 100%)',
      border_color: '#888',
    };
    const createdOffset = Math.floor(rng() * 180) * DAY;
    const created_at = new Date(now - createdOffset).toISOString();
    const updated_at = new Date(
      now - createdOffset + Math.floor(rng() * 10) * DAY,
    ).toISOString();
    const id = `instr-${locale}-${i + 1}`;
    const slug = `${slugify(title)}-${i + 1}`;

    items.push({
      id,
      slug,
      title,
      category,
      gradient: preset.gradient,
      card_image: '/instructions/placeholder.svg',
      border_color: preset.border_color,
      author_name: author.name,
      author_avatar: author.avatar,
      views_count: 50 + Math.floor(rng() * 10_000),
      read_time: 2 + Math.floor(rng() * 14),
      lesson_id: null,
      course_id: null,
      published: true,
      created_at,
      updated_at,
      seo: {
        title: `${title} — Open Academy`,
        description: excerpt,
        keywords: [category, 'open academy', locale === 'ru' ? 'инструкция' : 'guide'],
        ogImageUrl: '/instructions/placeholder.svg',
        canonical: `/${locale}/instructions/${slug}`,
      },
    });
  }
  return items;
};
