# Instructions API Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Подключить реальный Instructions API (`https://api.academy-dev.crypton.xyz/api/v1`) вместо моков в `src/shared/api/instructions/mock/`, перевести типы на camelCase по контракту бэка и переделать генерацию sitemap под реальные данные.

**Architecture:** SSR на Next.js App Router. Серверный слой в `src/shared/api/instructions/` делает HTTP-запросы через общий хелпер `apiFetch` с `Accept-Language` и Next.js ISR (`revalidate: 60` список / `300` деталь). `timeToRead` хранится как ISO 8601 Duration и форматируется в UI через утилиту `shared/lib/duration`. При недоступном API во время `pnpm build` — `generateStaticParams` и `next-sitemap` не валят билд, а логируют ошибку.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5.9, next-intl, next-sitemap, pnpm. Юнит-раннера в проекте нет — верификация идёт через `pnpm pp` (`tsc --noEmit && eslint && prettier --check`) и ручную проверку страниц в `pnpm dev` / `pnpm build`.

**Связанная спека:** `docs/superpowers/specs/2026-04-14-instructions-api-integration-design.md`.

---

## Замечание по TDD

В спеке зафиксировано: юнит-тесты не пишем — в проекте нет раннера (vitest/jest), только Playwright для e2e, которых под Instructions нет. Вместо TDD-шага «написать падающий тест» используем:
- `pnpm pp` (типы + линт + формат) после каждой задачи.
- Ручную проверку страниц в `pnpm dev`.
- Проверку sitemap после `pnpm build`.

Команды указаны в каждой задаче.

---

## Task 1: env + README

**Files:**
- Create: `.env.example`
- Modify: `.env`
- Modify: `README.md`

- [ ] **Step 1: Создать `.env.example`**

Содержимое `.env.example`:
```
NEXT_PUBLIC_PROD_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://api.academy-dev.crypton.xyz/api/v1
```

- [ ] **Step 2: Добавить переменную в `.env`**

Добавить в `.env` (сохранив существующую строку `NEXT_PUBLIC_PROD_URL=http://localhost:3000`):
```
NEXT_PUBLIC_API_BASE_URL=https://api.academy-dev.crypton.xyz/api/v1
```

- [ ] **Step 3: Обновить README.md — секцию «Getting Started»**

Заменить блок «Getting Started» (строки 3–15 текущего README) на:

```markdown
## Getting Started

Перед первым запуском скопируй `.env.example` в `.env`:

```bash
cp .env.example .env
```

Затем запусти дев-сервер:

```bash
pnpm dev
```

Откроется [http://localhost:3000](http://localhost:3000).
```

- [ ] **Step 4: Проверка**

Run: `cat .env.example && echo '---' && cat .env`
Expected: обе переменные видны, `.env` содержит `NEXT_PUBLIC_API_BASE_URL`.

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md
git commit -m "chore(env): add NEXT_PUBLIC_API_BASE_URL and .env.example"
```

Note: `.env` обычно в `.gitignore` — проверь через `git status`, что `.env` не в staging.

---

## Task 2: Утилита `shared/lib/duration`

**Files:**
- Create: `src/shared/lib/duration/parseIsoDuration.ts`
- Create: `src/shared/lib/duration/formatDuration.ts`
- Create: `src/shared/lib/duration/index.ts`

- [ ] **Step 1: Создать `parseIsoDuration.ts`**

```ts
// src/shared/lib/duration/parseIsoDuration.ts

// Парсит ISO 8601 Duration ("PT1H30M", "PT5M", "PT30S") в число минут.
// Невалидный формат → 0.
export const parseIsoDuration = (iso: string): number => {
  if (typeof iso !== 'string') return 0;
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return 0;
  const [, h, m, s] = match;
  const hours = h ? parseInt(h, 10) : 0;
  const minutes = m ? parseInt(m, 10) : 0;
  const seconds = s ? parseInt(s, 10) : 0;
  const total = hours * 60 + minutes + Math.floor(seconds / 60);
  return total;
};
```

- [ ] **Step 2: Создать `formatDuration.ts`**

```ts
// src/shared/lib/duration/formatDuration.ts
import type { TLocale } from '@/src/shared/api/instructions';

import { parseIsoDuration } from './parseIsoDuration';

export const formatDuration = (iso: string, locale: TLocale): string => {
  const total = parseIsoDuration(iso);
  if (total === 0) return '';

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (locale === 'en') {
    if (hours && minutes) return `${hours} h ${minutes} min`;
    if (hours) return `${hours} h`;
    return `${minutes} min`;
  }

  if (hours && minutes) return `${hours} ч ${minutes} мин`;
  if (hours) return `${hours} ч`;
  return `${minutes} мин`;
};
```

- [ ] **Step 3: Создать `index.ts`**

```ts
// src/shared/lib/duration/index.ts
export { parseIsoDuration } from './parseIsoDuration';
export { formatDuration } from './formatDuration';
```

- [ ] **Step 4: Проверить типы и линт**

Run: `pnpm pp`
Expected: команда проходит без ошибок (tsc + eslint + prettier).

Ожидаемая проблема: `TLocale` ещё не доступен в виде, как его использует `formatDuration` — но он уже существует в `src/shared/api/instructions/types.ts`. Если `pp` выдаёт ошибку про неразрешённый импорт `TLocale` — это сигнал, что Task 3 (обновление types.ts) надо сделать первым. В этом случае вернись сюда после Task 3.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/duration/
git commit -m "feat(lib): add duration utils (parseIsoDuration, formatDuration)"
```

---

## Task 3: Новые типы API (`shared/api/instructions/types.ts`)

**Files:**
- Modify: `src/shared/api/instructions/types.ts` — полный перезапись

- [ ] **Step 1: Перезаписать `types.ts`**

Полное содержимое файла:

```ts
// src/shared/api/instructions/types.ts

export type TLocale = 'ru' | 'en';

export type TSortOption = 'newest' | 'popular';

export type TInstructionAuthor = {
  id: number;
  name: string;
  avatar: string;
};

export type TInstructionSeo = {
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl: string;
} | null;

export type TInstructionBlockType = 'lesson_block' | 'gamified_block';

export type TInstructionListItem = {
  id: number;
  title: string;
  slug: string;
  category: string;
  gradient: string;
  cardImage: string;
  borderColor: string;
  author: TInstructionAuthor;
  viewsCount: number;
  timeToRead: string; // ISO 8601 Duration, например "PT5M"
  courseId: number | null;
  blockObjectId: number | null;
  blockType: TInstructionBlockType | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  seo: TInstructionSeo;
};

export type TInstructionDetail = TInstructionListItem & {
  content: string;
};

export type TCategory = {
  id: number;
  slug: string;
  label: string;
  seo: TInstructionSeo;
};

export type TInstructionListParams = {
  locale: TLocale;
  category?: string;
  sort?: TSortOption;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type TInstructionListResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  categories: TCategory[];
  items: TInstructionListItem[];
};

export const DEFAULT_PAGE_SIZE = 12;
export const SUPPORTED_SORTS: readonly TSortOption[] = [
  'newest',
  'popular',
] as const;
```

- [ ] **Step 2: Проверка**

Run: `pnpm exec tsc --noEmit`
Expected: **ошибок будет много** — все потребители `card_image`/`author_name`/`read_time`/`views_count`/`TCategoryWithSeo`/`TInstructionPageData` упадут. Это ожидаемо, будем чинить задачами 5–11.

Note: коммитить здесь не надо — изменения объединим в одну «API-миграцию» после тасков 3–6.

---

## Task 4: HTTP-хелпер `shared/api/instructions/http.ts`

**Files:**
- Create: `src/shared/api/instructions/http.ts`

- [ ] **Step 1: Создать `http.ts`**

```ts
// src/shared/api/instructions/http.ts
import 'server-only';

import type { TLocale } from './types';

type TQueryValue = string | number | undefined;

type TApiFetchInit = {
  locale: TLocale;
  revalidate?: number;
  query?: Record<string, TQueryValue>;
};

const buildUrl = (path: string, query?: Record<string, TQueryValue>): string => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not set — check .env',
    );
  }

  const url = new URL(base + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
};

export const apiFetch = async <T>(
  path: string,
  init: TApiFetchInit,
): Promise<T | null> => {
  const url = buildUrl(path, init.query);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept-Language': init.locale,
      Accept: 'application/json',
    },
    next: { revalidate: init.revalidate ?? 60 },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `API ${path} failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
};
```

- [ ] **Step 2: Проверка**

Run: `pnpm exec tsc --noEmit src/shared/api/instructions/http.ts`
Expected: без ошибок в этом файле. Общий `tsc --noEmit` всё ещё упадёт на потребителях — это ок.

---

## Task 5: Клиент `shared/api/instructions/client.ts`

**Files:**
- Modify: `src/shared/api/instructions/client.ts` — полный перезапись

- [ ] **Step 1: Перезаписать `client.ts`**

Полное содержимое файла:

```ts
// src/shared/api/instructions/client.ts
import 'server-only';

import { apiFetch } from './http';
import type {
  TInstructionDetail,
  TInstructionListParams,
  TInstructionListResponse,
  TLocale,
} from './types';

export const getInstructions = async (
  params: TInstructionListParams,
): Promise<TInstructionListResponse> => {
  const response = await apiFetch<TInstructionListResponse>('/instructions', {
    locale: params.locale,
    revalidate: 60,
    query: {
      page: params.page,
      pageSize: params.pageSize,
      category: params.category,
      sort: params.sort,
      q: params.q,
    },
  });
  if (!response) {
    throw new Error('Unexpected 404 on GET /instructions');
  }
  return response;
};

export const getInstructionBySlug = async (
  slug: string,
  locale: TLocale,
): Promise<TInstructionDetail | null> => {
  const decoded = decodeURIComponent(slug);
  return apiFetch<TInstructionDetail>(
    `/instructions/${encodeURIComponent(decoded)}`,
    {
      locale,
      revalidate: 300,
    },
  );
};
```

- [ ] **Step 2: Удалить старую `getCategories`**

Убедись, что в `client.ts` после перезаписи нет экспорта `getCategories`, нет импортов моков (`./mock/*`), нет обёрток `cache()`. Если есть — удали.

---

## Task 6: Обновить `shared/api/instructions/index.ts`

**Files:**
- Modify: `src/shared/api/instructions/index.ts` — полный перезапись

- [ ] **Step 1: Перезаписать `index.ts`**

Полное содержимое файла:

```ts
// src/shared/api/instructions/index.ts

export { getInstructions, getInstructionBySlug } from './client';
export type {
  TLocale,
  TSortOption,
  TInstructionAuthor,
  TInstructionSeo,
  TInstructionBlockType,
  TInstructionListItem,
  TInstructionDetail,
  TCategory,
  TInstructionListParams,
  TInstructionListResponse,
} from './types';
export { DEFAULT_PAGE_SIZE, SUPPORTED_SORTS } from './types';
```

Note: `getCategories` и типы `TCategoryWithSeo`, `TInstructionPageData`, `TCategorySlug` больше не экспортируются.

---

## Task 7: Удалить моки

**Files:**
- Delete: `src/shared/api/instructions/mock/` (вся папка: `articles.ts`, `categories.ts`, `dataset.en.ts`, `dataset.ru.ts`, `generate.ts`)

- [ ] **Step 1: Удалить папку моков**

```bash
rm -rf src/shared/api/instructions/mock
```

- [ ] **Step 2: Убедиться, что больше нет импортов из моков**

Run: `grep -r "shared/api/instructions/mock" src app || echo "OK — no mock imports"`
Expected: `OK — no mock imports`.

- [ ] **Step 3: Commit API-слоя целиком (таски 3–7)**

На этом моменте API-слой переделан, но UI ещё не адаптирован — `pnpm pp` будет красным. Коммитим API-слой отдельным коммитом, чтобы история была чистой:

```bash
git add src/shared/api/instructions/ src/shared/lib/duration/
git commit -m "refactor(api): replace mocks with real Instructions API client

- shared/api/instructions/types.ts: types mapped 1:1 to backend contract (camelCase)
- shared/api/instructions/http.ts: apiFetch helper with Accept-Language and ISR
- shared/api/instructions/client.ts: getInstructions, getInstructionBySlug
- shared/api/instructions/mock/ removed
- getCategories removed (categories now come inside list response)
- shared/lib/duration/: ISO 8601 Duration utilities for UI formatting

Spec: docs/superpowers/specs/2026-04-14-instructions-api-integration-design.md"
```

Важно: commit в красном состоянии допустим, потому что следующие задачи в том же PR/ветке приведут проект к зелёному.

---

## Task 8: Виджет `instructions-list` — карточка и список

**Files:**
- Modify: `src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx`
- Modify: `src/widgets/instructions-list/ui/InstructionsList.tsx`
- Modify: `src/widgets/instructions-list/model/json-ld.ts`

- [ ] **Step 1: Обновить `InstructionCard.tsx`**

Полное содержимое файла:

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
      href={`/instruction/${item.slug}`}
      className={styles.card}
      style={{
        background: item.gradient,
        borderColor: `${item.borderColor}25`,
      }}
    >
      <div className={styles.imageWrap}>
        <Image
          src={item.cardImage}
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
            src={item.author.avatar}
            alt={item.author.name}
            width={24}
            height={24}
            className={styles.avatar}
          />
          <span>{item.author.name}</span>
          <span aria-hidden>·</span>
          <span>{item.viewsCount}</span>
        </div>
      </div>
    </Link>
  );
};
```

- [ ] **Step 2: Обновить `InstructionsList.tsx`**

В `src/widgets/instructions-list/ui/InstructionsList.tsx` заменить импорты и тип `categories`/`currentCategory`:

Было (строки 4–9):
```ts
import type {
  TCategoryWithSeo,
  TInstructionListParams,
  TInstructionListResponse,
  TLocale,
} from '@/src/shared/api/instructions';
```

Стало:
```ts
import type {
  TCategory,
  TInstructionListParams,
  TInstructionListResponse,
  TLocale,
} from '@/src/shared/api/instructions';
```

Было (строки 22–23 в типе `TProps`):
```ts
  categories: TCategoryWithSeo[];
  currentCategory: TCategoryWithSeo | undefined;
```

Стало:
```ts
  categories: TCategory[];
  currentCategory: TCategory | undefined;
```

Также поправить использование `currentCategory?.seo.title` / `seo.description`: `seo` теперь nullable. Строки 44–45 заменить на:

Было:
```ts
  const title = currentCategory?.seo.title ?? t('seoTitle');
  const description = currentCategory?.seo.description ?? t('seoDescription');
```

Стало:
```ts
  const title = currentCategory?.seo?.title ?? t('seoTitle');
  const description = currentCategory?.seo?.description ?? t('seoDescription');
```

Остальное в файле остаётся как есть.

- [ ] **Step 3: Обновить `model/json-ld.ts` для списка**

Полное содержимое `src/widgets/instructions-list/model/json-ld.ts`:

```ts
// src/widgets/instructions-list/model/json-ld.ts
import type {
  TCategory,
  TInstructionListResponse,
  TLocale,
} from '@/src/shared/api/instructions';

type TBuildArgs = {
  response: TInstructionListResponse;
  category: TCategory | undefined;
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
        description: item.seo?.description,
        image: absolute(item.cardImage),
        author: {
          '@type': 'Person',
          name: item.author.name,
        },
        datePublished: item.createdAt,
        dateModified: item.updatedAt,
        inLanguage: locale,
      },
    })),
  };

  return [collectionPage, breadcrumbList, itemList];
};
```

- [ ] **Step 4: Проверка**

Run: `pnpm exec tsc --noEmit` (ещё не зелёно — страницы и второй виджет ждут Task 9–11, но эти три файла не должны давать ошибок).

Если в выводе есть ошибки из этих трёх файлов — исправь.

Note: коммит делаем после Task 9 (весь UI-рефакторинг одним коммитом).

---

## Task 9: Виджет `instruction-view` — все компоненты

**Files:**
- Modify: `src/widgets/instruction-view/ui/InstructionView.tsx`
- Modify: `src/widgets/instruction-view/ui/components/hero-section/HeroSection.tsx`
- Modify: `src/widgets/instruction-view/ui/components/metadata-bar/MetadataBar.tsx`
- Modify: `src/widgets/instruction-view/model/json-ld.ts`

- [ ] **Step 1: Обновить `InstructionView.tsx`**

В файле `src/widgets/instruction-view/ui/InstructionView.tsx` — поменять тип `article`:

Было (строки 1–4):
```ts
import type {
  TInstructionPageData,
  TLocale,
} from '@/src/shared/api/instructions';
```

Стало:
```ts
import type {
  TInstructionDetail,
  TLocale,
} from '@/src/shared/api/instructions';
```

Было (строка 15 в `TProps`):
```ts
  article: TInstructionPageData;
```

Стало:
```ts
  article: TInstructionDetail;
```

Остальное в файле без изменений.

- [ ] **Step 2: Обновить `HeroSection.tsx`**

Полное содержимое `src/widgets/instruction-view/ui/components/hero-section/HeroSection.tsx`:

```tsx
import Image from 'next/image';

import type { TInstructionDetail } from '@/src/shared/api/instructions';

import styles from './HeroSection.module.css';

type TProps = {
  article: TInstructionDetail;
};

export const HeroSection = ({ article }: TProps) => {
  return (
    <div className={styles.hero} style={{ background: article.gradient }}>
      <h1 className={styles.title}>{article.title}</h1>
      <div className={styles.imageWrap}>
        <Image
          src={article.cardImage}
          alt={article.title}
          width={200}
          height={200}
          className={styles.image}
          priority
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Обновить `MetadataBar.tsx`**

Полное содержимое `src/widgets/instruction-view/ui/components/metadata-bar/MetadataBar.tsx`:

```tsx
import Image from 'next/image';

import { useLocale, useTranslations } from 'next-intl';

import type {
  TInstructionDetail,
  TLocale,
} from '@/src/shared/api/instructions';
import { formatDuration } from '@/src/shared/lib/duration';

import styles from './MetadataBar.module.css';

type TProps = {
  article: TInstructionDetail;
};

export const MetadataBar = ({ article }: TProps) => {
  const t = useTranslations('Instructions');
  const locale = useLocale() as TLocale;

  const date = new Date(article.createdAt).toLocaleDateString(
    locale === 'en' ? 'en-US' : 'ru-RU',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  );

  const readTimeText = formatDuration(article.timeToRead, locale);

  return (
    <div className={styles.bar}>
      <div className={styles.author}>
        <Image
          src={article.author.avatar}
          alt={article.author.name}
          width={28}
          height={28}
          className={styles.avatar}
        />
        <span className={styles.authorName}>{article.author.name}</span>
      </div>
      <span className={styles.stat}>👁 {article.viewsCount}</span>
      {readTimeText && <span className={styles.stat}>⏱ {readTimeText}</span>}
      <span className={styles.stat}>📅 {date}</span>
    </div>
  );
};
```

Важное замечание: старый код делал `t('мин')` — это лукап в i18n по ключу «мин», и он, скорее всего, нерабочий (или специально выключен). Теперь слово «мин/min» живёт внутри `formatDuration`, строку из переводов не тянем. Если в `messages/ru.json` / `messages/en.json` был ключ `"мин"` — удалять не обязательно (не мешает), но можно прибрать следующим коммитом.

- [ ] **Step 4: Обновить `model/json-ld.ts` для деталки**

Полное содержимое `src/widgets/instruction-view/model/json-ld.ts`:

```ts
// src/widgets/instruction-view/model/json-ld.ts
import type {
  TInstructionDetail,
  TLocale,
} from '@/src/shared/api/instructions';

type TBuildArgs = {
  article: TInstructionDetail;
  locale: TLocale;
  baseUrl: string;
  breadcrumbHomeLabel: string;
  breadcrumbInstructionsLabel: string;
};

export const buildArticleJsonLd = ({
  article,
  locale,
  baseUrl,
  breadcrumbHomeLabel,
  breadcrumbInstructionsLabel,
}: TBuildArgs): Record<string, unknown>[] => {
  const absolute = (path: string): string =>
    path.startsWith('http') ? path : `${baseUrl}${path}`;

  const url = absolute(`/${locale}/instruction/${article.slug}`);

  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: article.title,
    description: article.seo?.description,
    image: absolute(article.cardImage),
    url,
    inLanguage: locale,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    timeRequired: article.timeToRead,
    author: {
      '@type': 'Person',
      name: article.author.name,
    },
  };

  const breadcrumbList: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
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
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: url,
      },
    ],
  };

  return [articleSchema, breadcrumbList];
};
```

Изменения относительно старой версии: `article.author_name` → `article.author.name`, `article.card_image` → `article.cardImage`, `article.created_at/updated_at` → `createdAt/updatedAt`, добавлен `timeRequired: article.timeToRead`, `article.seo.description` защищён `?.` (seo nullable).

- [ ] **Step 5: Проверить типы (по виджетам)**

Run: `pnpm exec tsc --noEmit`
Expected: ошибки остаются ТОЛЬКО в `app/[locale]/instructions/page.tsx`, `app/[locale]/instructions/[category]/page.tsx`, `app/[locale]/instruction/[slug]/page.tsx`. Это ждёт Task 10–11.

Если есть ошибки в виджетах — исправь.

- [ ] **Step 6: Commit UI-части**

```bash
git add src/widgets/
git commit -m "refactor(widgets): adapt instructions widgets to new API types

- Rename fields to camelCase (cardImage, borderColor, viewsCount, author.name, etc.)
- Switch article/list types to TInstructionDetail / TCategory
- Render timeToRead via shared/lib/duration/formatDuration
- JSON-LD: nullable seo guard, timeRequired uses ISO duration as-is"
```

---

## Task 10: Страница `/instructions`

**Files:**
- Modify: `app/[locale]/instructions/page.tsx`

- [ ] **Step 1: Перезаписать page.tsx**

Полное содержимое `app/[locale]/instructions/page.tsx`:

```tsx
// app/[locale]/instructions/page.tsx
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';
import { getInstructions, type TLocale } from '@/src/shared/api/instructions';
import { InstructionsList } from '@/src/widgets/instructions-list';
import {
  buildCanonical,
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
  const response = await getInstructions(parsed);

  if (response.total > 0 && (parsed.page ?? 1) > response.totalPages) {
    notFound();
  }

  const basePath = '/instructions';
  const canonicalPath = `/${locale}${buildCanonical(basePath, parsed)}`;
  const t = await getTranslations({ locale, namespace: 'Instructions' });

  return (
    <InstructionsList
      response={response}
      categories={response.categories}
      currentCategory={undefined}
      params={parsed}
      basePath={basePath}
      canonicalPath={canonicalPath}
      locale={locale}
      baseUrl={BASE_URL}
      breadcrumbs={[
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbInstructions') },
      ]}
    />
  );
}
```

Изменения относительно старой версии: убран импорт `getCategories`, убран `Promise.all`, `categories={response.categories}` берётся из ответа.

- [ ] **Step 2: Проверка**

Run: `pnpm exec tsc --noEmit`
Expected: ошибки ТОЛЬКО в `[category]/page.tsx` и `instruction/[slug]/page.tsx`.

---

## Task 11: Страница `/instructions/[category]`

**Files:**
- Modify: `app/[locale]/instructions/[category]/page.tsx`

- [ ] **Step 1: Перезаписать page.tsx**

Полное содержимое `app/[locale]/instructions/[category]/page.tsx`:

```tsx
// app/[locale]/instructions/[category]/page.tsx
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getInstructions, type TLocale } from '@/src/shared/api/instructions';
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
    try {
      const { categories } = await getInstructions({
        locale: locale as TLocale,
        pageSize: 1,
      });
      for (const c of categories) {
        result.push({ locale, category: c.slug });
      }
    } catch (e) {
      console.error(`[generateStaticParams:category] skipped ${locale}:`, e);
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

  const { categories } = await getInstructions({ locale, pageSize: 1 });
  const cat = categories.find((c) => c.slug === category);
  if (!cat) {
    return { title: t('seoTitle') };
  }

  const parsed = parseSearchParams(sp, locale, category);
  const basePath = `/instructions/${category}`;
  const canonical = `${BASE_URL}/${locale}${buildCanonical(basePath, parsed)}`;
  const page = parsed.page ?? 1;

  const baseTitle = cat.seo?.title ?? t('seoTitle');
  const title =
    page > 1 ? `${baseTitle} — ${t('pageSuffix', { page })}` : baseTitle;
  const description = cat.seo?.description ?? t('seoDescription');

  return {
    title,
    description,
    keywords: cat.seo?.keywords.join(', '),
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
      images: cat.seo?.ogImageUrl
        ? [
            {
              url: cat.seo.ogImageUrl,
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

  const cat = response.categories.find((c) => c.slug === category);
  if (!cat) notFound();

  if (response.total > 0 && (parsed.page ?? 1) > response.totalPages) {
    notFound();
  }

  const basePath = `/instructions/${category}`;
  const canonicalPath = `/${locale}${buildCanonical(basePath, parsed)}`;
  const t = await getTranslations({ locale, namespace: 'Instructions' });

  return (
    <InstructionsList
      response={response}
      categories={response.categories}
      currentCategory={cat}
      params={parsed}
      basePath={basePath}
      canonicalPath={canonicalPath}
      locale={locale}
      baseUrl={BASE_URL}
      breadcrumbs={[
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbInstructions'), href: '/instructions' },
        { label: cat.label },
      ]}
    />
  );
}
```

Ключевые изменения:
- `getCategories` удалён, категории — из `response.categories`.
- `generateStaticParams` обёрнут в `try/catch`.
- В `generateMetadata` — guard на `seo === null` через `?.`.
- OpenGraph image — `cat.seo.ogImageUrl` уже абсолютный URL, `.startsWith('http')` проверка больше не нужна.

- [ ] **Step 2: Проверка**

Run: `pnpm exec tsc --noEmit`
Expected: ошибки ТОЛЬКО в `app/[locale]/instruction/[slug]/page.tsx` — следующая задача.

---

## Task 12: Страница `/instruction/[slug]`

**Files:**
- Modify: `app/[locale]/instruction/[slug]/page.tsx`

- [ ] **Step 1: Перезаписать page.tsx**

Полное содержимое `app/[locale]/instruction/[slug]/page.tsx`:

```tsx
// app/[locale]/instruction/[slug]/page.tsx
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import {
  getInstructionBySlug,
  getInstructions,
  type TLocale,
} from '@/src/shared/api/instructions';
import { InstructionView } from '@/src/widgets/instruction-view';

const BASE_URL = process.env.NEXT_PUBLIC_PROD_URL ?? '';

type TPageProps = {
  params: Promise<{ locale: TLocale; slug: string }>;
};

export const generateStaticParams = async () => {
  const result: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    try {
      const { items } = await getInstructions({
        locale: locale as TLocale,
        pageSize: 50,
      });
      for (const item of items) {
        result.push({ locale, slug: item.slug });
      }
    } catch (e) {
      console.error(`[generateStaticParams:slug] skipped ${locale}:`, e);
    }
  }
  return result;
};

export const generateMetadata = async ({
  params,
}: TPageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  const article = await getInstructionBySlug(slug, locale);
  if (!article) return {};

  const canonical = `${BASE_URL}/${locale}/instruction/${slug}`;

  if (!article.seo) {
    return {
      title: article.title,
      alternates: {
        canonical,
        languages: {
          ru: `${BASE_URL}/ru/instruction/${slug}`,
          en: `${BASE_URL}/en/instruction/${slug}`,
        },
      },
    };
  }

  return {
    title: article.seo.title,
    description: article.seo.description,
    keywords: article.seo.keywords.join(', '),
    alternates: {
      canonical,
      languages: {
        ru: `${BASE_URL}/ru/instruction/${slug}`,
        en: `${BASE_URL}/en/instruction/${slug}`,
      },
    },
    openGraph: {
      title: article.seo.title,
      description: article.seo.description,
      url: canonical,
      type: 'article',
      locale,
      images: [
        {
          url: article.cardImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo.title,
      description: article.seo.description,
    },
  };
};

export default async function InstructionPage({ params }: TPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getInstructionBySlug(slug, locale);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: 'Instructions' });

  return (
    <InstructionView
      article={article}
      locale={locale}
      baseUrl={BASE_URL}
      breadcrumbHomeLabel={t('breadcrumbHome')}
      breadcrumbInstructionsLabel={t('breadcrumbInstructions')}
      breadcrumbs={[
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbInstructions'), href: '/instructions' },
        { label: article.title },
      ]}
    />
  );
}
```

Ключевые изменения:
- `generateStaticParams` обёрнут в `try/catch`, `pageSize: 200` → `50` (лимит API).
- `generateMetadata` обрабатывает `article.seo === null` отдельным ранним возвратом.
- `card_image.startsWith('http') ? ... : baseUrl+path` упрощено — URL всегда абсолютный.

- [ ] **Step 2: Запуск `pnpm pp` — первый раз должно быть зелёно**

Run: `pnpm pp`
Expected: команда проходит без ошибок.

Если остались ошибки — разобраться и починить. Возможные места:
- `i18n/routing.ts` — тип `routing.locales` может быть несовместим с `TLocale` — в этом случае использовать `locale as TLocale`.
- В других местах (`layout.tsx`, `widgets/header`, `widgets/footer`) — если там случайно есть импорты удалённых типов.

- [ ] **Step 3: Commit страниц**

```bash
git add app/
git commit -m "refactor(pages): integrate instructions pages with real API

- List pages: drop getCategories, use response.categories
- Category page: guard on seo === null, dynamic staticParams from API
- Detail page: handle null seo in generateMetadata, try/catch in generateStaticParams"
```

---

## Task 13: Sitemap (`next-sitemap.config.js`)

**Files:**
- Modify: `next-sitemap.config.js` — полный перезапись

- [ ] **Step 1: Перезаписать `next-sitemap.config.js`**

Полное содержимое файла:

```js
/** @type {import('next-sitemap').IConfig} */
// eslint-disable-next-line no-undef
const SITE_URL = process.env.NEXT_PUBLIC_PROD_URL;
// eslint-disable-next-line no-undef
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const LOCALES = ['ru', 'en'];
const PAGE_SIZE = 50;

const fetchListPage = async (locale, page, category) => {
  const url = new URL(`${API_BASE}/instructions`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(PAGE_SIZE));
  if (category) url.searchParams.set('category', category);

  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': locale, Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`sitemap: ${url.toString()} → ${res.status}`);
  }
  return res.json();
};

const collectLocaleData = async (locale) => {
  const first = await fetchListPage(locale, 1);
  const categories = first.categories ?? [];
  const allItems = [...first.items];

  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchListPage(locale, page);
    allItems.push(...next.items);
  }

  const categoryPages = {};
  for (const cat of categories) {
    const firstCat = await fetchListPage(locale, 1, cat.slug);
    categoryPages[cat.slug] = firstCat.totalPages;
  }

  return { categories, items: allItems, categoryPages, totalPages: first.totalPages };
};

// eslint-disable-next-line no-undef
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  transform: async (config, path) => {
    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0 };
    }
    return { loc: path, changefreq: 'daily', priority: 0.7 };
  },
  additionalPaths: async () => {
    const paths = [];

    for (const locale of LOCALES) {
      let data;
      try {
        data = await collectLocaleData(locale);
      } catch (e) {
        // eslint-disable-next-line no-undef, no-console
        console.error(`[sitemap] API unavailable for ${locale}, falling back:`, e);
        paths.push({
          loc: `/${locale}/instructions`,
          changefreq: 'daily',
          priority: 0.8,
        });
        continue;
      }

      paths.push({
        loc: `/${locale}/instructions`,
        changefreq: 'daily',
        priority: 0.8,
      });
      for (let p = 2; p <= data.totalPages; p++) {
        paths.push({
          loc: `/${locale}/instructions?page=${p}`,
          changefreq: 'daily',
          priority: 0.5,
        });
      }

      for (const cat of data.categories) {
        paths.push({
          loc: `/${locale}/instructions/${cat.slug}`,
          changefreq: 'daily',
          priority: 0.8,
        });
        const totalCatPages = data.categoryPages[cat.slug] ?? 1;
        for (let p = 2; p <= totalCatPages; p++) {
          paths.push({
            loc: `/${locale}/instructions/${cat.slug}?page=${p}`,
            changefreq: 'daily',
            priority: 0.5,
          });
        }
      }

      for (const item of data.items) {
        paths.push({
          loc: `/${locale}/instruction/${item.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: item.updatedAt,
        });
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
    additionalSitemaps: [SITE_URL + '/sitemap.xml'],
  },
};
```

- [ ] **Step 2: Тестовый билд**

Run: `pnpm build`
Expected:
- Билд проходит успешно.
- В логах либо список пререндеренных slug, либо предупреждения `[generateStaticParams:slug] skipped ...` / `[sitemap] API unavailable for ...` (если бэк лежит — это ок, билд не падает).
- Файл `public/sitemap-0.xml` создан / обновлён.

Если `[sitemap] API unavailable` появляется, а бэк точно доступен — проверь, что `NEXT_PUBLIC_API_BASE_URL` виден в postbuild-контексте. Если нет: в `package.json` поменять `"postbuild": "next-sitemap"` на `"postbuild": "next-sitemap --config next-sitemap.config.js"`; если не помогло — добавить `require('dotenv').config()` в начало `next-sitemap.config.js` и `dotenv` в `devDependencies`. Это fallback-путь, обычно env-файлы подхватываются из-за того, что `next build` экспортирует их в свой процесс, а pnpm наследует окружение в postbuild.

- [ ] **Step 3: Проверить содержимое sitemap**

Run: `cat public/sitemap-0.xml | head -80`
Expected (если бэк доступен):
- Есть `/ru/instructions`, `/en/instructions`.
- Есть `/ru/instructions/{category}` на реальные категории (не `ai`/`crypto` хардкодом, если бэк их переименует — отразится сразу).
- Есть URL вида `/ru/instruction/{slug}` с `<lastmod>` из `updatedAt`.

Если бэк был недоступен во время билда — в sitemap только базовые пути `/{locale}/instructions`.

- [ ] **Step 4: Commit**

```bash
git add next-sitemap.config.js
git commit -m "build(sitemap): generate from live Instructions API

- Pull categories and instructions via fetch to NEXT_PUBLIC_API_BASE_URL
- Pagination for list + per-category + detail pages
- lastmod from item.updatedAt on instruction pages
- Fallback to minimal paths when API is unreachable at build time"
```

---

## Task 14: Финальная верификация

**Files:** (никаких правок — только ручная проверка)

- [ ] **Step 1: Повторный `pnpm pp`**

Run: `pnpm pp`
Expected: зелёно.

- [ ] **Step 2: Поднять dev и зайти на три страницы**

Run: `pnpm dev`

Открыть в браузере и проверить:

1. `http://localhost:3000/ru/instructions`
   - Список рендерится с реальными данными из API.
   - Категории-кнопки соответствуют тому, что отдаёт бэк.
   - Картинки карточек подгружаются (абсолютные URL с CDN).
   - Имя автора и счётчик просмотров видны.
   - Пагинация работает (если инструкций больше `DEFAULT_PAGE_SIZE`).

2. `http://localhost:3000/ru/instructions/ai` (или любая реальная категория из ответа API)
   - Фильтрованный список.
   - Хлебные крошки `Главная / Инструкции / {label категории}`.
   - В `<head>` — OpenGraph с заголовком и описанием категории (если `seo` не null).

3. Клик по любой инструкции → открывается деталка.
   - Заголовок, hero, автор, viewsCount, `timeToRead` отформатирован («5 мин» / «1 ч 30 мин»).
   - Контент статьи отрендерен.
   - В `<head>` `<script type="application/ld+json">` содержит `timeRequired: "PT5M"`, `author.name`, `datePublished` из `createdAt`.

4. Открыть то же самое на `/en/...` — проверить, что бэк возвращает английские `label` категорий и контент, `formatDuration` отдаёт `"5 min"`.

- [ ] **Step 3: Проверка при билде**

Run: `pnpm build`
Expected:
- Билд успешен.
- В логах виден список пререндеренных слугов (если API доступен).

- [ ] **Step 4: Проверка graceful degradation (опционально)**

Временно подставить неверный URL в `.env`:
```
NEXT_PUBLIC_API_BASE_URL=https://broken.example.invalid/api/v1
```
Run: `pnpm build`
Expected:
- Билд проходит.
- В логах: `[generateStaticParams:...] skipped ...` и `[sitemap] API unavailable ...`.
- `public/sitemap-0.xml` содержит минимум (`/ru/instructions`, `/en/instructions`).

Вернуть правильный URL в `.env` обратно.

- [ ] **Step 5: Убедиться в отсутствии остатков старых полей**

Run: `grep -rn "card_image\|views_count\|author_name\|author_avatar\|read_time\|TCategoryWithSeo\|TInstructionPageData" src app next-sitemap.config.js || echo "OK — no legacy field names"`
Expected: `OK — no legacy field names`.

Если что-то осталось — исправить и закоммитить.

- [ ] **Step 6: Финальный коммит, если были правки в Step 5**

Если grep ничего не нашёл — коммит не нужен, работа закончена.

Если были правки:
```bash
git add .
git commit -m "chore: clean up residual snake_case references"
```

---

## Критерии готовности

- `pnpm pp` (tsc + eslint + prettier) — зелёно.
- `/ru/instructions` и `/en/instructions` отдают реальные данные.
- `/ru/instructions/{category}` фильтрует по категории.
- `/ru/instruction/{slug}` показывает статью, JSON-LD содержит `timeRequired` как ISO Duration.
- `pnpm build` успешен с живым API; `public/sitemap-0.xml` содержит реальные категории и слуги с `<lastmod>`.
- `pnpm build` успешен с недоступным API, `public/sitemap-0.xml` содержит минимум путей, в логах предупреждения.
- В кодбазе нет ссылок на `card_image`, `views_count`, `author_name`, `author_avatar`, `read_time`, `TCategoryWithSeo`, `TInstructionPageData`.
- Папки `src/shared/api/instructions/mock/` нет.
