# NavBar Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the NavBar (sidebar) widget from `academy-frontend` (Vite) to this Next.js project as an FSD widget under `src/widgets/nav-bar/`, add a new "Инструкции / Guides" entry, and move root content to `/guides`.

**Architecture:** A `'use client'` desktop sidebar that uses `usePathname()` from `@/i18n/navigation` for active state. Four item groups separated by dividers. All items are static `Link`s; Course Studio is rendered as a non-clickable `<span>`. Hidden on `max-width: 768px` (mobile is handled by the existing `BottomNav`). The widget composes `NavBar` → many `NavBarItem` + `Divider`. Layout adds the sidebar plus a `.contentColumn` wrapper that offsets the existing Header / main / Footer column by `var(--navbar-width)` on desktop.

**Tech Stack:** Next.js 16 (app router), `next-intl`, CSS Modules, `react-icons/lu` for icons, `@/shared/lib/cn`, `@/i18n/navigation` (`Link`, `usePathname`, `redirect`).

**Spec:** `docs/superpowers/specs/2026-04-08-navbar-migration-design.md`.

**Preconditions verified:** `react-icons` installed (used by Header/Footer/BottomNav), `src/shared/lib/cn.ts` exists, `--navbar-width: 249px` already declared in `app/globals.css:44`, `--bg-secondary` / `--color-violet` / `--color-violet-dark` exist in `src/styles/colors.css`, `BottomNav` already hides at `>768px` so `<769px` rule on NavBar is symmetrical.

---

## File Structure

**Create:**
- `src/widgets/nav-bar/index.ts` — barrel: `export { NavBar } from './ui/NavBar';`
- `src/widgets/nav-bar/ui/NavBar.tsx` — `'use client'` widget root.
- `src/widgets/nav-bar/ui/NavBar.module.css` — sidebar shell styles.
- `src/widgets/nav-bar/ui/NavBarItem.tsx` — internal item (link/span + icon + label + optional badge).
- `src/widgets/nav-bar/ui/NavBarItem.module.css` — item styles + active/disabled/badge.
- `src/widgets/nav-bar/ui/Divider.tsx` — internal trivial divider.
- `src/widgets/nav-bar/ui/Divider.module.css` — divider styles.
- `app/[locale]/guides/page.tsx` — receives the current `app/[locale]/page.tsx` content verbatim.

**Modify:**
- `app/[locale]/page.tsx` — replaced with `redirect('/guides')`.
- `app/[locale]/layout.tsx` — adds `<NavBar />` + `.contentColumn` wrapper around Header/main/Footer.
- `app/[locale]/layout.module.css` — adds `.contentColumn` rules.
- `messages/ru.json` — adds `NavBar` namespace.
- `messages/en.json` — adds `NavBar` namespace.

---

## Task 1: Move root page content to `/guides`

**Files:**
- Create: `app/[locale]/guides/page.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Create the guides page with current root content**

Create `app/[locale]/guides/page.tsx` with the exact current content of `app/[locale]/page.tsx`:

```tsx
import { getTranslations } from 'next-intl/server';

import styles from '../../page.module.css';

export default async function GuidesPage() {
  const t = await getTranslations('Home');

  return (
    <main className={styles.main} data-testid="guides-page">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </main>
  );
}
```

Note the relative path becomes `../../page.module.css` (one level deeper than the old `../page.module.css`).

- [ ] **Step 2: Replace root page with redirect**

Replace the entire content of `app/[locale]/page.tsx` with:

```tsx
import { redirect } from '@/i18n/navigation';

export default async function Root({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/guides', locale });
}
```

(The next-intl `redirect` requires `locale` — pass through from params.)

- [ ] **Step 3: Verify TS + lint pass**

Run: `pnpm pp`
Expected: PASS (no type or lint errors).

- [ ] **Step 4: Manual smoke**

Run: `pnpm dev`, visit `http://localhost:3000/` → should redirect to `/en/guides` (or `/ru/guides`) and render the page with the same heading/text as before. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/page.tsx app/[locale]/guides/page.tsx
git commit -m "feat(navbar): move root page content to /guides and redirect"
```

---

## Task 2: Add `NavBar` i18n namespace

**Files:**
- Modify: `messages/ru.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add the `NavBar` namespace to `messages/ru.json`**

Append a new top-level key `"NavBar"` (alongside `Home`, `Header`, `Footer`, `BottomNav`). Insert before the closing `}`:

```jsonc
,
  "NavBar": {
    "Главная": "Главная",
    "Каталог": "Каталог",
    "Мои курсы": "Мои курсы",
    "Задания": "Задания",
    "Мой токен": "Мой токен",
    "Реферальная программа": "Реферальная программа",
    "Инструкции": "Инструкции",
    "Course Studio": "Course Studio",
    "Скоро": "Скоро"
  }
```

- [ ] **Step 2: Add the same namespace to `messages/en.json`**

Mirror the structure with English values:

```jsonc
,
  "NavBar": {
    "Главная": "Home",
    "Каталог": "Catalog",
    "Мои курсы": "My courses",
    "Задания": "Tasks",
    "Мой токен": "My token",
    "Реферальная программа": "Referral program",
    "Инструкции": "Guides",
    "Course Studio": "Course Studio",
    "Скоро": "Soon"
  }
```

- [ ] **Step 3: Verify JSON validity + types**

Run: `pnpm pp`
Expected: PASS. If next-intl strict-type checks complain about message shape, the namespace is fine — only fix actual errors.

- [ ] **Step 4: Commit**

```bash
git add messages/ru.json messages/en.json
git commit -m "feat(navbar): add NavBar i18n namespace"
```

---

## Task 3: Create the `Divider` subcomponent

**Files:**
- Create: `src/widgets/nav-bar/ui/Divider.tsx`
- Create: `src/widgets/nav-bar/ui/Divider.module.css`

- [ ] **Step 1: Write `Divider.module.css`**

Create `src/widgets/nav-bar/ui/Divider.module.css`:

```css
.divider {
  width: 100%;
  height: 1px;
  margin: 1rem 0;
  background: var(--border-default);
  transition: background-color 200ms;
}
```

- [ ] **Step 2: Write `Divider.tsx`**

Create `src/widgets/nav-bar/ui/Divider.tsx`:

```tsx
import styles from './Divider.module.css';

export function Divider() {
  return <div className={styles.divider} />;
}
```

(The `isTransparent` variant from the old project is unused after dropping the promo block — YAGNI.)

- [ ] **Step 3: Verify**

Run: `pnpm pp`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/widgets/nav-bar/ui/Divider.tsx src/widgets/nav-bar/ui/Divider.module.css
git commit -m "feat(navbar): add Divider subcomponent"
```

---

## Task 4: Create the `NavBarItem` subcomponent

**Files:**
- Create: `src/widgets/nav-bar/ui/NavBarItem.tsx`
- Create: `src/widgets/nav-bar/ui/NavBarItem.module.css`

- [ ] **Step 1: Write `NavBarItem.module.css`**

Create `src/widgets/nav-bar/ui/NavBarItem.module.css` (ported from the old project, removing `.loading` and rewriting the icon-color rules to target `> svg` so `react-icons` `currentColor` works):

```css
.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  height: 2.25rem;
  min-height: 2.25rem;

  border-radius: 0.5rem;
  padding: 0 0.75rem;

  font-weight: 500;
  color: var(--text-secondary);

  transition:
    background-color 200ms,
    color 200ms,
    transform 200ms;
}

.item > svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.item:hover {
  background: var(--bg-hover);
}

.active {
  background: var(--color-violet);
  color: #fff;
}

.active:hover {
  background: var(--color-violet-dark);
}

:global(.dark) .active {
  background: var(--color-violet-dark);
}

:global(.dark) .active:hover {
  background: var(--color-violet);
}

.disabled {
  pointer-events: none;
  background: color-mix(in srgb, var(--color-gray-2) 50%, transparent);
}

:global(.dark) .disabled {
  background: color-mix(in srgb, var(--color-gray-2) 25%, transparent);
}

.label {
  flex: 1;
}

.badge {
  padding: 0.1rem 0.25rem;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  color: var(--color-gray-1);
  background: var(--color-violet-dark);
  border-radius: 4px;
  line-height: 1.4;
}
```

- [ ] **Step 2: Write `NavBarItem.tsx`**

Create `src/widgets/nav-bar/ui/NavBarItem.tsx`:

```tsx
'use client';

import type { ComponentType, ReactNode } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/src/shared/lib/cn';

import styles from './NavBarItem.module.css';

type NavBarItemProps = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  badge?: ReactNode;
};

export function NavBarItem({
  href,
  icon: Icon,
  label,
  disabled,
  badge,
}: NavBarItemProps) {
  const pathname = usePathname();
  const isActive =
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const className = cn(
    styles.item,
    isActive && styles.active,
    disabled && styles.disabled,
  );

  const content = (
    <>
      <Icon />
      <span className={styles.label}>{label}</span>
      {badge ? <span className={styles.badge}>{badge}</span> : null}
    </>
  );

  if (disabled) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm pp`
Expected: PASS. (`NavBarItem` is unused so far — that's fine, eslint may warn about unused exports only at the barrel level.)

- [ ] **Step 4: Commit**

```bash
git add src/widgets/nav-bar/ui/NavBarItem.tsx src/widgets/nav-bar/ui/NavBarItem.module.css
git commit -m "feat(navbar): add NavBarItem subcomponent"
```

---

## Task 5: Create the `NavBar` widget root + barrel

**Files:**
- Create: `src/widgets/nav-bar/ui/NavBar.tsx`
- Create: `src/widgets/nav-bar/ui/NavBar.module.css`
- Create: `src/widgets/nav-bar/index.ts`

- [ ] **Step 1: Write `NavBar.module.css`**

Create `src/widgets/nav-bar/ui/NavBar.module.css`:

```css
.nav {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;

  display: flex;
  width: var(--navbar-width);
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;

  overflow-y: auto;

  background: var(--bg-secondary);
  padding-top: 1.5rem;

  transition:
    background-color 200ms,
    color 200ms;
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
}

.logoLink {
  margin-bottom: 2.5rem;
  width: 100%;
  align-self: flex-start;
  padding: 0.5rem 1.5rem;
}

.logoIcon {
  display: block;
  width: auto;
  height: 2.5rem;
  color: var(--text-primary);
  transition: color 200ms;
}

.list {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0 0.75rem;
  margin: 0;
  list-style: none;
}
```

- [ ] **Step 2: Write `NavBar.tsx`**

Create `src/widgets/nav-bar/ui/NavBar.tsx`:

```tsx
'use client';

import Image from 'next/image';

import { useTranslations } from 'next-intl';
import {
  LuBookMarked,
  LuBookOpen,
  LuCoins,
  LuHouse,
  LuLayoutGrid,
  LuListChecks,
  LuSparkles,
  LuUsers,
} from 'react-icons/lu';

import { Link } from '@/i18n/navigation';

import { Divider } from './Divider';
import styles from './NavBar.module.css';
import { NavBarItem } from './NavBarItem';

export function NavBar() {
  const t = useTranslations('NavBar');

  return (
    <nav className={styles.nav}>
      <Link href="/guides" className={styles.logoLink}>
        <Image
          src="/brand/academy-logo-full.svg"
          alt="Open Academy"
          width={175}
          height={40}
          className={styles.logoIcon}
          priority
        />
      </Link>

      <ul className={styles.list}>
        <li>
          <NavBarItem href="/home" icon={LuHouse} label={t('Главная')} />
        </li>
        <li>
          <NavBarItem
            href="/library"
            icon={LuLayoutGrid}
            label={t('Каталог')}
          />
        </li>
        <li>
          <NavBarItem
            href="/my-courses"
            icon={LuBookOpen}
            label={t('Мои курсы')}
          />
        </li>
      </ul>

      <Divider />

      <ul className={styles.list}>
        <li>
          <NavBarItem
            href="/tasks"
            icon={LuListChecks}
            label={t('Задания')}
          />
        </li>
        <li>
          <NavBarItem
            href="/my-token"
            icon={LuCoins}
            label={t('Мой токен')}
          />
        </li>
        <li>
          <NavBarItem
            href="/referral-program"
            icon={LuUsers}
            label={t('Реферальная программа')}
          />
        </li>
      </ul>

      <Divider />

      <ul className={styles.list}>
        <li>
          <NavBarItem
            href="/guides"
            icon={LuBookMarked}
            label={t('Инструкции')}
          />
        </li>
      </ul>

      <Divider />

      <ul className={styles.list}>
        <li>
          <NavBarItem
            href="/rumi"
            icon={LuSparkles}
            label={t('Course Studio')}
            disabled
            badge={t('Скоро')}
          />
        </li>
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: Write the barrel**

Create `src/widgets/nav-bar/index.ts`:

```ts
export { NavBar } from './ui/NavBar';
```

- [ ] **Step 4: Verify**

Run: `pnpm pp`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/widgets/nav-bar
git commit -m "feat(navbar): add NavBar widget root and barrel"
```

---

## Task 6: Integrate `NavBar` into the locale layout

**Files:**
- Modify: `app/[locale]/layout.tsx`
- Modify: `app/[locale]/layout.module.css`

- [ ] **Step 1: Update `layout.module.css`**

Replace the contents of `app/[locale]/layout.module.css` with:

```css
.appShell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.contentColumn {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

@media (min-width: 769px) {
  .contentColumn {
    margin-left: var(--navbar-width);
  }
}

.main {
  flex: 1;
}

@media (max-width: 768px) {
  .main {
    padding-bottom: calc(3.5rem + env(safe-area-inset-bottom));
  }
}
```

- [ ] **Step 2: Update `layout.tsx`**

In `app/[locale]/layout.tsx`, add the `NavBar` import alongside the others:

```tsx
import { NavBar } from '@/src/widgets/nav-bar';
```

Then replace the `<div className={layoutStyles.appShell}>` block (currently lines 51–56) with:

```tsx
<div className={layoutStyles.appShell}>
  <NavBar />
  <div className={layoutStyles.contentColumn}>
    <Header />
    <main className={layoutStyles.main}>{children}</main>
    <Footer />
  </div>
  <BottomNav />
</div>
```

- [ ] **Step 3: Verify TS + lint**

Run: `pnpm pp`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/layout.tsx app/[locale]/layout.module.css
git commit -m "feat(navbar): mount NavBar in locale layout"
```

---

## Task 7: End-to-end verification

**Files:** none — this is a manual verification pass.

- [ ] **Step 1: Run `pnpm pp` clean**

Run: `pnpm pp`
Expected: PASS (tsc + eslint + prettier).

- [ ] **Step 2: Start dev and verify desktop**

Run: `pnpm dev`. In a desktop-width browser window (≥1024px):

1. Visit `http://localhost:3000/` → redirects to `/en/guides` (or `/ru/guides` depending on default locale).
2. NavBar visible on the left, full height, sticky.
3. Logo at the top links to `/guides`.
4. "Инструкции" item is highlighted (active styling, violet background).
5. Course Studio item shows the "Скоро" badge, has the disabled background, is non-clickable.
6. Click each other item ("Главная", "Каталог", etc.) — URL changes, browser shows Next 404 page (expected — these routes don't exist), back-navigate to `/guides`.
7. Browser console clean — no hydration warnings, no `next-intl` missing-key warnings.

- [ ] **Step 3: Verify mobile responsive**

Resize the browser to ≤768px (or use devtools mobile emulation):

1. NavBar is hidden (`display: none`).
2. `BottomNav` appears at the bottom.
3. `<main>` content is no longer offset by `var(--navbar-width)` (the desktop margin is gone).
4. Bottom padding on `<main>` still keeps content above the `BottomNav`.

- [ ] **Step 4: Verify theme + locale interactions**

Back at desktop width:

1. Toggle theme via the Header `ThemeToggle` — NavBar background and active item colors update correctly in both themes.
2. Switch locale via the Header `LanguageSelect` — NavBar labels update, the URL preserves `/guides`, "Инструкции" remains highlighted.

- [ ] **Step 5: Stop dev server and commit (if anything was tweaked)**

If steps 1–4 surfaced any small fixes, commit them as `fix(navbar): ...`. Otherwise, no commit needed — the verification is the deliverable.