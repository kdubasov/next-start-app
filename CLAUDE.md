# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (runs next-sitemap as postbuild)
pnpm start        # Start production server
pnpm lint         # Run ESLint (fails on any warning)
pnpm lint:css     # Run Stylelint on **/*.css (fails on any warning)
pnpm check-types  # TypeScript type check (no emit)
pnpm format       # Prettier write
pnpm format:check # Prettier check
pnpm e2e          # Run Playwright e2e tests
pnpm e2e-report   # Open the last Playwright HTML report
pnpm lighthouse   # Run Lighthouse CI
pnpm pp           # Full pre-push: rm .next && tsc && eslint && stylelint && prettier check
```

A husky `pre-commit` hook runs `lint-staged`, which fixes/formats only staged files
(eslint --fix + stylelint --fix + prettier --write). The hook is not always reliable
(it can be skipped or non-executable), so run `pnpm check-types`, `pnpm lint` and
`pnpm build` manually **before committing** — don't rely on the hook alone.

Run a single e2e test file:

```bash
pnpm exec playwright test e2e-tests/example.spec.ts
```

## Architecture

A minimal **Next.js 16 App Router** starter: TypeScript + Redux Toolkit + RTK Query +
react-toastify, with ESLint / Stylelint / Prettier / Playwright tooling. Uses **pnpm**
as the package manager.

### Directory structure

- `app/` — Next.js App Router pages, layouts and providers
  - `app/layout.tsx` — root layout, wires the `Inter` font and `Providers`
  - `app/providers.tsx` — client wrapper: Redux `<Provider>` + `<ToastContainer>`
  - `app/dynamic-route/[id]/` — example dynamic route
- `src/` — Feature Sliced Design (FSD) layers. Currently only:
  - `src/shared/` — shared code (`utils/`, and add `hooks/`, `types/`, `ui/`, `constants/` as needed)
- `api/` — RTK Query API definitions
  - `api/constants/` — base query with token refresh via `async-mutex` (`baseQueryWithReauth`)
  - `api/apiList/` — API slices (`general`, ...); each `createApi` slice lives in its own file
  - `api/index.ts` — re-exports the auto-generated RTK Query hooks
- `store/` — Redux store configuration
  - `store/store.ts` — root store, exports `useAppDispatch` and `useAppSelector`
  - `store/slices/` — Redux slices (`layout`, ...)
- `e2e-tests/` — Playwright end-to-end tests
- `public/` — static assets

### Path alias

`@/*` resolves to `./src/*` (configured in `tsconfig.json`). `api/*`, `store/*` and
`app/*` are also resolved from the project root.

### State management

RTK Query handles API calls. The root reducer in `store/store.ts` combines plain slices
(`layout`, ...) with one RTK Query reducer per `api/apiList/*` slice, and concatenates
each slice's middleware. Import API hooks from `api/index.ts`, not from the slice files
directly. The base query (`api/constants/index.ts`) performs a single-flight token refresh
on `401` guarded by an `async-mutex` `Mutex`.

### Toasts

`react-toastify` is mounted once in `app/providers.tsx`. Use the helpers in
`src/shared/utils/toasts.ts` (`TOAST_SUCCESS`, `TOAST_ERROR`, `TOAST_WARNING`, `TOAST_INFO`)
instead of calling `toast(...)` ad hoc.

### SEO

`next-sitemap` runs as a `postbuild` step; config is in `next-sitemap.config.js` and reads
`NEXT_PUBLIC_PROD_URL`. Generated `robots.txt` / `sitemap*.xml` are git-ignored.

## Соглашения об именовании

Проверяется ESLint:

- Интерфейсы: PascalCase с префиксом `I` (например, `ILayout`)
- Type-алиасы: PascalCase с префиксом `T` (например, `TRootState`, `TAppDispatch`)
- Папки — kebab-case (`dynamic-route`, `api-list`)
- Файлы хуков и утилит — camelCase, совпадающий с именем экспорта
  (`useResumePublish.ts` → `useResumePublish`, `buildQuery.ts` → `buildQuery`)

## Комментарии

- **Все комментарии в коде пишутся по-русски** — inline-комментарии, JSDoc/TSDoc-блоки,
  обоснования `eslint-disable` и т.п. Идентификаторы, строки и имена ESLint-директив
  остаются на английском; по-русски только проза.

## Структура модуля: `types/` и `constants/`

Внутри любой папки entity/feature/widget/component:

- **Типы** живут в `types/index.ts` и импортируются оттуда.
- **Константы и данные** (объекты, массивы, числа, строки, конфиги, моки) живут в
  `constants/index.ts` (или `.tsx`, если используется JSX) и импортируются оттуда.
- **Никогда не смешивать** — типы не в `constants/`, константы не в `types/`.
- Плоские файлы `constants.ts` / `types.ts` в корне папки компонента запрещены — всегда
  используй форму `constants/index.ts` / `types/index.ts`.
- **Никаких магических чисел/строк в логике.** Таймауты, интервалы поллинга, брейкпоинты,
  повторяющиеся литералы → именованные константы.

## Правила компонентов и хуков

- **Максимум 120 строк на компонент _или хук_.** Если перерастает — разбивай:
  подкомпоненты в `components/`, логику в более узкие хуки.
- **Один компонент/хук = одна ответственность.** Не сваливай несвязанные state, эффекты
  и ветвления в один файл.
- **Сложную логику выноси в хуки.** Эффекты, загрузка/деривация данных, дебаунс,
  prefill/гидратация, многошаговый state формы, поллинг живут в папке `hooks/`.
- **Без преждевременной мемоизации.** `useMemo`/`useCallback` — только при конкретной
  причине (вход в deps эффекта, дорогой расчёт, стабилизация колбэка для мемо-ребёнка).

## ESLint: ключевые правила

Полный набор — в `eslint.config.mjs`. Самое важное:

- `import/order` — детерминированный порядок импортов с пустыми строками между группами
  (react / next / external → internal `@/*` по FSD-слоям → relative). Чинится через
  `eslint --fix`. Отдельного prettier-плагина для сортировки импортов нет — порядок
  держит ESLint.
- `import/no-cycle`, `import/no-duplicates` — `error`.
- `@typescript-eslint/consistent-type-imports` — type-only импорты инлайном
  (`import { type Foo }`).
- `@typescript-eslint/no-unused-vars` — неиспользуемое запрещено; префикс `_` исключает
  (аргументы, переменные, пойманные ошибки).
- `react/jsx-curly-brace-presence`, `react/self-closing-comp`, `react/jsx-boolean-value`,
  `react/jsx-no-useless-fragment` — единый JSX-стиль.
- `prefer-template`, `no-useless-concat` — шаблонные строки вместо конкатенации.
- Пустой `alt=""` запрещён (a11y) — дай осмысленный alt или `eslint-disable` для
  декоративных изображений.
- В `store/**` и `src/shared/utils/map*.ts` запрещены `crypto.randomUUID()` и
  `Math.random()` — id сущностей должны быть детерминированными (с бэка или по позиции),
  иначе ломаются React-ключи при рефетче.

## Stylelint

`stylelint.config.mjs` расширяет `stylelint-config-standard` + `stylelint-config-css-modules`.
Заметные конвенции: `font-size` с нечётными px (11, 13, 15...) — warning (держим чётную
шкалу); `flex-grow`/`flex-basis` на детях — warning (предпочитай `grid-template` на
контейнере); `!important` — warning.

## AGENTS.md

`AGENTS.md` — это симлинк на этот файл, чтобы агенты, читающие `AGENTS.md`, получали те же
инструкции. Правь `CLAUDE.md`; `AGENTS.md` менять не нужно.
