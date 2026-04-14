# Breadcrumbs на странице инструкции

Дата: 2026-04-14
Ветка: `feat/instructions-api-integration`

## Цель

Заменить back-link «К инструкциям» на полноценные breadcrumbs на странице `/[locale]/instruction/[slug]`. Данные для крошек уже формируются в page-компоненте и пробрасываются в виджет, но не рендерятся.

## Контекст

- `app/[locale]/instruction/[slug]/page.tsx` уже передаёт массив `breadcrumbs` (`Главная → Инструкции → <title>`) в `InstructionView`.
- `src/widgets/instruction-view/ui/InstructionView.tsx` объявляет проп `breadcrumbs: TBreadcrumbItem[]` в типе, но **не** деструктурирует его и не рендерит — вместо этого показывается локальная ссылка-стрелка с `backLabel`.
- Компонент `src/shared/ui/breadcrumbs/Breadcrumbs.tsx` уже готов и используется на странице списка (`InstructionsList.tsx`).
- На мобилке (≤767px) сейчас есть sticky-тулбар с back-link слева и `ActionBar` (bookmark) справа.

## Что меняется

### `src/widgets/instruction-view/ui/InstructionView.tsx`

- Удалить проп `backLabel`, деструктурировать `breadcrumbs`.
- Импортировать `Breadcrumbs` из `@/src/shared/ui/breadcrumbs`.
- Desktop: заменить блок `<Link className={styles.backLink}>…</Link>` на `<Breadcrumbs items={breadcrumbs} />`. Позиция — перед `HeroSection`. Остальной порядок без изменений: Breadcrumbs → HeroSection → MetadataBar → ActionBar → ArticleContent.
- Mobile: удалить `<div className={styles.toolbar}>` целиком. Новый порядок секций:
  1. `<Breadcrumbs items={breadcrumbs} />`
  2. `mobileTitle`
  3. `MetadataBar`
  4. `ActionBar`
  5. `HeroSection`
  6. `ArticleContent`

### `app/[locale]/instruction/[slug]/page.tsx`

- Убрать проп `backLabel={t('К инструкциям')}` из вызова `<InstructionView>`.

### `src/widgets/instruction-view/ui/InstructionView.module.css`

- Удалить правила `.backLink`, `.backLink:hover`, `.toolbar`, `.toolbarActions`.
- Подправить мобильные отступы/margin после удаления sticky-тулбара, если визуально нужно (проверить на устройстве ≤767px).

### i18n

- Удалить ключ `Instructions."К инструкциям"` из `messages/ru.json` и `messages/en.json` — он больше не используется (grep подтверждает, что ссылок на него вне `page.tsx` и файлов сообщений нет).

## Что не трогаем

- `Breadcrumbs` компонент — уже работает на странице списка, не меняем.
- Формирование массива `breadcrumbs` в `page.tsx` — логика корректна.
- JSON-LD breadcrumbs в `src/widgets/instruction-view/model/json-ld.ts` — отдельная сущность, не затрагивается.
- `ActionBar`, `MetadataBar`, `HeroSection`, `ArticleContent` — внутренне не меняются.

## Проверка

- `tsc` без ошибок (удалённый проп `backLabel` не должен остаться ни в типах, ни в вызовах).
- Визуальная проверка:
  - Desktop ≥768px — breadcrumbs сверху, кликабельны, последний элемент (заголовок) без ссылки.
  - Mobile ≤767px — нет sticky-тулбара, breadcrumbs сверху, bookmark (ActionBar) под MetadataBar.
  - Длинный заголовок не ломает layout.
- Обе локали (`ru`, `en`) — подписи крошек корректны.

## Вне скоупа

- Изменения в схеме API или типах инструкции.
- Редизайн самого компонента `Breadcrumbs`.
- Поведение breadcrumbs на странице списка.