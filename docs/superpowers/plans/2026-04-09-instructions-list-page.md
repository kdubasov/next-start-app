# Instructions List Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the legacy Instructions list page into this Next.js App Router project as a fully SSR, SEO-optimized page with pagination, filters, search, mocked data served through an API-shaped server module, and structured data.

**Architecture:** Server Components do all rendering and data fetching; only interactive controls (sort dropdown, search input, category dropdown on the root page) are Client Components that rebuild URLs and `router.push`. Data comes from a server-only module (`src/shared/api/instructions/client.ts`) that wraps a seeded mock dataset but exposes an API-shaped async signature that will be swapped for a real `fetch` later. Category routes are statically generated via `generateStaticParams`. Metadata, `alternates.languages`, JSON-LD, and sitemap entries are emitted per request/build.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, next-intl 4, CSS Modules, `@radix-ui/react-select`, `next-sitemap` (for sitemap generation).

**Spec reference:** `docs/superpowers/specs/2026-04-09-instructions-list-page-design.md`.

**Project conventions (observed in repo):**
- FSD layout: `src/widgets/<widget>/{ui,model}` and `src/shared/{lib,ui,api}`.
- Import alias `@/` resolves to both repo root and `src/` (see `tsconfig.json`).
- Locale-aware navigation lives in `@/i18n/navigation` (`Link`, `useRouter`, `usePathname`, `redirect`).
- Server Components use `getTranslations`, `getLocale`, `setRequestLocale` from `next-intl/server`.
- Client Components use `useTranslations` from `next-intl`.
- Types declared with `type` use the `T` prefix; interfaces use the `I` prefix.
- Class concatenation uses `cn` from `@/src/shared/lib/cn`.
- Styling: CSS Modules (`*.module.css`).

**Verification:** No unit tests. Final verification uses the `gstack` browser skill against a local `pnpm dev` server (see Task 20).

---

## File Structure

Files to create:

```
messages/ru.json                                                          # extended
messages/en.json                                                          # extended

src/shared/api/instructions/index.ts
src/shared/api/instructions/types.ts
src/shared/api/instructions/client.ts
src/shared/api/instructions/mock/generate.ts
src/shared/api/instructions/mock/categories.ts
src/shared/api/instructions/mock/dataset.ru.ts
src/shared/api/instructions/mock/dataset.en.ts

src/widgets/instructions-list/index.ts
src/widgets/instructions-list/model/url-state.ts
src/widgets/instructions-list/model/json-ld.ts
src/widgets/instructions-list/ui/InstructionsList.tsx
src/widgets/instructions-list/ui/InstructionsList.module.css
src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx
src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.module.css
src/widgets/instructions-list/ui/components/pagination/Pagination.tsx
src/widgets/instructions-list/ui/components/pagination/Pagination.module.css
src/widgets/instructions-list/ui/components/empty-state/EmptyState.tsx
src/widgets/instructions-list/ui/components/empty-state/EmptyState.module.css
src/widgets/instructions-list/ui/components/filters-bar/FiltersBar.tsx
src/widgets/instructions-list/ui/components/filters-bar/FiltersBar.module.css
src/widgets/instructions-list/ui/components/search-input/SearchInput.tsx
src/widgets/instructions-list/ui/components/search-input/SearchInput.module.css

app/[locale]/instructions/page.tsx
app/[locale]/instructions/[category]/page.tsx

public/instructions/placeholder.svg                                       # single generic card image
```

Files to modify:

```
next-sitemap.config.js  — add additionalPaths for all instructions URLs
```

---

### Task 1: Add `Instructions` i18n namespace

**Files:**
- Modify: `messages/ru.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add Russian namespace**

Edit `messages/ru.json`. Add a new top-level key `"Instructions"` alongside the existing namespaces (`Home`, `Header`, `Footer`, `BottomNav`, `NavBar`). Keep valid JSON — add a comma before the new block.

```json
  "Instructions": {
    "pageTitle": "Инструкции",
    "pageSubtitle": "База знаний Open Academy — разборы, гайды и инструкции по AI и крипте",
    "seoTitle": "Инструкции — Open Academy",
    "seoDescription": "Пошаговые инструкции, разборы и гайды по AI и криптовалютам. Обновляется регулярно.",
    "seoKeywords": "инструкции, гайды, ai, crypto, web3, open academy",
    "searchPlaceholder": "Поиск по инструкциям",
    "sortLabel": "Сортировка",
    "sortNewest": "Сначала новые",
    "sortPopular": "Популярные",
    "categoryAll": "Все категории",
    "categoryAllShort": "Все",
    "filterCategoryLabel": "Категория",
    "empty": "Ничего не найдено",
    "emptyHint": "Попробуйте сбросить фильтры или изменить поисковый запрос",
    "minutesRead": "{count} мин чтения",
    "views": "{count} просмотров",
    "pageSuffix": "Страница {page}",
    "paginationLabel": "Пагинация",
    "paginationPrev": "Назад",
    "paginationNext": "Вперёд",
    "breadcrumbHome": "Главная",
    "breadcrumbInstructions": "Инструкции"
  }
```

- [ ] **Step 2: Add English namespace**

Edit `messages/en.json` the same way:

```json
  "Instructions": {
    "pageTitle": "Guides",
    "pageSubtitle": "Open Academy knowledge base — walkthroughs and guides on AI and crypto",
    "seoTitle": "Guides — Open Academy",
    "seoDescription": "Step-by-step guides and walkthroughs for AI and crypto. Updated regularly.",
    "seoKeywords": "guides, walkthroughs, ai, crypto, web3, open academy",
    "searchPlaceholder": "Search guides",
    "sortLabel": "Sort",
    "sortNewest": "Newest first",
    "sortPopular": "Most popular",
    "categoryAll": "All categories",
    "categoryAllShort": "All",
    "filterCategoryLabel": "Category",
    "empty": "Nothing found",
    "emptyHint": "Try clearing filters or changing the search query",
    "minutesRead": "{count} min read",
    "views": "{count} views",
    "pageSuffix": "Page {page}",
    "paginationLabel": "Pagination",
    "paginationPrev": "Previous",
    "paginationNext": "Next",
    "breadcrumbHome": "Home",
    "breadcrumbInstructions": "Guides"
  }
```

- [ ] **Step 3: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/ru.json')); JSON.parse(require('fs').readFileSync('messages/en.json')); console.log('ok')"`
Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add messages/ru.json messages/en.json
git commit -m "feat(instructions): add i18n namespace for Instructions page"
```

---

### Task 2: Placeholder card image

**Files:**
- Create: `public/instructions/placeholder.svg`

- [ ] **Step 1: Create placeholder SVG**

We use a single simple SVG for all card images in the mock so we don't ship binary assets. Categories will still differ via `gradient` and `border_color`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 328 181" role="img" aria-label="Instruction">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="328" height="181" fill="url(#g)"/>
  <circle cx="164" cy="90" r="46" fill="#ffffff" fill-opacity="0.35"/>
  <path d="M146 82 L186 82 L186 110 L146 110 Z" fill="#ffffff" fill-opacity="0.75"/>
</svg>
```

- [ ] **Step 2: Commit**

```bash
git add public/instructions/placeholder.svg
git commit -m "feat(instructions): add placeholder card image"
```

---

### Task 3: Shared types

**Files:**
- Create: `src/shared/api/instructions/types.ts`

- [ ] **Step 1: Write the file**

```ts
// src/shared/api/instructions/types.ts

export type TLocale = 'ru' | 'en';

export type TSortOption = 'newest' | 'popular';

export type TCategorySlug = string;

export type TInstructionSeo = {
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl: string;
  canonical: string;
};

export type TInstructionListItem = {
  id: string;
  slug: string;
  title: string;
  category: TCategorySlug;
  gradient: string;
  card_image: string;
  border_color: string;
  author_name: string;
  author_avatar: string;
  views_count: number;
  read_time: number;
  lesson_id: string | null;
  course_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  seo: TInstructionSeo;
};

export type TInstructionListParams = {
  locale: TLocale;
  category?: TCategorySlug;
  sort?: TSortOption;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type TInstructionListResponse = {
  items: TInstructionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TCategoryWithSeo = {
  slug: TCategorySlug;
  label: string;
  seo: TInstructionSeo;
};

export const DEFAULT_PAGE_SIZE = 12;
export const SUPPORTED_SORTS: readonly TSortOption[] = ['newest', 'popular'] as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/instructions/types.ts
git commit -m "feat(instructions): add shared types for instructions API"
```

---

### Task 4: Mock generator

**Files:**
- Create: `src/shared/api/instructions/mock/generate.ts`

- [ ] **Step 1: Write the file**

Deterministic PRNG (mulberry32) + title/author/excerpt pools. Produces 50 items per locale, distributed across category slugs passed in.

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/instructions/mock/generate.ts
git commit -m "feat(instructions): add deterministic mock dataset generator"
```

---

### Task 5: Mock categories

**Files:**
- Create: `src/shared/api/instructions/mock/categories.ts`

- [ ] **Step 1: Write the file**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/instructions/mock/categories.ts
git commit -m "feat(instructions): add mock categories with per-locale SEO"
```

---

### Task 6: Locale datasets

**Files:**
- Create: `src/shared/api/instructions/mock/dataset.ru.ts`
- Create: `src/shared/api/instructions/mock/dataset.en.ts`

- [ ] **Step 1: Write `dataset.ru.ts`**

```ts
// src/shared/api/instructions/mock/dataset.ru.ts

import { generateDataset } from './generate';
import { CATEGORY_SLUGS } from './categories';

export const DATASET_RU = generateDataset('ru', CATEGORY_SLUGS, 50, 0xA1B2C3);
```

- [ ] **Step 2: Write `dataset.en.ts`**

```ts
// src/shared/api/instructions/mock/dataset.en.ts

import { generateDataset } from './generate';
import { CATEGORY_SLUGS } from './categories';

export const DATASET_EN = generateDataset('en', CATEGORY_SLUGS, 50, 0xA1B2C3);
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/api/instructions/mock/dataset.ru.ts src/shared/api/instructions/mock/dataset.en.ts
git commit -m "feat(instructions): add seeded ru/en datasets"
```

---

### Task 7: Server client and barrel

**Files:**
- Create: `src/shared/api/instructions/client.ts`
- Create: `src/shared/api/instructions/index.ts`

- [ ] **Step 1: Write `client.ts`**

```ts
// src/shared/api/instructions/client.ts
import 'server-only';

import { cache } from 'react';

import type {
  TCategoryWithSeo,
  TInstructionListItem,
  TInstructionListParams,
  TInstructionListResponse,
  TLocale,
} from './types';
import { DEFAULT_PAGE_SIZE } from './types';
import { CATEGORIES_BY_LOCALE } from './mock/categories';
import { DATASET_RU } from './mock/dataset.ru';
import { DATASET_EN } from './mock/dataset.en';

const DATASETS: Record<TLocale, TInstructionListItem[]> = {
  ru: DATASET_RU,
  en: DATASET_EN,
};

const applyFilters = (
  items: TInstructionListItem[],
  params: TInstructionListParams,
): TInstructionListItem[] => {
  let result = items.filter((i) => i.published);
  if (params.category) {
    result = result.filter((i) => i.category === params.category);
  }
  if (params.q && params.q.trim().length > 0) {
    const q = params.q.trim().toLowerCase();
    result = result.filter((i) => i.title.toLowerCase().includes(q));
  }
  return result;
};

const applySort = (
  items: TInstructionListItem[],
  sort: TInstructionListParams['sort'],
): TInstructionListItem[] => {
  const copy = [...items];
  if (sort === 'popular') {
    copy.sort((a, b) => b.views_count - a.views_count);
  } else {
    copy.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  return copy;
};

export const getInstructions = cache(
  async (
    params: TInstructionListParams,
  ): Promise<TInstructionListResponse> => {
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = Math.max(1, params.page ?? 1);

    const dataset = DATASETS[params.locale];
    const filtered = applyFilters(dataset, params);
    const sorted = applySort(filtered, params.sort);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  },
);

export const getCategories = cache(
  async (params: { locale: TLocale }): Promise<TCategoryWithSeo[]> => {
    return CATEGORIES_BY_LOCALE[params.locale];
  },
);
```

- [ ] **Step 2: Write `index.ts`**

```ts
// src/shared/api/instructions/index.ts

export { getInstructions, getCategories } from './client';
export type {
  TLocale,
  TSortOption,
  TCategorySlug,
  TInstructionSeo,
  TInstructionListItem,
  TInstructionListParams,
  TInstructionListResponse,
  TCategoryWithSeo,
} from './types';
export { DEFAULT_PAGE_SIZE, SUPPORTED_SORTS } from './types';
```

- [ ] **Step 3: Install `server-only` if missing**

Run: `pnpm list server-only 2>/dev/null | grep server-only || pnpm add server-only`
Expected: installs (if already present, no change).

- [ ] **Step 4: Commit**

```bash
git add src/shared/api/instructions/client.ts src/shared/api/instructions/index.ts package.json pnpm-lock.yaml
git commit -m "feat(instructions): add server-only API client with React cache"
```

---

### Task 8: URL state helpers

**Files:**
- Create: `src/widgets/instructions-list/model/url-state.ts`

- [ ] **Step 1: Write the file**

```ts
// src/widgets/instructions-list/model/url-state.ts

import type {
  TInstructionListParams,
  TLocale,
  TSortOption,
} from '@/src/shared/api/instructions';
import { SUPPORTED_SORTS } from '@/src/shared/api/instructions';

export type TRawSearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

export const parseSearchParams = (
  sp: TRawSearchParams,
  locale: TLocale,
  category?: string,
): TInstructionListParams => {
  const rawSort = first(sp.sort);
  const sort: TSortOption | undefined = SUPPORTED_SORTS.includes(
    rawSort as TSortOption,
  )
    ? (rawSort as TSortOption)
    : undefined;

  const rawQ = first(sp.q);
  const q = rawQ && rawQ.trim().length > 0 ? rawQ.trim() : undefined;

  const rawPage = first(sp.page);
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : NaN;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return {
    locale,
    category,
    sort,
    q,
    page,
  };
};

export const isExplicitPageOne = (sp: TRawSearchParams): boolean =>
  first(sp.page) === '1';

const queryString = (
  params: Pick<TInstructionListParams, 'sort' | 'q' | 'page'>,
): string => {
  const usp = new URLSearchParams();
  if (params.sort) usp.set('sort', params.sort);
  if (params.q) usp.set('q', params.q);
  if (params.page && params.page > 1) usp.set('page', String(params.page));
  const s = usp.toString();
  return s ? `?${s}` : '';
};

export const buildHref = (
  basePath: string,
  params: Partial<TInstructionListParams>,
): string => {
  return `${basePath}${queryString({
    sort: params.sort,
    q: params.q,
    page: params.page,
  })}`;
};

export const buildCanonical = (
  basePath: string,
  params: TInstructionListParams,
): string => {
  // Canonical strips q, sort, and page=1
  return `${basePath}${queryString({ page: params.page })}`;
};

export const buildPageRange = (
  current: number,
  total: number,
): (number | '…')[] => {
  if (total <= 1) return [1];
  const pages: (number | '…')[] = [];
  const push = (v: number | '…') => pages.push(v);

  const add = (n: number) => {
    if (n >= 1 && n <= total) push(n);
  };

  add(1);
  if (current - 2 > 2) push('…');
  for (let n = Math.max(2, current - 1); n <= Math.min(total - 1, current + 1); n++) {
    add(n);
  }
  if (current + 2 < total - 1) push('…');
  if (total > 1) add(total);
  // Deduplicate consecutive numbers just in case
  return pages.filter((v, i, a) => v !== a[i - 1]);
};

export const shouldNoindex = (params: TInstructionListParams): boolean =>
  Boolean(params.q) || Boolean(params.sort);
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/instructions-list/model/url-state.ts
git commit -m "feat(instructions): add URL state parsing and href builders"
```

---

### Task 9: JSON-LD builder

**Files:**
- Create: `src/widgets/instructions-list/model/json-ld.ts`

- [ ] **Step 1: Write the file**

```ts
// src/widgets/instructions-list/model/json-ld.ts

import type {
  TCategoryWithSeo,
  TInstructionListResponse,
  TLocale,
} from '@/src/shared/api/instructions';

type TBuildArgs = {
  response: TInstructionListResponse;
  category: TCategoryWithSeo | undefined;
  locale: TLocale;
  baseUrl: string;
  canonicalPath: string;
  pageTitle: string;
  pageDescription: string;
  breadcrumbHomeLabel: string;
  breadcrumbInstructionsLabel: string;
  pageSuffixLabel: (page: number) => string;
};

export const buildListJsonLd = ({
  response,
  category,
  locale,
  baseUrl,
  canonicalPath,
  pageTitle,
  pageDescription,
  breadcrumbHomeLabel,
  breadcrumbInstructionsLabel,
  pageSuffixLabel,
}: TBuildArgs): Record<string, unknown>[] => {
  const absolute = (path: string): string =>
    path.startsWith('http') ? path : `${baseUrl}${path}`;

  const url = absolute(canonicalPath);

  const collectionPage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    name: pageTitle,
    description: pageDescription,
    url,
    inLanguage: locale,
  };

  const breadcrumbs: Record<string, unknown>[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: breadcrumbHomeLabel,
      item: absolute(`/${locale}`),
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: breadcrumbInstructionsLabel,
      item: absolute(`/${locale}/instructions`),
    },
  ];
  if (category) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 3,
      name: category.label,
      item: absolute(`/${locale}/instructions/${category.slug}`),
    });
  }
  if (response.page > 1) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: breadcrumbs.length + 1,
      name: pageSuffixLabel(response.page),
      item: url,
    });
  }

  const breadcrumbList: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs,
  };

  const itemList: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: response.items.map((item, idx) => ({
      '@type': 'ListItem',
      position: (response.page - 1) * response.pageSize + idx + 1,
      url: absolute(`/${locale}/instructions/${item.slug}`),
      item: {
        '@type': 'Article',
        headline: item.title,
        description: item.seo.description,
        image: absolute(item.card_image),
        author: {
          '@type': 'Person',
          name: item.author_name,
        },
        datePublished: item.created_at,
        dateModified: item.updated_at,
        inLanguage: locale,
      },
    })),
  };

  return [collectionPage, breadcrumbList, itemList];
};
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/instructions-list/model/json-ld.ts
git commit -m "feat(instructions): add JSON-LD builder for list page"
```

---

### Task 10: InstructionCard (Server Component)

**Files:**
- Create: `src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx`
- Create: `src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.module.css`

- [ ] **Step 1: Write CSS module**

```css
/* InstructionCard.module.css */

.card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  border: 2px solid rgba(255, 255, 255, 0.15);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.imageWrap {
  position: relative;
  width: 100%;
  aspect-ratio: 328 / 181;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 12px;
  flex: 1;
}

.title {
  font-size: 18px;
  line-height: 1.1;
  text-align: center;
  color: #f5efff;
  margin: 0;
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}
```

- [ ] **Step 2: Write component**

```tsx
// InstructionCard.tsx

import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import type { TInstructionListItem } from '@/src/shared/api/instructions';

import styles from './InstructionCard.module.css';

type TProps = {
  item: TInstructionListItem;
};

export const InstructionCard = ({ item }: TProps) => {
  return (
    <Link
      href={`/instructions/${item.slug}`}
      className={styles.card}
      style={{
        background: item.gradient,
        borderColor: `${item.border_color}25`,
      }}
    >
      <div className={styles.imageWrap}>
        <Image
          src={item.card_image}
          alt={item.title}
          width={328}
          height={181}
          className={styles.image}
          loading="lazy"
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles.meta}>
          <Image
            src={item.author_avatar}
            alt={item.author_name}
            width={24}
            height={24}
            className={styles.avatar}
          />
          <span>{item.author_name}</span>
          <span aria-hidden>·</span>
          <span>{item.views_count}</span>
        </div>
      </div>
    </Link>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/widgets/instructions-list/ui/components/instruction-card
git commit -m "feat(instructions): add InstructionCard server component"
```

---

### Task 11: Pagination (Server Component)

**Files:**
- Create: `src/widgets/instructions-list/ui/components/pagination/Pagination.tsx`
- Create: `src/widgets/instructions-list/ui/components/pagination/Pagination.module.css`

- [ ] **Step 1: Write CSS module**

```css
/* Pagination.module.css */

.nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.item {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(127, 127, 127, 0.25);
  background: transparent;
}

.item:hover {
  background: rgba(127, 127, 127, 0.15);
}

.active {
  font-weight: 600;
  background: rgba(127, 127, 127, 0.2);
}

.ellipsis {
  padding: 0 4px;
  opacity: 0.6;
}

.disabled {
  pointer-events: none;
  opacity: 0.4;
}
```

- [ ] **Step 2: Write component**

```tsx
// Pagination.tsx

import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import type { TInstructionListParams } from '@/src/shared/api/instructions';

import { buildHref, buildPageRange } from '../../../model/url-state';
import styles from './Pagination.module.css';

type TProps = {
  basePath: string;
  params: TInstructionListParams;
  totalPages: number;
};

export const Pagination = async ({ basePath, params, totalPages }: TProps) => {
  const t = await getTranslations('Instructions');
  if (totalPages <= 1) return null;

  const current = params.page ?? 1;
  const range = buildPageRange(current, totalPages);

  const hrefFor = (page: number): string =>
    buildHref(basePath, { ...params, page });

  return (
    <nav className={styles.nav} aria-label={t('paginationLabel')}>
      {current > 1 ? (
        <Link
          href={hrefFor(current - 1)}
          className={styles.item}
          rel="prev"
          aria-label={t('paginationPrev')}
        >
          ←
        </Link>
      ) : (
        <span
          className={`${styles.item} ${styles.disabled}`}
          aria-hidden="true"
        >
          ←
        </span>
      )}

      {range.map((entry, idx) =>
        entry === '…' ? (
          <span
            key={`e-${idx}`}
            className={styles.ellipsis}
            aria-hidden="true"
          >
            …
          </span>
        ) : entry === current ? (
          <span
            key={entry}
            className={`${styles.item} ${styles.active}`}
            aria-current="page"
          >
            {entry}
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefFor(entry)}
            className={styles.item}
          >
            {entry}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link
          href={hrefFor(current + 1)}
          className={styles.item}
          rel="next"
          aria-label={t('paginationNext')}
        >
          →
        </Link>
      ) : (
        <span
          className={`${styles.item} ${styles.disabled}`}
          aria-hidden="true"
        >
          →
        </span>
      )}
    </nav>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/widgets/instructions-list/ui/components/pagination
git commit -m "feat(instructions): add Pagination server component"
```

---

### Task 12: EmptyState (Server Component)

**Files:**
- Create: `src/widgets/instructions-list/ui/components/empty-state/EmptyState.tsx`
- Create: `src/widgets/instructions-list/ui/components/empty-state/EmptyState.module.css`

- [ ] **Step 1: Write CSS module**

```css
/* EmptyState.module.css */

.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
  text-align: center;
  gap: 8px;
}

.title {
  font-size: 24px;
  margin: 0;
}

.hint {
  font-size: 14px;
  opacity: 0.7;
  margin: 0;
}
```

- [ ] **Step 2: Write component**

```tsx
// EmptyState.tsx

import { getTranslations } from 'next-intl/server';

import styles from './EmptyState.module.css';

export const EmptyState = async () => {
  const t = await getTranslations('Instructions');
  return (
    <div className={styles.root} data-testid="instructions-empty">
      <h2 className={styles.title}>{t('empty')}</h2>
      <p className={styles.hint}>{t('emptyHint')}</p>
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/widgets/instructions-list/ui/components/empty-state
git commit -m "feat(instructions): add EmptyState server component"
```

---

### Task 13: FiltersBar (Client Component)

**Files:**
- Create: `src/widgets/instructions-list/ui/components/filters-bar/FiltersBar.tsx`
- Create: `src/widgets/instructions-list/ui/components/filters-bar/FiltersBar.module.css`

- [ ] **Step 1: Write CSS module**

```css
/* FiltersBar.module.css */

.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.label {
  font-size: 13px;
  opacity: 0.7;
}

.select {
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(127, 127, 127, 0.3);
  background: transparent;
  color: inherit;
  font: inherit;
}
```

- [ ] **Step 2: Write component**

We use native `<select>` (not Radix) to avoid extra hydration cost for something this simple. It's accessible by default, keyboard-friendly, and fully SSR-compatible.

```tsx
// FiltersBar.tsx
'use client';

import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import type {
  TCategoryWithSeo,
  TInstructionListParams,
  TSortOption,
} from '@/src/shared/api/instructions';

import { buildHref } from '../../../model/url-state';
import styles from './FiltersBar.module.css';

type TProps = {
  params: TInstructionListParams;
  categories: TCategoryWithSeo[];
  currentCategory: string | undefined;
};

export const FiltersBar = ({
  params,
  categories,
  currentCategory,
}: TProps) => {
  const t = useTranslations('Instructions');
  const router = useRouter();
  const pathname = usePathname();

  const onSortChange = (value: string) => {
    const sort =
      value === 'newest' || value === 'popular'
        ? (value as TSortOption)
        : undefined;
    router.push(
      buildHref(pathname, {
        ...params,
        sort,
        page: 1,
      }),
    );
  };

  const onCategoryChange = (value: string) => {
    // "All" → root instructions page; otherwise navigate to /instructions/[slug]
    if (!value) {
      router.push(
        buildHref('/instructions', {
          sort: params.sort,
          q: params.q,
          page: 1,
        }),
      );
    } else {
      router.push(
        buildHref(`/instructions/${value}`, {
          sort: params.sort,
          q: params.q,
          page: 1,
        }),
      );
    }
  };

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="instructions-category">
          {t('filterCategoryLabel')}
        </label>
        <select
          id="instructions-category"
          className={styles.select}
          value={currentCategory ?? ''}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">{t('categoryAll')}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="instructions-sort">
          {t('sortLabel')}
        </label>
        <select
          id="instructions-sort"
          className={styles.select}
          value={params.sort ?? 'newest'}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="newest">{t('sortNewest')}</option>
          <option value="popular">{t('sortPopular')}</option>
        </select>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/widgets/instructions-list/ui/components/filters-bar
git commit -m "feat(instructions): add FiltersBar client component"
```

---

### Task 14: SearchInput (Client Component)

**Files:**
- Create: `src/widgets/instructions-list/ui/components/search-input/SearchInput.tsx`
- Create: `src/widgets/instructions-list/ui/components/search-input/SearchInput.module.css`

- [ ] **Step 1: Write CSS module**

```css
/* SearchInput.module.css */

.form {
  display: flex;
  margin-bottom: 16px;
}

.input {
  flex: 1;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(127, 127, 127, 0.3);
  background: transparent;
  color: inherit;
  font: inherit;
}

.input:focus {
  outline: 2px solid rgba(127, 127, 127, 0.5);
  outline-offset: 1px;
}
```

- [ ] **Step 2: Write component**

```tsx
// SearchInput.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import type { TInstructionListParams } from '@/src/shared/api/instructions';

import { buildHref } from '../../../model/url-state';
import styles from './SearchInput.module.css';

type TProps = {
  params: TInstructionListParams;
};

export const SearchInput = ({ params }: TProps) => {
  const t = useTranslations('Instructions');
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(params.q ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when URL changes externally
  useEffect(() => {
    setValue(params.q ?? '');
  }, [params.q]);

  const pushQuery = (next: string) => {
    const trimmed = next.trim();
    router.push(
      buildHref(pathname, {
        ...params,
        q: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
    );
  };

  const onChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushQuery(next), 300);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    pushQuery(value);
  };

  return (
    <form className={styles.form} role="search" onSubmit={onSubmit}>
      <input
        className={styles.input}
        type="search"
        placeholder={t('searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('searchPlaceholder')}
      />
    </form>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/widgets/instructions-list/ui/components/search-input
git commit -m "feat(instructions): add SearchInput client component"
```

---

### Task 15: InstructionsList aggregator + widget barrel

**Files:**
- Create: `src/widgets/instructions-list/ui/InstructionsList.tsx`
- Create: `src/widgets/instructions-list/ui/InstructionsList.module.css`
- Create: `src/widgets/instructions-list/index.ts`

- [ ] **Step 1: Write CSS module**

```css
/* InstructionsList.module.css */

.root {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 16px 64px;
}

.header {
  margin-bottom: 24px;
}

.title {
  font-size: 32px;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 15px;
  opacity: 0.7;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
```

- [ ] **Step 2: Write component**

```tsx
// InstructionsList.tsx

import { getTranslations } from 'next-intl/server';

import type {
  TCategoryWithSeo,
  TInstructionListParams,
  TInstructionListResponse,
  TLocale,
} from '@/src/shared/api/instructions';

import { buildListJsonLd } from '../model/json-ld';
import { EmptyState } from './components/empty-state/EmptyState';
import { FiltersBar } from './components/filters-bar/FiltersBar';
import { InstructionCard } from './components/instruction-card/InstructionCard';
import { Pagination } from './components/pagination/Pagination';
import { SearchInput } from './components/search-input/SearchInput';
import styles from './InstructionsList.module.css';

type TProps = {
  response: TInstructionListResponse;
  categories: TCategoryWithSeo[];
  currentCategory: TCategoryWithSeo | undefined;
  params: TInstructionListParams;
  basePath: string;
  canonicalPath: string;
  locale: TLocale;
  baseUrl: string;
};

export const InstructionsList = async ({
  response,
  categories,
  currentCategory,
  params,
  basePath,
  canonicalPath,
  locale,
  baseUrl,
}: TProps) => {
  const t = await getTranslations('Instructions');
  const title = currentCategory?.seo.title ?? t('seoTitle');
  const description =
    currentCategory?.seo.description ?? t('seoDescription');

  const jsonLd = buildListJsonLd({
    response,
    category: currentCategory,
    locale,
    baseUrl,
    canonicalPath,
    pageTitle: title,
    pageDescription: description,
    breadcrumbHomeLabel: t('breadcrumbHome'),
    breadcrumbInstructionsLabel: t('breadcrumbInstructions'),
    pageSuffixLabel: (page) => t('pageSuffix', { page }),
  });

  return (
    <section className={styles.root} data-testid="instructions-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className={styles.header}>
        <h1 className={styles.title}>
          {currentCategory?.label ?? t('pageTitle')}
        </h1>
        <p className={styles.subtitle}>{description}</p>
      </header>

      <FiltersBar
        params={params}
        categories={categories}
        currentCategory={currentCategory?.slug}
      />
      <SearchInput params={params} />

      {response.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={styles.grid}>
          {response.items.map((item) => (
            <InstructionCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <Pagination
        basePath={basePath}
        params={params}
        totalPages={response.totalPages}
      />
    </section>
  );
};
```

- [ ] **Step 3: Write widget barrel**

```ts
// src/widgets/instructions-list/index.ts

export { InstructionsList } from './ui/InstructionsList';
```

- [ ] **Step 4: Commit**

```bash
git add src/widgets/instructions-list/ui/InstructionsList.tsx src/widgets/instructions-list/ui/InstructionsList.module.css src/widgets/instructions-list/index.ts
git commit -m "feat(instructions): add InstructionsList aggregator and barrel"
```

---

### Task 16: Root route `app/[locale]/instructions/page.tsx`

**Files:**
- Create: `app/[locale]/instructions/page.tsx`

- [ ] **Step 1: Write the file**

```tsx
// app/[locale]/instructions/page.tsx

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { redirect } from '@/i18n/navigation';
import {
  getCategories,
  getInstructions,
  type TLocale,
} from '@/src/shared/api/instructions';
import { InstructionsList } from '@/src/widgets/instructions-list';
import {
  buildCanonical,
  buildHref,
  isExplicitPageOne,
  parseSearchParams,
  shouldNoindex,
} from '@/src/widgets/instructions-list/model/url-state';

const BASE_URL = process.env.NEXT_PUBLIC_PROD_URL ?? '';

type TPageProps = {
  params: Promise<{ locale: TLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: TPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Instructions' });

  const parsed = parseSearchParams(sp, locale);
  const basePath = '/instructions';
  const canonical = `${BASE_URL}/${locale}${buildCanonical(basePath, parsed)}`;
  const page = parsed.page ?? 1;

  const baseTitle = t('seoTitle');
  const title =
    page > 1 ? `${baseTitle} — ${t('pageSuffix', { page })}` : baseTitle;
  const description = t('seoDescription');

  return {
    title,
    description,
    keywords: t('seoKeywords'),
    alternates: {
      canonical,
      languages: {
        ru: `${BASE_URL}/ru${buildCanonical(basePath, { ...parsed, locale: 'ru' })}`,
        en: `${BASE_URL}/en${buildCanonical(basePath, { ...parsed, locale: 'en' })}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: !shouldNoindex(parsed),
      follow: true,
    },
  };
};

export default async function InstructionsPage({
  params,
  searchParams,
}: TPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  // Canonicalize ?page=1 → /instructions
  if (isExplicitPageOne(sp)) {
    const clean = { ...sp };
    delete clean.page;
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(clean)) {
      if (typeof v === 'string') qs.set(k, v);
    }
    const s = qs.toString();
    redirect({
      href: `/instructions${s ? `?${s}` : ''}`,
      locale,
    });
  }

  const parsed = parseSearchParams(sp, locale);
  const [response, categories] = await Promise.all([
    getInstructions(parsed),
    getCategories({ locale }),
  ]);

  if (response.total > 0 && (parsed.page ?? 1) > response.totalPages) {
    notFound();
  }

  const basePath = '/instructions';
  const canonicalPath = `/${locale}${buildCanonical(basePath, parsed)}`;

  return (
    <InstructionsList
      response={response}
      categories={categories}
      currentCategory={undefined}
      params={parsed}
      basePath={basePath}
      canonicalPath={canonicalPath}
      locale={locale}
      baseUrl={BASE_URL}
    />
  );
}
```

- [ ] **Step 2: Verify type check passes**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/instructions/page.tsx
git commit -m "feat(instructions): add root Instructions page with SSR metadata"
```

---

### Task 17: Category route `app/[locale]/instructions/[category]/page.tsx`

**Files:**
- Create: `app/[locale]/instructions/[category]/page.tsx`

- [ ] **Step 1: Write the file**

```tsx
// app/[locale]/instructions/[category]/page.tsx

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import {
  getCategories,
  getInstructions,
  type TLocale,
} from '@/src/shared/api/instructions';
import { InstructionsList } from '@/src/widgets/instructions-list';
import {
  buildCanonical,
  isExplicitPageOne,
  parseSearchParams,
  shouldNoindex,
} from '@/src/widgets/instructions-list/model/url-state';

const BASE_URL = process.env.NEXT_PUBLIC_PROD_URL ?? '';

type TPageProps = {
  params: Promise<{ locale: TLocale; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateStaticParams = async () => {
  const result: { locale: string; category: string }[] = [];
  for (const locale of routing.locales) {
    const cats = await getCategories({ locale: locale as TLocale });
    for (const c of cats) {
      result.push({ locale, category: c.slug });
    }
  }
  return result;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: TPageProps): Promise<Metadata> => {
  const { locale, category } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Instructions' });
  const categories = await getCategories({ locale });
  const cat = categories.find((c) => c.slug === category);
  if (!cat) {
    return { title: t('seoTitle') };
  }

  const parsed = parseSearchParams(sp, locale, category);
  const basePath = `/instructions/${category}`;
  const canonical = `${BASE_URL}/${locale}${buildCanonical(basePath, parsed)}`;
  const page = parsed.page ?? 1;

  const baseTitle = cat.seo.title;
  const title =
    page > 1 ? `${baseTitle} — ${t('pageSuffix', { page })}` : baseTitle;
  const description = cat.seo.description;

  return {
    title,
    description,
    keywords: cat.seo.keywords.join(', '),
    alternates: {
      canonical,
      languages: {
        ru: `${BASE_URL}/ru${buildCanonical(basePath, { ...parsed, locale: 'ru' })}`,
        en: `${BASE_URL}/en${buildCanonical(basePath, { ...parsed, locale: 'en' })}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale,
      images: cat.seo.ogImageUrl
        ? [
            {
              url: cat.seo.ogImageUrl.startsWith('http')
                ? cat.seo.ogImageUrl
                : `${BASE_URL}${cat.seo.ogImageUrl}`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: !shouldNoindex(parsed),
      follow: true,
    },
  };
};

export default async function InstructionsCategoryPage({
  params,
  searchParams,
}: TPageProps) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const categories = await getCategories({ locale });
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  if (isExplicitPageOne(sp)) {
    const clean = { ...sp };
    delete clean.page;
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(clean)) {
      if (typeof v === 'string') qs.set(k, v);
    }
    const s = qs.toString();
    redirect({
      href: `/instructions/${category}${s ? `?${s}` : ''}`,
      locale,
    });
  }

  const parsed = parseSearchParams(sp, locale, category);
  const response = await getInstructions(parsed);

  if (response.total > 0 && (parsed.page ?? 1) > response.totalPages) {
    notFound();
  }

  const basePath = `/instructions/${category}`;
  const canonicalPath = `/${locale}${buildCanonical(basePath, parsed)}`;

  return (
    <InstructionsList
      response={response}
      categories={categories}
      currentCategory={cat}
      params={parsed}
      basePath={basePath}
      canonicalPath={canonicalPath}
      locale={locale}
      baseUrl={BASE_URL}
    />
  );
}
```

- [ ] **Step 2: Verify type check passes**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/instructions/[category]/page.tsx"
git commit -m "feat(instructions): add category Instructions page with static params"
```

---

### Task 18: Extend `next-sitemap` config

**Files:**
- Modify: `next-sitemap.config.js`

- [ ] **Step 1: Read current config**

Confirm the current config is the one shown in the plan context (siteUrl, transform, robotsTxtOptions).

- [ ] **Step 2: Add `additionalPaths`**

Add an `additionalPaths` function that enumerates instructions URLs for all locales × categories × pagination pages. Because the mock datasets live inside TypeScript modules, the sitemap config (plain JS) can't import them directly. Instead, hard-code the category slugs (they match `src/shared/api/instructions/mock/categories.ts`) and a conservative upper bound for pagination derived from 50 items / 12 per page = 5 pages.

Replace `next-sitemap.config.js` with:

```js
/** @type {import('next-sitemap').IConfig} */
// eslint-disable-next-line
module.exports = {
  // eslint-disable-next-line no-undef
  siteUrl: process.env.NEXT_PUBLIC_PROD_URL,
  generateRobotsTxt: true,
  transform: async (config, path) => {
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
      };
    }

    return {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
    };
  },
  additionalPaths: async (config) => {
    const locales = ['ru', 'en'];
    const categories = ['ai', 'crypto'];
    const maxPages = 5;
    const paths = [];
    for (const locale of locales) {
      paths.push({ loc: `/${locale}/instructions`, changefreq: 'daily', priority: 0.8 });
      for (let p = 2; p <= maxPages; p++) {
        paths.push({
          loc: `/${locale}/instructions?page=${p}`,
          changefreq: 'daily',
          priority: 0.5,
        });
      }
      for (const cat of categories) {
        paths.push({
          loc: `/${locale}/instructions/${cat}`,
          changefreq: 'daily',
          priority: 0.8,
        });
        for (let p = 2; p <= maxPages; p++) {
          paths.push({
            loc: `/${locale}/instructions/${cat}?page=${p}`,
            changefreq: 'daily',
            priority: 0.5,
          });
        }
      }
    }
    return paths;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/*?utm_*',
          '/*?etext*',
          '/*?code*',
          '/*?yprqee*',
          '/*?_ym_debug*',
        ],
      },
    ],
    // eslint-disable-next-line no-undef
    additionalSitemaps: [process.env.NEXT_PUBLIC_PROD_URL + '/sitemap.xml'],
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add next-sitemap.config.js
git commit -m "feat(instructions): include instructions URLs in sitemap"
```

---

### Task 19: Lint and type-check the whole project

**Files:** none (verification only)

- [ ] **Step 1: Run the project's `pp` script**

Run: `pnpm pp`
Expected: `tsc --noEmit` passes, `eslint .` passes, `prettier --check` passes. Fix any complaints inline (most likely: unused imports, sort-imports order, import paths). If prettier reports format issues, run `pnpm format:write` and re-run `pnpm pp`.

- [ ] **Step 2: Commit any formatting fixes**

```bash
git add -u
git commit -m "chore(instructions): format after pp run" || echo "nothing to commit"
```

---

### Task 20: Browser verification via `gstack`

**Files:** none (verification only)

- [ ] **Step 1: Start dev server in background**

Run (background): `pnpm dev`
Expected: server listening on `http://localhost:3000` (check logs).

- [ ] **Step 2: Invoke the `gstack` skill**

Use the `Skill` tool with `skill: "gstack"` and give it the following verification script. It must navigate, inspect `view-source` / DOM / HTTP status, and report pass/fail per scenario.

> Verification brief for gstack:
> Start URL: `http://localhost:3000`
>
> 1. `GET /ru/instructions` → expect status 200; page contains an `<h1>` with text "Инструкции"; DOM contains 12 elements matching `[data-testid="instructions-page"] a[href*="/instructions/"]`; `<head>` contains `<link rel="canonical" href$="/ru/instructions">`.
> 2. `GET /ru/instructions/ai?page=2` → status 200; `<link rel="canonical" href$="/ru/instructions/ai?page=2">`; at most 12 cards; `rel="prev"` link on page; title suffix contains "Страница 2".
> 3. `GET /ru/instructions?page=1` → expect redirect (status 307/308) ending at `/ru/instructions`.
> 4. `GET /ru/instructions/unknown-category` → status 404.
> 5. `GET /ru/instructions?page=99` → status 404.
> 6. `GET /ru/instructions?q=foo` → status 200; `<head>` contains `<meta name="robots" content="noindex, follow">` (or equivalent `noindex`).
> 7. `view-source:http://localhost:3000/ru/instructions` → raw HTML contains all 12 card titles (no JS needed to render them).
> 8. `view-source:http://localhost:3000/ru/instructions` → contains `"@type":"CollectionPage"`, `"@type":"BreadcrumbList"`, and `"@type":"ItemList"` inside a `<script type="application/ld+json">` block.
> 9. `GET /en/instructions` → status 200; `<h1>` contains "Guides"; `<head>` contains a hreflang entry for `ru` pointing to the matching `/ru/instructions` URL.
> 10. Run Lighthouse SEO audit (mobile preset) on `/ru/instructions` and `/ru/instructions/ai`. Expect SEO score ≥ 95. (If `gstack` does not expose Lighthouse directly, run `pnpm lighthouse` against these two URLs instead.)
>
> Report pass/fail per item with a one-line reason.

- [ ] **Step 3: Fix any failures**

For each failing scenario, diagnose via DOM snapshot or server logs, fix the underlying code, re-run the specific scenario. Do not mark the task complete until all 10 pass.

- [ ] **Step 4: Stop the dev server**

- [ ] **Step 5: Final commit if any fixes were made**

```bash
git add -u
git commit -m "fix(instructions): address browser verification findings" || echo "nothing to commit"
```

---

## Self-Review Notes

- Spec §1 scope: every bullet is covered by a task (i18n T1, data layer T3–T7, url-state T8, json-ld T9, UI T10–T15, routes T16–T17, sitemap T18, verification T20).
- Spec §2 URL rules: §5.1/§5.2 redirect-on-`page=1`, `notFound()` on invalid page or category — implemented in T16/T17.
- Spec §3 file layout: matches the File Structure section at the top of this plan.
- Spec §4 types and generator: T3, T4, T5, T6, T7.
- Spec §5 UI: T10–T15. Server/client boundaries respected (`InstructionCard`, `Pagination`, `EmptyState`, `InstructionsList` are Server; `FiltersBar`, `SearchInput` are `'use client'`).
- Spec §6 metadata: `generateMetadata` in T16 and T17 produces canonical, languages, OG, Twitter, robots, and page-suffixed titles.
- Spec §7 JSON-LD: T9 builds `CollectionPage` + `BreadcrumbList` + `ItemList`; T15 renders it inside `<script type="application/ld+json">`.
- Spec §8 sitemap: T18 extends `next-sitemap.config.js`. Robots rules already permit crawling of query strings (verified against current config).
- Spec §9 i18n: T1 adds the `Instructions` namespace to both locales.
- Spec §10 naming: all new types use `T` prefix; no interfaces introduced; no `I` prefix needed.
- Spec §11 verification: T20 walks all 10 scenarios via `gstack`.
- Spec §12 acceptance: T19 enforces lint/type-check, T20 enforces all scenarios; no `"use client"` in list/card/pagination files (verified by code in T10–T12, T15); `server-only` import in `client.ts` prevents accidental client leakage; `T*`/`I*` convention enforced throughout; legacy React project is untouched.

No placeholders. All type names consistent across tasks: `TInstructionListItem`, `TInstructionListResponse`, `TInstructionListParams`, `TCategoryWithSeo`, `TSortOption`, `TLocale`, `TCategorySlug`, `TInstructionSeo`. Helper names consistent: `parseSearchParams`, `buildHref`, `buildCanonical`, `buildPageRange`, `shouldNoindex`, `isExplicitPageOne`, `getInstructions`, `getCategories`, `buildListJsonLd`, `generateDataset`.
