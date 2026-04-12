# Instruction Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-instruction page at `/{locale}/instruction/{slug}` with SSR markdown rendering, full SEO (metadata + JSON-LD), responsive layout (hero, metadata bar, action bar, content), and mock data.

**Architecture:** Server-first Next.js App Router page. Markdown parsed on the server via unified/remark/rehype pipeline. Single client component for interactive actions (copy link, bookmark). Data layer extends existing mock infrastructure with `TInstructionPageData` type.

**Tech Stack:** Next.js 16, unified + remark-parse + remark-rehype + rehype-stringify, next-intl, CSS Modules, react-toastify, localStorage for bookmarks.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/shared/api/instructions/types.ts` | Add `TInstructionPageData` type |
| Create | `src/shared/api/instructions/mock/articles.ts` | Mock article content (4 articles with markdown) |
| Modify | `src/shared/api/instructions/client.ts` | Add `getInstructionBySlug()` function |
| Modify | `src/shared/api/instructions/index.ts` | Export new function and type |
| Create | `src/widgets/instruction-view/model/markdown.ts` | `parseMarkdown()` — unified pipeline |
| Create | `src/widgets/instruction-view/model/json-ld.ts` | `buildArticleJsonLd()` |
| Create | `src/widgets/instruction-view/ui/components/hero-section/HeroSection.tsx` | Hero gradient + image (server) |
| Create | `src/widgets/instruction-view/ui/components/hero-section/HeroSection.module.css` | Hero styles |
| Create | `src/widgets/instruction-view/ui/components/metadata-bar/MetadataBar.tsx` | Author, views, time, date (server) |
| Create | `src/widgets/instruction-view/ui/components/metadata-bar/MetadataBar.module.css` | Metadata styles |
| Create | `src/widgets/instruction-view/ui/components/action-bar/ActionBar.tsx` | Copy link, bookmark (client) |
| Create | `src/widgets/instruction-view/ui/components/action-bar/ActionBar.module.css` | Action bar styles |
| Create | `src/widgets/instruction-view/ui/components/article-content/ArticleContent.tsx` | Rendered markdown (server) |
| Create | `src/widgets/instruction-view/ui/components/article-content/ArticleContent.module.css` | Prose styles for article |
| Create | `src/widgets/instruction-view/ui/components/back-button/BackButton.tsx` | Link back to instructions (server) |
| Create | `src/widgets/instruction-view/ui/components/back-button/BackButton.module.css` | Back button styles |
| Create | `src/widgets/instruction-view/ui/InstructionView.tsx` | Main widget assembling all sections |
| Create | `src/widgets/instruction-view/ui/InstructionView.module.css` | Widget layout styles |
| Create | `src/widgets/instruction-view/index.ts` | Barrel export |
| Create | `app/[locale]/instruction/[slug]/page.tsx` | Route with generateMetadata + generateStaticParams |
| Modify | `messages/ru.json` | Add article i18n keys to Instructions namespace |
| Modify | `messages/en.json` | Add article i18n keys to Instructions namespace |
| Modify | `next-sitemap.config.js` | Add instruction/{slug} paths |
| Modify | `src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx` | Update link href to `/instruction/{slug}` |

---

### Task 1: Install Markdown Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install unified ecosystem packages**

```bash
pnpm add unified remark-parse remark-rehype rehype-stringify
```

- [ ] **Step 2: Verify installation**

```bash
pnpm list unified remark-parse remark-rehype rehype-stringify
```

Expected: all four packages listed with versions.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add unified/remark/rehype for markdown rendering"
```

---

### Task 2: Add `TInstructionPageData` Type and API Function

**Files:**
- Modify: `src/shared/api/instructions/types.ts`
- Create: `src/shared/api/instructions/mock/articles.ts`
- Modify: `src/shared/api/instructions/client.ts`
- Modify: `src/shared/api/instructions/index.ts`

- [ ] **Step 1: Add `TInstructionPageData` type**

In `src/shared/api/instructions/types.ts`, add after the `TInstructionListItem` type:

```typescript
export type TInstructionPageData = TInstructionListItem & {
  content: string;
};
```

- [ ] **Step 2: Create mock articles data**

Create `src/shared/api/instructions/mock/articles.ts` with 4 articles. Each maps a slug prefix to markdown content. Use slugs from the first 4 items of the generated dataset (category alternates: crypto index 0, ai index 1, crypto index 2, ai index 3).

```typescript
// src/shared/api/instructions/mock/articles.ts

/**
 * Markdown content keyed by slug prefix (the part before the trailing `-N`).
 * getInstructionBySlug matches dataset items to this map.
 * Only 4 articles are mocked; the rest will have no content and return null.
 */
export const ARTICLE_CONTENT: Record<string, string> = {
  'как-настроить-open-claw-на-сервере': `
## Основные угрозы в Web3

Мир Web3 открывает невероятные возможности, но также создаёт новые угрозы для безопасности. В этом разделе мы рассмотрим самые распространённые риски.

### 1. Фишинг и социальная инженерия

Мошенники создают поддельные сайты, имитирующие известные DeFi-платформы. Они рассылают ссылки через Discord, Telegram и Twitter. Всегда проверяйте URL в адресной строке перед подключением кошелька.

**Основные правила:**

- Используйте отдельный кошелёк для взаимодействия с новыми протоколами
- Включите двухфакторную аутентификацию на всех аккаунтах
- Регулярно проверяйте разрешения (approvals) через [Revoke.cash](https://revoke.cash)
- Не переходите по ссылкам из личных сообщений

### 2. Вредоносные смарт-контракты

Перед тем как взаимодействовать с контрактом, убедитесь, что он прошёл аудит. Используйте инструменты вроде **Etherscan** для проверки верифицированного кода контракта.

### 3. Безопасное хранение ключей

Используйте аппаратные кошельки для хранения значительных сумм. Никогда не храните приватные ключи в текстовых файлах или менеджерах паролей.

> Лучшая практика — храните seed-фразу на бумаге в надёжном месте, вдали от электронных устройств.
`,

  'безопасность-в-web3-чек-лист': `
## Полный чек-лист безопасности Web3

Этот чек-лист поможет вам защитить свои активы и избежать распространённых ошибок.

### Базовая безопасность

- Используйте **аппаратный кошелёк** (Ledger, Trezor) для крупных сумм
- Создайте **отдельный горячий кошелёк** для ежедневных операций
- Никогда не делитесь seed-фразой ни с кем
- Включите 2FA на всех биржевых аккаунтах

### Проверка смарт-контрактов

- Проверяйте наличие аудита перед использованием нового протокола
- Используйте **Token Sniffer** для проверки токенов
- Проверяйте approvals регулярно через Revoke.cash

### Безопасность коммуникаций

Мошенники активно используют социальную инженерию. Помните:

1. Команда проекта **никогда** не напишет вам первой в DM
2. Не устанавливайте программы по просьбе незнакомцев
3. Проверяйте официальные каналы проекта через CoinGecko или CoinMarketCap

### Мониторинг

Настройте **уведомления** о транзакциях через сервисы вроде Tenderly или Blocknative. Это поможет быстро обнаружить несанкционированную активность.
`,

  'как-настроить-claude-code-на-проекте': `
## Установка Claude Code

Claude Code — это CLI-инструмент от Anthropic для работы с кодом. Он работает прямо в терминале и понимает контекст вашего проекта.

### Требования

- **Node.js** версии 18 или выше
- Аккаунт Anthropic с доступом к API
- Терминал с поддержкой ANSI-цветов

### Установка

Установите глобально через npm:

- Откройте терминал
- Выполните команду установки через npm
- Проверьте версию после установки

### Настройка проекта

После установки инициализируйте Claude Code в корне проекта. Создайте файл **CLAUDE.md** с описанием проекта:

- Опишите архитектуру проекта
- Укажите используемый стек технологий
- Добавьте правила кодирования

### Полезные команды

- **/init** — инициализация в текущей директории
- **/help** — справка по доступным командам
- **/compact** — сжатие контекста разговора

> Claude Code анализирует структуру проекта автоматически, но CLAUDE.md помогает ему лучше понять специфику вашего кода.
`,

  'промпт-инжиниринг-для-продуктовых-задач': `
## Зачем продакту промпт-инжиниринг

Промпт-инжиниринг — это не только для разработчиков. Продакт-менеджеры могут использовать LLM для ускорения ежедневных задач.

### Основные паттерны

**Chain of Thought (CoT)** — просите модель рассуждать пошагово. Это улучшает качество ответов для аналитических задач.

**Few-shot примеры** — давайте модели 2-3 примера нужного формата ответа перед основным запросом.

**Системный промпт** — задайте роль и контекст в начале разговора.

### Практические применения

1. **Анализ фидбека** — загрузите отзывы пользователей и попросите выделить паттерны
2. **Генерация user stories** — опишите фичу и получите структурированные истории
3. **Конкурентный анализ** — систематизируйте информацию о конкурентах

### Метрики качества промптов

Оценивайте промпты по трём критериям:

- **Релевантность** — ответ соответствует запросу
- **Полнота** — все аспекты покрыты
- **Формат** — ответ в нужной структуре

> Хороший промпт экономит часы работы. Потратьте 10 минут на его доработку, прежде чем отправлять.
`,
};
```

- [ ] **Step 3: Add `getInstructionBySlug` to client**

In `src/shared/api/instructions/client.ts`, add the import and function:

Add to imports at top:

```typescript
import { ARTICLE_CONTENT } from './mock/articles';
import type {
  // ... existing imports
  TInstructionPageData,
} from './types';
```

Add after `getCategories`:

```typescript
export const getInstructionBySlug = cache(
  async (
    slug: string,
    locale: TLocale,
  ): Promise<TInstructionPageData | null> => {
    const dataset = DATASETS[locale];
    const item = dataset.find((i) => i.slug === slug && i.published);
    if (!item) return null;

    const contentKey = Object.keys(ARTICLE_CONTENT).find((key) =>
      slug.startsWith(key),
    );
    if (!contentKey) return null;

    return { ...item, content: ARTICLE_CONTENT[contentKey] };
  },
);
```

- [ ] **Step 4: Update barrel exports**

In `src/shared/api/instructions/index.ts`, add exports:

```typescript
export { getInstructionBySlug } from './client';
export type { TInstructionPageData } from './types';
```

(Add alongside existing exports, keeping `getInstructions`, `getCategories`, and all other existing exports.)

- [ ] **Step 5: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/shared/api/instructions/
git commit -m "feat(instructions): add TInstructionPageData type and getInstructionBySlug API"
```

---

### Task 3: Create Markdown Pipeline

**Files:**
- Create: `src/widgets/instruction-view/model/markdown.ts`

- [ ] **Step 1: Create the markdown parser**

```typescript
// src/widgets/instruction-view/model/markdown.ts
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import 'server-only';

export const parseMarkdown = async (md: string): Promise<string> => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md);

  return String(result);
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/widgets/instruction-view/model/markdown.ts
git commit -m "feat(instructions): add server-side markdown parser with unified"
```

---

### Task 4: Create JSON-LD Builder

**Files:**
- Create: `src/widgets/instruction-view/model/json-ld.ts`

- [ ] **Step 1: Create the JSON-LD builder**

Follow the pattern from `src/widgets/instructions-list/model/json-ld.ts`:

```typescript
// src/widgets/instruction-view/model/json-ld.ts
import type {
  TInstructionPageData,
  TLocale,
} from '@/src/shared/api/instructions';

type TBuildArgs = {
  article: TInstructionPageData;
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
    description: article.seo.description,
    image: absolute(article.card_image),
    url,
    inLanguage: locale,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author_name,
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/widgets/instruction-view/model/json-ld.ts
git commit -m "feat(instructions): add Article JSON-LD builder"
```

---

### Task 5: Create UI Components — BackButton, HeroSection, MetadataBar

**Files:**
- Create: `src/widgets/instruction-view/ui/components/back-button/BackButton.tsx`
- Create: `src/widgets/instruction-view/ui/components/back-button/BackButton.module.css`
- Create: `src/widgets/instruction-view/ui/components/hero-section/HeroSection.tsx`
- Create: `src/widgets/instruction-view/ui/components/hero-section/HeroSection.module.css`
- Create: `src/widgets/instruction-view/ui/components/metadata-bar/MetadataBar.tsx`
- Create: `src/widgets/instruction-view/ui/components/metadata-bar/MetadataBar.module.css`

- [ ] **Step 1: Create BackButton**

```typescript
// src/widgets/instruction-view/ui/components/back-button/BackButton.tsx
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import styles from './BackButton.module.css';

export const BackButton = () => {
  const t = useTranslations('Instructions');
  return (
    <Link href="/instructions" className={styles.back}>
      <span aria-hidden>←</span> {t('К инструкциям')}
    </Link>
  );
};
```

```css
/* src/widgets/instruction-view/ui/components/back-button/BackButton.module.css */

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.back:hover {
  color: var(--text-primary);
}
```

- [ ] **Step 2: Create HeroSection**

```typescript
// src/widgets/instruction-view/ui/components/hero-section/HeroSection.tsx
import Image from 'next/image';

import type { TInstructionPageData } from '@/src/shared/api/instructions';

import styles from './HeroSection.module.css';

type TProps = {
  article: TInstructionPageData;
};

export const HeroSection = ({ article }: TProps) => {
  return (
    <div className={styles.hero} style={{ background: article.gradient }}>
      <h1 className={styles.title}>{article.title}</h1>
      <div className={styles.imageWrap}>
        <Image
          src={article.card_image}
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

```css
/* src/widgets/instruction-view/ui/components/hero-section/HeroSection.module.css */

.hero {
  position: relative;
  display: flex;
  align-items: center;
  height: 220px;
  border-radius: 16px;
  overflow: hidden;
  padding: 24px;
}

.title {
  font-size: 28px;
  font-weight: 500;
  line-height: 1.15;
  color: #fff;
  max-width: 60%;
  margin: 0;
}

.imageWrap {
  position: absolute;
  right: 16px;
  bottom: 0;
  width: 200px;
  height: 200px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 767px) {
  .hero {
    height: 120px;
    border-radius: 12px;
    justify-content: center;
    padding: 16px;
  }

  .title {
    display: none;
  }

  .imageWrap {
    position: static;
    width: 80px;
    height: 80px;
  }
}
```

- [ ] **Step 3: Create MetadataBar**

```typescript
// src/widgets/instruction-view/ui/components/metadata-bar/MetadataBar.tsx
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import type { TInstructionPageData } from '@/src/shared/api/instructions';

import styles from './MetadataBar.module.css';

type TProps = {
  article: TInstructionPageData;
};

export const MetadataBar = ({ article }: TProps) => {
  const t = useTranslations('Instructions');

  const date = new Date(article.created_at).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={styles.bar}>
      <div className={styles.author}>
        <Image
          src={article.author_avatar}
          alt={article.author_name}
          width={28}
          height={28}
          className={styles.avatar}
        />
        <span className={styles.authorName}>{article.author_name}</span>
      </div>
      <span className={styles.stat}>👁 {article.views_count}</span>
      <span className={styles.stat}>
        ⏱ {article.read_time} {t('мин')}
      </span>
      <span className={styles.stat}>📅 {date}</span>
    </div>
  );
};
```

```css
/* src/widgets/instruction-view/ui/components/metadata-bar/MetadataBar.module.css */

.bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-default);
  font-size: 13px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.authorName {
  color: var(--text-primary);
  font-weight: 500;
}

.stat {
  white-space: nowrap;
}

@media (max-width: 767px) {
  .bar {
    gap: 12px;
    font-size: 12px;
    padding: 12px 0;
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/widgets/instruction-view/ui/components/back-button/ src/widgets/instruction-view/ui/components/hero-section/ src/widgets/instruction-view/ui/components/metadata-bar/
git commit -m "feat(instructions): add BackButton, HeroSection, MetadataBar server components"
```

---

### Task 6: Create UI Components — ActionBar (Client) and ArticleContent

**Files:**
- Create: `src/widgets/instruction-view/ui/components/action-bar/ActionBar.tsx`
- Create: `src/widgets/instruction-view/ui/components/action-bar/ActionBar.module.css`
- Create: `src/widgets/instruction-view/ui/components/article-content/ArticleContent.tsx`
- Create: `src/widgets/instruction-view/ui/components/article-content/ArticleContent.module.css`

- [ ] **Step 1: Create ActionBar (client component)**

```typescript
// src/widgets/instruction-view/ui/components/action-bar/ActionBar.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import styles from './ActionBar.module.css';

type TProps = {
  slug: string;
};

const STORAGE_KEY = 'instruction-bookmarks';

const getBookmarks = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export const ActionBar = ({ slug }: TProps) => {
  const t = useTranslations('Instructions');
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(getBookmarks().includes(slug));
  }, [slug]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t('Ссылка скопирована'));
  }, [t]);

  const handleBookmark = useCallback(() => {
    const current = getBookmarks();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setBookmarked(next.includes(slug));
  }, [slug]);

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.btn} onClick={handleCopy}>
        🔗 {t('Копировать ссылку')}
      </button>
      <button type="button" className={styles.btn} onClick={handleBookmark}>
        {bookmarked ? '🔖' : '🔖'} {bookmarked ? t('В закладках') : t('В закладки')}
      </button>
    </div>
  );
};
```

```css
/* src/widgets/instruction-view/ui/components/action-bar/ActionBar.module.css */

.bar {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.btn:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}

@media (max-width: 767px) {
  .bar {
    display: none;
  }
}
```

- [ ] **Step 2: Create ArticleContent (server component)**

```typescript
// src/widgets/instruction-view/ui/components/article-content/ArticleContent.tsx
import { parseMarkdown } from '@/src/widgets/instruction-view/model/markdown';

import styles from './ArticleContent.module.css';

type TProps = {
  content: string;
};

export const ArticleContent = async ({ content }: TProps) => {
  const html = await parseMarkdown(content);
  return (
    <div
      className={styles.prose}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
```

```css
/* src/widgets/instruction-view/ui/components/article-content/ArticleContent.module.css */

.prose {
  max-width: 720px;
  line-height: 1.75;
  color: var(--text-primary);
  font-size: 15px;
}

.prose h2 {
  font-size: 22px;
  font-weight: 500;
  margin-top: 32px;
  margin-bottom: 16px;
  line-height: 1.2;
}

.prose h3 {
  font-size: 18px;
  font-weight: 500;
  margin-top: 24px;
  margin-bottom: 12px;
  line-height: 1.2;
}

.prose p {
  margin-bottom: 16px;
}

.prose ul,
.prose ol {
  padding-left: 24px;
  margin-bottom: 16px;
}

.prose li {
  margin-bottom: 6px;
}

.prose strong {
  font-weight: 600;
}

.prose a {
  color: var(--color-violet-primary);
  text-decoration: underline;
}

.prose a:hover {
  text-decoration: none;
}

.prose blockquote {
  border-left: 3px solid var(--border-default);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 767px) {
  .prose {
    font-size: 14px;
  }

  .prose h2 {
    font-size: 20px;
    margin-top: 24px;
    margin-bottom: 12px;
  }

  .prose h3 {
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 10px;
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/widgets/instruction-view/ui/components/action-bar/ src/widgets/instruction-view/ui/components/article-content/
git commit -m "feat(instructions): add ActionBar client component and ArticleContent server component"
```

---

### Task 7: Assemble InstructionView Widget

**Files:**
- Create: `src/widgets/instruction-view/ui/InstructionView.tsx`
- Create: `src/widgets/instruction-view/ui/InstructionView.module.css`
- Create: `src/widgets/instruction-view/index.ts`

- [ ] **Step 1: Create the main widget**

```typescript
// src/widgets/instruction-view/ui/InstructionView.tsx
import type {
  TInstructionPageData,
  TLocale,
} from '@/src/shared/api/instructions';

import { buildArticleJsonLd } from '../model/json-ld';
import { ActionBar } from './components/action-bar/ActionBar';
import { ArticleContent } from './components/article-content/ArticleContent';
import { BackButton } from './components/back-button/BackButton';
import { HeroSection } from './components/hero-section/HeroSection';
import { MetadataBar } from './components/metadata-bar/MetadataBar';
import styles from './InstructionView.module.css';

type TProps = {
  article: TInstructionPageData;
  locale: TLocale;
  baseUrl: string;
  breadcrumbHomeLabel: string;
  breadcrumbInstructionsLabel: string;
};

export const InstructionView = ({
  article,
  locale,
  baseUrl,
  breadcrumbHomeLabel,
  breadcrumbInstructionsLabel,
}: TProps) => {
  const jsonLd = buildArticleJsonLd({
    article,
    locale,
    baseUrl,
    breadcrumbHomeLabel,
    breadcrumbInstructionsLabel,
  });

  return (
    <article className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Desktop layout */}
      <div className={styles.desktop}>
        <BackButton />
        <HeroSection article={article} />
        <MetadataBar article={article} />
        <ActionBar slug={article.slug} />
        <ArticleContent content={article.content} />
      </div>

      {/* Mobile layout */}
      <div className={styles.mobile}>
        <div className={styles.toolbar}>
          <BackButton />
          <div className={styles.toolbarActions}>
            <ActionBar slug={article.slug} />
          </div>
        </div>
        <h1 className={styles.mobileTitle}>{article.title}</h1>
        <MetadataBar article={article} />
        <HeroSection article={article} />
        <ArticleContent content={article.content} />
      </div>
    </article>
  );
};
```

```css
/* src/widgets/instruction-view/ui/InstructionView.module.css */

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

/* Desktop: show >=768, hide <768 */
.desktop {
  display: block;
}

.mobile {
  display: none;
}

/* Mobile toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-primary);
  padding: 8px 0;
  border-bottom: 1px solid var(--border-default);
}

.toolbarActions {
  display: flex;
  gap: 12px;
}

.mobileTitle {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.15;
  margin: 16px 0 0;
}

@media (max-width: 767px) {
  .page {
    padding: 0 16px 32px;
  }

  .desktop {
    display: none;
  }

  .mobile {
    display: block;
  }
}
```

- [ ] **Step 2: Create barrel export**

```typescript
// src/widgets/instruction-view/index.ts
export { InstructionView } from './ui/InstructionView';
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/widgets/instruction-view/
git commit -m "feat(instructions): add InstructionView widget with layout and barrel export"
```

---

### Task 8: Create Route Page with SEO

**Files:**
- Create: `app/[locale]/instruction/[slug]/page.tsx`

- [ ] **Step 1: Create the page**

Follow the pattern from `app/[locale]/instructions/[category]/page.tsx`:

```typescript
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
    const { items } = await getInstructions({
      locale: locale as TLocale,
      pageSize: 200,
    });
    for (const item of items) {
      result.push({ locale, slug: item.slug });
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
          url: article.card_image.startsWith('http')
            ? article.card_image
            : `${BASE_URL}${article.card_image}`,
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
    />
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/instruction/
git commit -m "feat(instructions): add instruction page route with SSR metadata and JSON-LD"
```

---

### Task 9: Add i18n Keys

**Files:**
- Modify: `messages/ru.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add keys to ru.json**

Add these keys inside the `"Instructions"` object (after the existing `"breadcrumbInstructions"` key):

```json
"К инструкциям": "К инструкциям",
"Копировать ссылку": "Копировать ссылку",
"Ссылка скопирована": "Ссылка скопирована",
"В закладки": "В закладки",
"В закладках": "В закладках",
"мин": "мин"
```

- [ ] **Step 2: Add keys to en.json**

Add these keys inside the `"Instructions"` object (after the existing `"breadcrumbInstructions"` key):

```json
"К инструкциям": "Back to instructions",
"Копировать ссылку": "Copy link",
"Ссылка скопирована": "Link copied",
"В закладки": "Bookmark",
"В закладках": "Bookmarked",
"мин": "min"
```

- [ ] **Step 3: Commit**

```bash
git add messages/ru.json messages/en.json
git commit -m "feat(instructions): add article page i18n keys"
```

---

### Task 10: Update Sitemap and Card Links

**Files:**
- Modify: `next-sitemap.config.js`
- Modify: `src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx`

- [ ] **Step 1: Add instruction pages to sitemap**

In `next-sitemap.config.js`, inside the `additionalPaths` function, add after the category page loops (before `return paths;`):

```javascript
    // Individual instruction pages (only mocked articles with content)
    const articleSlugs = [
      'как-настроить-open-claw-на-сервере',
      'безопасность-в-web3-чек-лист',
      'как-настроить-claude-code-на-проекте',
      'промпт-инжиниринг-для-продуктовых-задач',
    ];
    for (const locale of locales) {
      for (const slug of articleSlugs) {
        // Match generated slugs — they have a trailing `-N` suffix
        paths.push({
          loc: `/${locale}/instruction/${slug}-1`,
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }
```

- [ ] **Step 2: Update InstructionCard link**

In `src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx`, change the `href`:

Old:
```typescript
href={`/instructions/${item.slug}`}
```

New:
```typescript
href={`/instruction/${item.slug}`}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add next-sitemap.config.js src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx
git commit -m "feat(instructions): add article pages to sitemap and fix card links"
```

---

### Task 11: Build Verification and Browser Testing

- [ ] **Step 1: Run full lint and type check**

```bash
pnpm lint && pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: build succeeds, `instruction/[slug]` pages are listed in output.

- [ ] **Step 3: Start dev server and test in browser**

```bash
pnpm dev
```

Open in browser and verify:

1. Navigate to `http://localhost:3000/ru/instructions` — list page loads, cards have links to `/instruction/{slug}`
2. Click on the first card — instruction page loads at `/ru/instruction/{slug}`
3. **Desktop layout check:**
   - Back button `← К инструкциям` is visible and links to `/ru/instructions`
   - Hero section shows gradient background and card image
   - Metadata bar shows author avatar, name, views, read time, date
   - Action buttons (copy link, bookmark) are visible
   - Markdown content renders with proper heading hierarchy, lists, bold, links, blockquotes
4. **Mobile layout check** (resize to <768px):
   - Sticky toolbar at top with back button and action icons
   - Title shown above metadata
   - Compact hero section
   - Content fills width with padding
5. **Copy link** — click copies URL, toast shows "Ссылка скопирована"
6. **Bookmark** — click toggles between "В закладки" / "В закладках", persists on reload
7. **View page source** — verify:
   - `<script type="application/ld+json">` contains Article and BreadcrumbList schemas
   - `<meta>` tags contain proper OG/Twitter data
   - HTML content from markdown is present in source (SSR)
8. **404** — navigate to `/ru/instruction/nonexistent-slug` — should show 404 page
9. **Responsive** — test at 320px, 375px, 768px, 1024px, 1440px widths

- [ ] **Step 4: Fix any issues found during testing**

- [ ] **Step 5: Final commit (if fixes were needed)**

```bash
git add -A
git commit -m "fix(instructions): post-testing fixes for instruction page"
```
