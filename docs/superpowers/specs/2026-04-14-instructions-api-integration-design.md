# Интеграция Instructions API

Дата: 2026-04-14
Автор: Kirill Dubasov

## Контекст

Бэкенд выкатил обновлённый API по инструкциям на `https://api.academy-dev.crypton.xyz/api/v1`. До этого фронт работал на моках в `src/shared/api/instructions/mock/`. Нужно подключить реальный API вместо моков.

Документация API: `instructions-api-docs.md` (в Downloads пользователя). Обязательные требования контракта:
- Base URL: `https://api.academy-dev.crypton.xyz/api/v1`
- Все ответы в camelCase
- Локализация через заголовок `Accept-Language: ru | en`
- `timeToRead` — ISO 8601 Duration (`PT5M`)

## Скоуп

**В скоупе:** публичные read-эндпоинты, которые уже используются приложением:
- `GET /instructions` — список + фильтры + категории
- `GET /instructions/{slug}` — детальная страница

**Вне скоупа:** закладки (эндпоинты 3–5, требуют JWT и UI закладок) и админский CRUD (эндпоинты 6–8). Для них — отдельные спеки, когда дойдём.

## Ключевые решения

| Вопрос | Решение |
|---|---|
| Типы | camelCase 1:1 с контрактом бэка (ломаем текущие snake_case типы) |
| Кэширование | Next.js ISR: `revalidate: 60` для списка, `revalidate: 300` для деталки |
| Ошибки | `throw` / `notFound()`; без `error.tsx` и таймаутов в этой итерации |
| Моки | Удалить целиком |
| env | `NEXT_PUBLIC_API_BASE_URL` (доступна и на сервере, и на клиенте на будущее) |
| `generateStaticParams` | Ловим ошибку → `return []`, билд не валим |
| `timeToRead` | Храним как ISO string, форматируем в UI через утилиту |

## Архитектура модуля `src/shared/api/instructions`

```
src/shared/api/instructions/
  index.ts       // публичный фасад (ре-экспорты)
  client.ts      // getInstructions, getInstructionBySlug
  http.ts        // apiFetch(path, init) — базовый хелпер
  types.ts       // типы 1:1 с API
```

### `types.ts` — новые типы (camelCase, 1:1 с API)

```ts
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
  blockType: 'lesson_block' | 'gamified_block' | null;
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

export type TInstructionListResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  categories: TCategory[];
  items: TInstructionListItem[];
};

export type TInstructionListParams = {
  locale: TLocale;
  category?: string;
  sort?: TSortOption;
  q?: string;
  page?: number;
  pageSize?: number;
};

export const DEFAULT_PAGE_SIZE = 12;
export const SUPPORTED_SORTS: readonly TSortOption[] = ['newest', 'popular'] as const;
```

**Что исчезает:** `TCategoryWithSeo`, `TInstructionPageData` (заменяется на `TInstructionDetail`), `TCategorySlug` (просто `string`).

### `http.ts` — хелпер

```ts
type TApiFetchInit = {
  locale: TLocale;
  revalidate?: number;
  query?: Record<string, string | number | undefined>;
};

export const apiFetch = async <T>(
  path: string,
  init: TApiFetchInit,
): Promise<T | null>
```

Обязанности:
- Собирает `process.env.NEXT_PUBLIC_API_BASE_URL + path + ?query`.
- Ставит заголовок `Accept-Language: ${init.locale}`.
- Прокидывает `next: { revalidate: init.revalidate ?? 60 }` в fetch.
- Если `response.status === 404` → `return null`.
- Если `!response.ok` (5xx и др.) → `throw new Error(\`API ${path} failed: ${status}\`)`.
- Парсит JSON и возвращает как `T`.

### `client.ts` — функции

```ts
import 'server-only';

export const getInstructions = async (
  params: TInstructionListParams,
): Promise<TInstructionListResponse> => {
  const { locale, ...rest } = params;
  const response = await apiFetch<TInstructionListResponse>('/instructions', {
    locale,
    revalidate: 60,
    query: {
      page: rest.page,
      pageSize: rest.pageSize,
      category: rest.category,
      sort: rest.sort,
      q: rest.q,
    },
  });
  if (!response) throw new Error('Unexpected 404 on instructions list');
  return response;
};

export const getInstructionBySlug = async (
  slug: string,
  locale: TLocale,
): Promise<TInstructionDetail | null> => {
  const decoded = decodeURIComponent(slug);
  return apiFetch<TInstructionDetail>(`/instructions/${decoded}`, {
    locale,
    revalidate: 300,
  });
};
```

**Что удаляется из клиента:** `getCategories`, `cache()` обёртки, все импорты моков.

## Утилита `shared/lib/duration`

```
src/shared/lib/duration/
  index.ts
  parseIsoDuration.ts    // "PT1H30M" → 90 (минуты)
  formatDuration.ts      // (iso, locale) → "5 мин" / "1 ч 30 мин"
```

- `parseIsoDuration(iso: string): number` — число минут. Поддержка `PT[nH][nM][nS]`. Невалидный формат → `0`.
- `formatDuration(iso: string, locale: TLocale): string`:
  - `ru`: `"5 мин"`, `"1 ч 30 мин"`, `"1 ч"`.
  - `en`: `"5 min"`, `"1 h 30 min"`, `"1 h"`.
  - При `0` минутах → пустая строка.

Юнит-тесты не пишем в этой итерации (в проекте нет vitest/jest). Отмечено как будущая задача.

## Страницы (`app/[locale]/`)

### `instructions/page.tsx`
- `Promise.all([getInstructions(), getCategories()])` → один `getInstructions(parsed)`.
- Категории берём из `response.categories`.
- Проверка `parsed.page > response.totalPages → notFound()` — оставляем.
- `generateMetadata` — без структурных изменений.

### `instructions/[category]/page.tsx`
- Один вызов `getInstructions({ locale, category, ...parsed })`.
- `currentCategory = response.categories.find(c => c.slug === category)`.
- Если `currentCategory` не найден → `notFound()`.

### `instruction/[slug]/page.tsx`
- `getInstructionBySlug(slug, locale)` — без изменений логики, но работает с `TInstructionDetail | null`.
- В `generateMetadata`:
  - `article.cardImage` вместо `article.card_image`.
  - Убираем проверку `.startsWith('http')` — URL всегда абсолютный.
  - Guard на `article.seo === null` → `return { title: article.title }`.
- `generateStaticParams`:
  ```ts
  export const generateStaticParams = async () => {
    const result: { locale: string; slug: string }[] = [];
    for (const locale of routing.locales) {
      try {
        const { items } = await getInstructions({
          locale: locale as TLocale,
          pageSize: 50,
        });
        for (const item of items) result.push({ locale, slug: item.slug });
      } catch (e) {
        console.error(`[generateStaticParams] skipped ${locale}:`, e);
      }
    }
    return result;
  };
  ```

## UI-компоненты

Механические переименования во всех потребителях `TInstructionListItem` / `TInstructionDetail`:

| Было | Стало |
|---|---|
| `card_image` | `cardImage` |
| `border_color` | `borderColor` |
| `views_count` | `viewsCount` |
| `author_name` | `author.name` |
| `author_avatar` | `author.avatar` |
| `read_time: number` | `timeToRead: string` + `formatDuration(...)` в месте отображения |
| `course_id` | `courseId` |
| `lesson_id` | `blockObjectId` / `blockType` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `id: string` | `id: number` (проверить по месту использования) |

**Файлы под правки:**
- `widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx`
- `widgets/instructions-list/ui/InstructionsList.tsx`
- `widgets/instructions-list/model/json-ld.ts`
- `widgets/instruction-view/ui/InstructionView.tsx`
- `widgets/instruction-view/ui/components/hero-section/HeroSection.tsx`
- `widgets/instruction-view/ui/components/metadata-bar/MetadataBar.tsx`
- `widgets/instruction-view/model/json-ld.ts` — `timeRequired: article.timeToRead` (бэк уже даёт ISO).

**Фильтры / поиск / пагинация** (`FiltersBar`, `SearchInput`, `Pagination`) — полей инструкций не касаются, ломаться не должны. Категорию теперь получают как `TCategory[]` (добавились `id` и `seo` — прозрачно).

## Sitemap (`next-sitemap.config.js`)

Переписываем на динамику от API. Запускается на `postbuild` отдельным node-скриптом — `shared/api/instructions/client.ts` использовать нельзя (помечен `server-only`). Дёргаем API напрямую через `fetch`.

**Что в sitemap:**
1. `/` — главная.
2. `/{locale}/instructions` — для `ru`, `en`.
3. `/{locale}/instructions?page=N` — до реального `totalPages` из API.
4. `/{locale}/instructions/{category}` — для каждой категории из `response.categories` (не хардкод `['ai','crypto']`).
5. `/{locale}/instructions/{category}?page=N` — до `totalPages` каждой категории.
6. `/{locale}/instruction/{slug}` — все инструкции, обходим пагинацией `?page=1..N&pageSize=50` пока не кончатся.

**`lastmod` на страницах инструкций** — брать из `item.updatedAt`.

**Fallback.** Если API недоступен при билде — ловим ошибку, логируем, возвращаем только базовые пути (`/{locale}/instructions` × 2). Билд не падает.

**Оценка запросов на `postbuild`:** при ~50 инструкциях на локаль — ~10 запросов. Ок.

**hreflang alternate-ссылки** — отдельная задача на SEO-улучшение, не сейчас.

## env

- `.env`: добавить `NEXT_PUBLIC_API_BASE_URL=https://api.academy-dev.crypton.xyz/api/v1`.
- Создать `.env.example` с тем же ключом (URL дев-бэка как пример).
- README: одна строка — «скопируй `.env.example` в `.env` перед `pnpm dev`».

## Что удаляется

- `src/shared/api/instructions/mock/` — вся папка.
- `getCategories` из `client.ts` и `index.ts`.
- Типы `TCategoryWithSeo`, `TInstructionPageData`.
- Обёртки `cache()` из React в `client.ts`.

## Что НЕ трогаем в этой итерации

- `api/apiList/general.ts`, `api/constants/index.ts` — RTK Query-скаффолд с TODO. Понадобится при работе с закладками/CRUD.
- `store/`, `app/providers.tsx`.
- `shouldNoindex` / `buildCanonical` в `widgets/instructions-list/model/url-state.ts`.
- Хлебные крошки и хедер/футер — только переименования полей, если где-то используют инструкции.

## Порядок имплементации

1. `.env` + `.env.example` + README.
2. `shared/lib/duration/` (`parseIsoDuration`, `formatDuration`, `index.ts`).
3. `shared/api/instructions/types.ts` — новые типы.
4. `shared/api/instructions/http.ts` — `apiFetch`.
5. `shared/api/instructions/client.ts` — `getInstructions`, `getInstructionBySlug`.
6. `shared/api/instructions/index.ts` — обновить ре-экспорты.
7. Удаление `mock/`.
8. Правки виджетов под новые типы.
9. Правки страниц `app/[locale]/instructions/*` и `app/[locale]/instruction/[slug]`.
10. `next-sitemap.config.js` — динамика от API.
11. Ручная проверка: `pnpm dev`, `pnpm pp`, `pnpm build`, содержимое `public/sitemap-0.xml`.

## Критерии готовности

- `pnpm pp` (tsc + eslint + prettier) зелёный.
- `/ru/instructions` и `/en/instructions` рендерят реальные инструкции и реальные категории.
- `/ru/instructions/ai` — фильтрованный список.
- `/ru/instruction/{slug}` — контент статьи; JSON-LD содержит `timeRequired: "PT5M"`, `author.name`, `datePublished = createdAt`, `dateModified = updatedAt`.
- `public/sitemap-0.xml` содержит реальные slugs и категории из API (не хардкод).
- `pnpm build` с недоступным бэком: не падает, в логах видны предупреждения `[generateStaticParams]` / `[sitemap]`.
- В бандле нет ссылок на удалённые моки, нет остаточных `read_time` / `card_image` / `views_count` в коде приложения.

## Риски и предположения

- Предполагается, что дев-бэк `https://api.academy-dev.crypton.xyz/api/v1/instructions` доступен без CORS-ограничений для серверных запросов. CORS на SSR не действует, но проверить при первом `fetch`.
- Предполагается, что `Accept-Language` корректно влияет на `label` категорий и контент.
- Поле `seo` может прийти как `null` — во всех местах использования предусмотреть guard, в `generateMetadata` вернуть минимальный `{ title }`.
- Поле `card_image` от бэка — всегда абсолютный URL с CDN. Если вдруг прилетит относительный — картинка не отрисуется; маловероятно, но при багах бэка заметно сразу.
