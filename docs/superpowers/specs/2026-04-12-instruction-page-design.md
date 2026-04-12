# Instruction Page (Article View) — Design Spec

## Overview

Страница просмотра отдельной инструкции (статьи). Порт ArticleView из `react/your-project-hub` в Next.js App Router с SSR, SEO-оптимизацией, Markdown-контентом и адаптивным layout.

## URL

`/{locale}/instruction/{slug}`

- `locale` — `ru` | `en`
- `slug` — уникальный slug статьи из моковых данных

## Тип данных

```typescript
export type TInstructionPageData = TInstructionListItem & {
  content: string; // Markdown-контент статьи
};
```

Один источник данных — моковый датасет расширяется записями с `content`. Контент хранится как markdown-строка в моке. Данные на русском языке (en — заглушка или дублирование).

API-функция:

```typescript
getInstructionBySlug(slug: string, locale: TLocale): Promise<TInstructionPageData | null>
```

## Файловая структура

### Роут

```
app/[locale]/instruction/[slug]/page.tsx
```

Серверный компонент:
- `generateMetadata()` — динамические meta-теги
- `generateStaticParams()` — pre-render slug'ов
- Рендерит виджет `InstructionView`

### Виджет

```
src/widgets/instruction-view/
├── ui/
│   ├── InstructionView.tsx          # Основной серверный компонент
│   ├── InstructionView.module.css
│   └── components/
│       ├── hero-section/            # Градиент + card_image (server)
│       ├── metadata-bar/            # Автор, просмотры, время, дата (server)
│       ├── action-bar/              # Копировать ссылку, закладка (client)
│       ├── article-content/         # Рендер markdown → HTML (server)
│       └── back-button/             # Навигация назад (server, <Link>)
└── model/
    ├── json-ld.ts                   # buildArticleJsonLd()
    └── markdown.ts                  # parseMarkdown() — unified pipeline
```

## Layout

### Desktop (>=768px)

1. **Кнопка назад** — текстовая ссылка `← К инструкциям`, ведёт на `/{locale}/instructions`
2. **Hero-секция** — градиентный фон (из поля `gradient`), заголовок слева, `card_image` справа, высота ~220px, скруглённые углы
3. **Metadata bar** — горизонтальная полоса: аватар + имя автора | просмотры | время чтения | дата. Разделена border-bottom
4. **Action bar** — кнопки «Копировать ссылку» и «В закладки»
5. **Контент** — markdown, отрендеренный в HTML, max-width контейнер, prose-стили

### Mobile (<768px)

1. **Sticky toolbar** — sticky top, кнопка назад слева, иконки (копировать, закладка) справа
2. **Заголовок** — крупный текст
3. **Метаданные** — автор (аватар + имя), просмотры, время, дата
4. **Hero** — компактный градиент (~100px) с `card_image` по центру
5. **Контент** — full-width с padding, prose-стили

## Markdown Pipeline

Библиотека: `unified` + `remark` + `rehype`

Цепочка:
```
markdown string → remark-parse → remark-rehype → rehype-stringify → HTML string
```

- Полностью серверная обработка, без клиентского JS
- Результат рендерится через `dangerouslySetInnerHTML` в серверном компоненте
- Стилизация — CSS Module с prose-подобными стилями (CSS variables проекта)
- Расширяемость — в будущем добавляются remark/rehype плагины (подсветка кода, кастомные блоки, GFM и т.д.)

Зависимости:
- `unified`
- `remark-parse`
- `remark-rehype`
- `rehype-stringify`

## SEO

### Metadata (`generateMetadata`)

- `title` — из `seo.title`
- `description` — из `seo.description`
- `keywords` — из `seo.keywords`
- Open Graph: title, description, image (`card_image`), type `"article"`
- Twitter Card: `summary_large_image`
- `hreflang` alternates — ru/en
- `canonical` — `/{locale}/instruction/{slug}`

### JSON-LD микроразметка (`buildArticleJsonLd`)

- `@type: "Article"` — headline, author, datePublished, dateModified, image, description
- `@type: "BreadcrumbList"` — Главная → Инструкции → Название статьи

### Sitemap

Добавить `/{locale}/instruction/{slug}` маршруты в `next-sitemap.config.js`.

## Интерактивные элементы

Единственный клиентский компонент — `action-bar`:

- **Копировать ссылку** — `navigator.clipboard.writeText(window.location.href)`, toast через `react-toastify`
- **Закладка** — toggle, `localStorage` ключ `"instruction-bookmarks"` (массив slug'ов)

Все остальные компоненты — серверные.

## i18n

Ключи в namespace `Instructions` в `messages/ru.json` и `messages/en.json`. Стиль ключей — русские названия:

| Ключ | ru | en |
|------|----|----|
| `К инструкциям` | К инструкциям | Back to instructions |
| `Копировать ссылку` | Копировать ссылку | Copy link |
| `Ссылка скопирована` | Ссылка скопирована | Link copied |
| `В закладки` | В закладки | Bookmark |
| `В закладках` | В закладках | Bookmarked |
| `мин` | мин | min |

## Моковые данные

4 статьи с markdown-контентом на русском, расширяющие существующие записи из датасета. Тематика из исходного проекта:
- Как установить Open Claw (Web3 безопасность)
- Анализ NFT проектов
- Запуск токена
- Настройка TON Wallet

Контент — базовый markdown: заголовки (h2, h3), параграфы, списки, жирный/курсив, ссылки.

## Верификация

1. Страница рендерится на сервере (view source содержит HTML контент)
2. `generateMetadata` возвращает корректные OG/Twitter теги
3. JSON-LD присутствует в `<script type="application/ld+json">`
4. Markdown корректно рендерится в HTML с prose-стилями
5. Desktop layout: hero с градиентом и картинкой, metadata bar, action bar, контент
6. Mobile layout: sticky toolbar, заголовок, метаданные, компактный hero, контент
7. Кнопка «Копировать ссылку» копирует URL и показывает toast
8. Закладка сохраняется/удаляется в localStorage
9. Навигация «К инструкциям» ведёт на `/{locale}/instructions`
10. Несуществующий slug возвращает 404
11. Sitemap содержит instruction страницы
12. Страница адаптивна на всех экранах (320px — 1440px+)
