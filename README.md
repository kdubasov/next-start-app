# next-start-app

Минимальный стартер на **Next.js 16 (App Router)**: TypeScript, Redux Toolkit + RTK Query,
react-toastify, с настроенным тулингом (ESLint, Stylelint, Prettier, Playwright, husky).
Пакетный менеджер — **pnpm**.

## Стек

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Redux Toolkit** + **RTK Query** (с рефрешем токена через `async-mutex`)
- **react-toastify** — тосты
- **ESLint** (flat config, FSD import-order) + **Stylelint** + **Prettier**
- **husky** + **lint-staged** — авто-фикс staged-файлов на коммите
- **Playwright** — e2e-тесты
- **next-sitemap** — генерация sitemap/robots на postbuild

## Быстрый старт

```bash
pnpm install
pnpm dev
```

Открой [http://localhost:3000](http://localhost:3000). Точка входа — `app/page.tsx`.

## Команды

```bash
pnpm dev          # dev-сервер
pnpm build        # прод-сборка (+ next-sitemap на postbuild)
pnpm start        # запуск прод-сборки
pnpm lint         # ESLint (падает на любом warning)
pnpm lint:css     # Stylelint по **/*.css
pnpm check-types  # проверка типов (tsc --noEmit)
pnpm format       # Prettier --write
pnpm format:check # Prettier --check
pnpm e2e          # Playwright e2e
pnpm e2e-report   # открыть последний HTML-отчёт Playwright
pnpm lighthouse   # Lighthouse CI
pnpm pp           # полный pre-push: rm .next && tsc && eslint && stylelint && prettier check
```

Перед коммитом `pre-commit` хук (husky) прогоняет `lint-staged` (eslint/stylelint/prettier
`--fix` по staged-файлам). Хук бывает ненадёжен — перед коммитом полезно руками прогнать
`pnpm check-types`, `pnpm lint` и `pnpm build`.

Запуск одного e2e-файла:

```bash
pnpm exec playwright test e2e-tests/example.spec.ts
```

## Структура

```
app/                 # App Router: страницы, layout, providers
src/shared/          # общий код (utils/, hooks/, ui/, types/, constants/ — по мере роста)
api/                 # RTK Query: base query + слайсы (api/apiList/*), хуки из api/index.ts
store/               # Redux store + slices
e2e-tests/           # Playwright
public/              # статика
```

Path-алиас `@/*` → `./src/*` (см. `tsconfig.json`). Подробные конвенции проекта —
в [CLAUDE.md](./CLAUDE.md).

## Окружение

`NEXT_PUBLIC_PROD_URL` (см. `.env`) используется в `next-sitemap.config.js` для генерации
sitemap/robots. Сгенерированные `robots.txt` / `sitemap*.xml` — в `.gitignore`.
