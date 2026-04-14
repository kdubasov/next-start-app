# Нормализация URL и ссылок под встраивание в learn.open-academy.app

Дата: 2026-04-14
Ветка: `feat/instructions-api-integration`

## Цель

Привести структуру URL и навигационные ссылки к формату основного проекта https://learn.open-academy.app, в который этот проект будет встроен как раздел «Инструкции». После этих изменений URL, canonical, JSON-LD и навигация будут корректны как внутри раздела, так и на переходах в корневые разделы главного проекта.

## Контекст

**Основной проект (learn.open-academy.app):**
- SPA, URL **без** locale-префикса.
- Язык хранится в `localStorage.i18nextLng`.
- Ссылка на инструкции в своём NavBar уже указывает на `/guides`.
- Раздела «инструкции» сейчас нет — этот проект его закрывает.

**Текущий проект:**
- Next.js + next-intl, `localePrefix: 'always'` — URL всегда `/ru/...` или `/en/...`.
- Роуты: `/instructions`, `/instructions/[category]`, `/instruction/[slug]`.
- `NEXT_PUBLIC_PROD_URL` — используется в canonical/OG/JSON-LD.
- Есть собственные `NavBar`, `BottomNav`, `Header`, `Footer` — **остаются** в проекте (дизайн-паритет идёт отдельной спекой).

## Принятые решения

1. Раздел списка — `/guides`, страница категории — `/guides/[category]`, детальная — `/guide/[slug]` (параллельный путь).
2. Locale-префикс **сохраняется** для всех роутов этого проекта (SEO).
3. Корень главного (`/`) и его роуты (`/library`, `/my-courses`, `/tasks`, …) — **без** locale-префикса.
4. Старые пути (`/instructions`, `/instruction/*`) просто удаляются, редиректы не делаем (не проиндексированы).
5. `NEXT_PUBLIC_PROD_URL = https://learn.open-academy.app`.
6. Breadcrumbs «Главная» → абсолютный корень без locale; внутренние крошки — с locale и `/guides`.
7. При смене языка синхронизируем `localStorage.i18nextLng`, чтобы главный проект подхватил выбор.

## Изменения

### 1. Переименование роутов (файловая структура)

- `app/[locale]/instructions/page.tsx` → `app/[locale]/guides/page.tsx`
- `app/[locale]/instructions/[category]/page.tsx` → `app/[locale]/guides/[category]/page.tsx`
- `app/[locale]/instruction/[slug]/page.tsx` → `app/[locale]/guide/[slug]/page.tsx`
- Все импорты и `basePath`/`canonicalPath` внутри страниц обновить с `/instructions` на `/guides`, с `/instruction` на `/guide`.

### 2. Внутренние ссылки в виджетах

Заменить все упоминания старых путей на новые:

- `src/widgets/instructions-list/ui/components/instruction-card/InstructionCard.tsx` — `href={/instruction/${item.slug}}` → `/guide/{slug}`.
- `FiltersBar.tsx`, `SearchInput.tsx`, `Pagination.tsx` — функции `buildHref`/`hrefFor`/`tabHref` работают от `basePath`; `basePath` уже приходит пропсом из page — значит правок внутри не нужно, только в page-компонентах `basePath` станет `/guides`.
- `NavBar.tsx:28`, `NavBar.tsx:82` — `href="/guides"` уже корректен (это внутренний раздел). Проверить, что ссылка идёт через `@/i18n/navigation` (locale-prefixed).

### 3. Разделение ссылок: внутренние vs внешние

Ввести различие:

- **Внутренние** (текущий проект, всегда под `/{locale}/guides`, `/{locale}/guide/*`) — через существующий `Link` из `@/i18n/navigation`.
- **Внешние** (ведут в главный проект, без locale-префикса) — через обычный `next/link` либо `<a>`, чтобы next-intl не добавлял префикс.

Добавить компонент-обёртку:

```
src/shared/ui/external-app-link/ExternalAppLink.tsx
```

Рендерит `next/link` (не `@/i18n/navigation`) с заданным `href` — это гарантирует отсутствие locale-префикса. API:

```
type TProps = {
  href: string;             // '/', '/library', …
  className?: string;
  children: ReactNode;
};
```

Места замены обычного `Link` на `ExternalAppLink`:

- `src/widgets/nav-bar/ui/NavBar.tsx`:
  - `/home` → `/` (логотип и пункт «Главная»).
  - `/library`, `/my-courses`, `/tasks`, `/my-token`, `/referral-program`, `/rumi` — все внешние.
  - `/guides` (пункт «Инструкции») — остаётся внутренним (через `@/i18n/navigation`).
- `src/widgets/bottom-nav/ui/BottomNav.tsx`:
  - В массиве `ITEMS` пометить тип (`external: boolean`) и в `NavBarItem`-подобном компоненте выбирать нужный Link.
- `src/widgets/footer/ui/Footer.tsx`:
  - `/` (логотип) — external.
  - PDF-ссылки (`/docs/privacy-policy.pdf` и т.д.) — external (обычный `<a href>`, можно с `target="_blank"` как в главном).
  - Всё, что `https://…` — остаётся как есть.

### 4. Breadcrumbs

Расширить тип:

```ts
// src/shared/ui/breadcrumbs/Breadcrumbs.tsx
export type TBreadcrumbItem = {
  label: string;
  href?: string;
  external?: boolean; // если true — ссылка без locale-префикса
};
```

В `Breadcrumbs.tsx` при рендере ссылки: `item.external` → `ExternalAppLink` (или `<a>`), иначе — текущий `Link` из `@/i18n/navigation`.

Обновления в page-компонентах:

- `app/[locale]/guides/page.tsx`:
  `[{ label: 'Главная', href: '/', external: true }, { label: 'Инструкции' }]`
- `app/[locale]/guides/[category]/page.tsx`:
  `[{ label: 'Главная', href: '/', external: true }, { label: 'Инструкции', href: '/guides' }, { label: category }]`
- `app/[locale]/guide/[slug]/page.tsx`:
  `[{ label: 'Главная', href: '/', external: true }, { label: 'Инструкции', href: '/guides' }, { label: article.title }]`

### 5. SEO: canonical, OpenGraph, JSON-LD

- `.env.example` и фактический env — `NEXT_PUBLIC_PROD_URL=https://learn.open-academy.app`.
- Canonical в page-компонентах остаётся форматом `${BASE_URL}/${locale}/guides[...]` — т.к. раздел всегда под префиксом.
- OG `url` — такой же формат.
- JSON-LD breadcrumbs (`src/widgets/instruction-view/model/json-ld.ts`, `src/widgets/instructions-list/model/json-ld.ts`):
  - Первая крошка («Главная») — `${BASE_URL}/` (без locale, т.к. главный проект без префикса).
  - Вторая крошка («Инструкции») — `${BASE_URL}/${locale}/guides`.
  - Третья (при наличии) — `${BASE_URL}/${locale}/guides/{category}` или `${BASE_URL}/${locale}/guide/{slug}`.
- Sitemap (`next-sitemap.config.js`): проверить, что генерируются `/ru/guides`, `/en/guides`, `/ru/guide/{slug}`, и т.д. (после переименования роутов next-sitemap подхватит автоматически, но конфиг на всякий случай свериться).

### 6. Смена языка

`src/widgets/header/ui/components/language-select/LanguageSelect.tsx`:

- Перед `router.replace(pathname, { locale })` записать `localStorage.setItem('i18nextLng', locale)` (с защитой `typeof window !== 'undefined'`) — чтобы при уходе пользователя в корневые разделы главного проекта язык сохранился.

### 7. Конфиги

- `i18n/routing.ts` — без изменений (`localePrefix: 'always'`).
- `i18n/navigation.ts` — без изменений.
- `next-sitemap.config.js` — проверить, что `siteUrl` соответствует `NEXT_PUBLIC_PROD_URL`, и что в exclusions/alternates нет захардкоженных `/instructions`.

## Что не трогаем

- Компоненты страниц (рендер, логика) — только ссылки/пути.
- API-клиент (`src/shared/api/instructions`) — без изменений.
- Дизайн `NavBar`, `Header`, `Footer`, `BottomNav` — отдельная спека №2 (дизайн-паритет).
- Авторизация, i18n-словари (только добавим/поправим подписи если понадобится).

## Проверка

- `tsc` без ошибок, ESLint без новых ошибок.
- Навигация: `/ru/guides` → список → клик по карточке → `/ru/guide/{slug}`; breadcrumbs ведут корректно, «Главная» ведёт на `${BASE_URL}/` без префикса.
- Категории: `/ru/guides/{category}` работают, фильтры/поиск/пагинация сохраняют `basePath = /guides`.
- Старые URL `/ru/instructions`, `/ru/instruction/{slug}` — 404.
- Смена языка на странице: URL меняется (`/ru/guides` → `/en/guides`), `localStorage.i18nextLng` обновляется.
- Внешние ссылки NavBar/Footer (`/`, `/library`, …) рендерятся без locale-префикса — проверить через devtools (hover, атрибут `href`).
- Canonical/OG/JSON-LD: в HTML-источнике страниц абсолютные URL на `https://learn.open-academy.app`, breadcrumbs JSON-LD имеет правильные элементы.
- `pnpm postbuild` (генерация sitemap) — в итоговом `public/sitemap.xml` пути с `/guides` и `/guide/`.

## Вне скоупа

- Дизайн/визуальное соответствие NavBar/Header/Footer/BottomNav главному проекту — спека №2.
- Изменения в главном проекте.
- Серверные редиректы для SEO (не нужны — старые пути не проиндексированы).
