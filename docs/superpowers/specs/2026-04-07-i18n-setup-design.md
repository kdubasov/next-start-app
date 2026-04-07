# Project Bootstrap: Deps Update + i18n (next-intl)

Date: 2026-04-07

## Goal

Подготовить новый Next.js (App Router) проект к работе:
1. Обновить все зависимости до последних версий.
2. Добавить локализацию через `next-intl` с поддержкой server и client components.
3. Сделать пример работы локализации на главной странице со свитчером языков (ru/en).
4. Запустить и проверить в браузере.

## Stack Decisions

- **Библиотека:** `next-intl` (последняя версия).
- **Локали:** `ru` (default), `en`.
- **Routing:** префикс в URL для всех локалей (`localePrefix: 'always'`) — `/ru/...`, `/en/...`. Лучший SEO, шаринг ссылок.
- **Дефолтная локаль:** `ru` (`/` → редирект на `/ru`).

## Architecture

```
i18n/
  routing.ts        # defineRouting({ locales: ['ru','en'], defaultLocale: 'ru', localePrefix: 'always' })
  navigation.ts     # createNavigation(routing) — typed Link, redirect, usePathname, useRouter
  request.ts        # getRequestConfig — загружает messages по requested locale
messages/
  ru.json
  en.json
middleware.ts       # createMiddleware(routing); matcher исключает /api, /_next, статику
app/
  layout.tsx        # минимальный root layout (или редирект). next-intl требует layout под [locale]
  [locale]/
    layout.tsx      # setRequestLocale(locale), <html lang={locale}>, NextIntlClientProvider, Providers
    page.tsx        # серверный, getTranslations('Home'), рендерит LanguageSwitcher
components/
  LanguageSwitcher.tsx  # 'use client', useLocale + usePathname + useRouter из i18n/navigation
next.config.(js|ts) # обёрнут в createNextIntlPlugin('./i18n/request.ts')
```

## Components

### `i18n/routing.ts`
Экспортирует `routing` от `defineRouting`.

### `i18n/navigation.ts`
Экспортирует `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` от `createNavigation(routing)`.

### `i18n/request.ts`
`getRequestConfig` async: валидирует `requestLocale`, возвращает `{ locale, messages: (await import(\`../messages/\${locale}.json\`)).default }`.

### `middleware.ts`
`export default createMiddleware(routing)` + `config.matcher = ['/((?!api|_next|.*\\..*).*)']`.

### `app/[locale]/layout.tsx`
Серверный. Принимает `params: Promise<{ locale }>`. Валидирует локаль (если не в `routing.locales` → `notFound()`). `setRequestLocale(locale)`. Получает messages через `getMessages()`. Рендерит `<html lang={locale}><body><NextIntlClientProvider messages><Providers>{children}</Providers></NextIntlClientProvider></body></html>`. Также `generateStaticParams` возвращает `routing.locales.map(l => ({locale: l}))`.

### `app/[locale]/page.tsx`
Серверный. `const t = await getTranslations('Home');` рендерит `<h1>{t('title')}</h1>`, `<p>{t('description')}</p>`, `<LanguageSwitcher />`.

### `components/LanguageSwitcher.tsx`
`'use client'`. Использует `useLocale()`, `usePathname()` и `useRouter()` из `i18n/navigation`. Две кнопки RU/EN, активная — disabled. По клику: `router.replace(pathname, { locale: 'en' })`.

### `messages/ru.json` / `messages/en.json`
```
{
  "Home": { "title": "...", "description": "..." },
  "LanguageSwitcher": { "label": "...", "ru": "Русский", "en": "English" }
}
```

## Migration Steps

1. `pnpm update --latest`, `pnpm install`. Прогнать `pnpm pp` и `pnpm build`, починить breaking changes.
2. Установить `next-intl@latest`.
3. Создать `i18n/`, `messages/`, `middleware.ts`.
4. Перенести `app/layout.tsx` и `app/page.tsx` под `app/[locale]/`. Корневой layout нужен в App Router — оставим минимальный пробрасывающий children без `<html>` (next-intl рекомендует размещать `<html>` в `[locale]/layout.tsx`). Если корневой layout мешает, использовать паттерн с `app/[locale]/layout.tsx` как корневым (next-intl docs).
5. Обновить `next.config` через `createNextIntlPlugin`.
6. Создать `LanguageSwitcher`.
7. `pnpm dev` → открыть `http://localhost:3000` → редирект на `/ru` → проверить заголовок на русском → переключить на en → URL `/en`, контент на английском → `pnpm pp`.

## Verification

- `/` редиректит на `/ru`.
- `/ru` показывает русский текст, `/en` — английский.
- Свитчер меняет URL и контент, сохраняя текущий путь.
- `pnpm pp` (tsc + eslint + prettier) проходит.
- `pnpm build` успешен.

## Out of Scope

- Дополнительные локали кроме ru/en.
- Локализация метаданных/SEO (можно добавить позже через `generateMetadata` + `getTranslations`).
- Хранение выбранной локали в cookie (next-intl делает это автоматически через `localeDetection`).
