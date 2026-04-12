# Breadcrumbs — Design Spec

## Overview

Добавить визуальные хлебные крошки на страницу списка инструкций, страницу категории и страницу статьи. Удалить компонент BackButton. Хлебные крошки оптимизированы для SEO (семантичная разметка `<nav>` + `<ol>`).

## Компонент

Переиспользуемый серверный компонент в shared-слое:

```
src/shared/ui/breadcrumbs/
├── Breadcrumbs.tsx
├── Breadcrumbs.module.css
└── index.ts
```

### Props

```typescript
type TBreadcrumbItem = {
  label: string;
  href?: string; // если нет — текущая страница (последний элемент)
};

type TProps = {
  items: TBreadcrumbItem[];
};
```

### HTML-разметка

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><Link href="/...">Главная</Link></li>
    <li><Link href="/...">Инструкции</Link></li>
    <li><span aria-current="page">Название</span></li>
  </ol>
</nav>
```

Разделитель `/` — через CSS `li + li::before`, не в DOM.

### Стили

- font-size: 13px
- Ссылки: цвет `--text-secondary`, hover → `--text-primary`
- Текущая страница: `--text-primary`, без ссылки
- Разделитель: `/`, цвет `--text-secondary`, opacity 0.5
- `flex-wrap: wrap` для мобильных

## Где используется

### Страница списка (`/instructions`)

Крошки: `Главная / Инструкции`

Передаются из `app/[locale]/instructions/page.tsx` в `InstructionsList` как prop `breadcrumbs`. Рендерятся перед заголовком.

### Страница категории (`/instructions/[category]`)

Крошки: `Главная / Инструкции / {Категория}`

Передаются из `app/[locale]/instructions/[category]/page.tsx` в `InstructionsList` как prop `breadcrumbs`.

### Страница статьи (`/instruction/[slug]`)

Крошки: `Главная / Инструкции / {Название статьи}`

Передаются из `app/[locale]/instruction/[slug]/page.tsx` в `InstructionView` как prop `breadcrumbs`. Заменяют `BackButton` в desktop и mobile layout.

## Удаление

- Удалить `src/widgets/instruction-view/ui/components/back-button/` (BackButton.tsx + BackButton.module.css)
- Убрать импорт и использование BackButton из InstructionView.tsx

## i18n

Используются существующие ключи: `breadcrumbHome` ("Главная" / "Home") и `breadcrumbInstructions` ("Инструкции" / "Guides").

## Верификация

1. На `/instructions` отображаются крошки `Главная / Инструкции`
2. На `/instructions/crypto` отображаются `Главная / Инструкции / Крипто`
3. На `/instruction/{slug}` отображаются `Главная / Инструкции / Название`
4. Все ссылки кроме последнего элемента кликабельны и ведут на правильные страницы
5. Семантичная разметка: `<nav aria-label="Breadcrumb">` + `<ol>` + `<li>`
6. BackButton полностью удалён
7. Адаптивность: wrap на мобильных
