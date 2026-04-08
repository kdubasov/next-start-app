# NavBar migration — design

**Date:** 2026-04-08
**Status:** Draft (awaiting user review)
**Source project:** `/Users/kirilldubasov/Desktop/react/academy-frontend` (Vite + React 18 + react-router + Redux + react-i18next)
**Target project:** `/Users/kirilldubasov/Desktop/next/academy-instructions` (Next.js 16, app router, next-intl, CSS Modules, FSD)

## Goal

Port `components/NavBar` (sidebar) from the old academy-frontend to the new project as an FSD widget, stripped of all auth / Redux / RTK Query / badges / promo concerns. Add a new "Инструкции / Guides" entry, and make `/guides` the primary page of this project (the existing `/` content moves there).

## Non-goals

- Promo block at the bottom of the old NavBar (`CourseEvent` + KuCoin banner) — explicitly excluded by the user.
- Author workshop branch (no auth in this project).
- Badge with unfinished tasks count (no RTK Query).
- Mobile drawer mode for NavBar — on mobile the existing `BottomNav` widget handles navigation.
- Real pages for `/home`, `/library`, `/my-courses`, `/tasks`, `/my-token`, `/referral-program`, `/rumi` — these remain 404 placeholders.

## File layout (FSD)

```
src/widgets/nav-bar/
  ui/
    NavBar.tsx              ('use client' — usePathname for active state)
    NavBar.module.css
    NavBarItem.tsx          (internal, not exported from barrel)
    NavBarItem.module.css
    Divider.tsx             (internal)
    Divider.module.css
  index.ts                  // export { NavBar }

app/[locale]/
  guides/
    page.tsx                // current app/[locale]/page.tsx content moves here
  page.tsx                  // replaced with redirect('/guides')
  layout.tsx                // adds <NavBar /> alongside Header/Footer/BottomNav
  layout.module.css         // adds .contentColumn + sidebar offset
```

The widget exposes a barrel `index.ts` with `export { NavBar }`. Import from layout as `@/src/widgets/nav-bar` (or `@/widgets/nav-bar`, both resolved by existing tsconfig `paths`).

## Menu items

Four groups separated by `<Divider />`. All items are static `Link`s (no auth, no RTK Query, no badges).

| Group | Label (ru) | href | Icon (`react-icons/lu`) | State |
|---|---|---|---|---|
| 1 | Главная | `/home` | `LuHouse` | normal |
| 1 | Каталог | `/library` | `LuLayoutGrid` | normal |
| 1 | Мои курсы | `/my-courses` | `LuBookOpen` | normal |
| 2 | Задания | `/tasks` | `LuListChecks` | normal (no badge) |
| 2 | Мой токен | `/my-token` | `LuCoins` | normal |
| 2 | Реферальная программа | `/referral-program` | `LuUsers` | normal |
| 3 | **Инструкции** | `/guides` | `LuBookMarked` | normal (active via `usePathname`) |
| 4 | Course Studio | `/rumi` | `LuSparkles` | `disabled` + "Скоро" badge |

Icons reuse the same `react-icons/lu` set chosen for `BottomNav` where the items overlap (Главная / Каталог / Мои курсы / Задания / Реферал), for visual consistency across the two nav widgets.

## Component contracts

### `widgets/nav-bar/ui/NavBar.tsx` — `'use client'`

- No props (desktop sidebar only).
- Hooks:
  - `const pathname = usePathname()` from `@/i18n/navigation`.
  - `const t = useTranslations('NavBar')`.
- Markup:
  - Logo at top: `Link` from `@/i18n/navigation` to `/guides`, wrapping `<Image src="/brand/academy-logo-full.svg" alt="Open Academy" width={...} height={...} />` (same asset used by `Footer`; exact dimensions confirmed against the SVG viewBox during implementation).
  - Four `<ul className={styles.list}>` groups separated by `<Divider />`.
  - Each item via `<NavBarItem href={...} icon={...} label={t('...')} />`.
  - Course Studio: `<NavBarItem ... disabled badge={t('Скоро')} />`.
- "Инструкции" is a regular `NavBarItem`. Active state is determined by `usePathname()`. Because the project content moves to `/guides`, visiting the site lands on `/guides` and the entry is highlighted automatically — **no `isActive` hardcode**.

### `widgets/nav-bar/ui/NavBarItem.tsx`

- Props:
  ```ts
  type Props = {
    href: string;
    icon: ComponentType<{ className?: string }>;
    label: string;
    disabled?: boolean;
    badge?: ReactNode;
  };
  ```
- Active detection: `isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)`.
- Renders `<Link href={href}>` from `@/i18n/navigation`. When `disabled`, renders `<span>` instead — no navigation, `pointer-events: none` via `.disabled` class.
- `className = cn(styles.item, isActive && styles.active, disabled && styles.disabled)`.
- Layout: `<Icon />` + `<span>{label}</span>` + optional `<span className={styles.badge}>{badge}</span>`.

### `widgets/nav-bar/ui/Divider.tsx`

Trivial: `<div className={styles.divider} />`. CSS copied verbatim from the old `Divider` component.

### CSS

`NavBar.module.css` and `NavBarItem.module.css` — copied from the old project with these removals/adaptations:

- Removed: `.zoom75`, `.zoom80`, `.zoom90`, `@keyframes zoomIn` — they existed to swap two custom SVGs; we use a single `react-icons` icon per item.
- Removed: `.createLabel` — no Author block.
- Removed: `.loading` — no auth-loading state.
- Removed: badge-with-count styles for the Tasks item — no RTK Query badge.
- Kept: `.badge` ("Скоро" pill), `.divider`, `.item`, `.active`, `.disabled`, `.logoLink`, `.logoIcon`, `.list`, `.nav`, `.wCalcMinus24`.
- Adapted (same fix as `BottomNav`): rules targeting `svg path { color: ... }` are rewritten to target `> svg { color: ... }`, because `react-icons` use `currentColor` at the SVG root rather than inner `<path fill>`.

### Responsive behavior

Desktop fixed sidebar at `width: var(--navbar-width)`, hidden on `max-width: 768px` (mobile uses `BottomNav`):

```css
@media (max-width: 768px) {
  .nav { display: none; }
}
```

`--navbar-width` is expected to exist in the global tokens already migrated to the new project. If missing during implementation, work stops and the user is consulted before inventing a value (the old project uses `15rem`).

## Layout integration

`app/[locale]/layout.tsx` is updated (on top of the parallel Header/Footer/BottomNav migration) to render `<NavBar />` alongside the other widgets:

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

`app/[locale]/layout.module.css` adds:

```css
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
```

The existing `.appShell` / `.main` rules from the Header/Footer/BottomNav spec remain. Only `.contentColumn` and the desktop offset are added.

## Routing: `/` and `/guides`

- `app/[locale]/guides/page.tsx` — current `app/[locale]/page.tsx` content moves here verbatim.
- `app/[locale]/page.tsx` — replaced with:
  ```tsx
  import { redirect } from '@/i18n/navigation';
  export default function Root() {
    redirect('/guides');
  }
  ```
- The "Главная" entry in NavBar points to `/home` — a 404 placeholder, consistent with the user's choice that all non-Guides nav items are internal Next links to non-existent routes.

## Internationalization

New namespace `NavBar` added to `messages/en.json` and `messages/ru.json`. In `ru.json`, each value equals its key (per existing convention). In `en.json`, values are sensible English translations to be refined on review.

```jsonc
// NavBar
{
  "Главная":               "Home"               | "Главная",
  "Каталог":               "Catalog"            | "Каталог",
  "Мои курсы":             "My courses"         | "Мои курсы",
  "Задания":               "Tasks"              | "Задания",
  "Мой токен":             "My token"           | "Мой токен",
  "Реферальная программа": "Referral program"   | "Реферальная программа",
  "Инструкции":            "Guides"             | "Инструкции",
  "Course Studio":         "Course Studio"      | "Course Studio",
  "Скоро":                 "Soon"               | "Скоро"
}
```

The "Скоро" key already exists in the parallel Footer namespace; here it lives independently under `NavBar` to keep namespaces self-contained.

## Dependencies

No new packages. `react-icons` and `next-intl` are already in (or being added by) the parallel Header/Footer/BottomNav migration. `cn` helper from `src/shared/lib/cn.ts` (also added by the parallel spec) is reused.

## CSS variables

The widget uses these existing global tokens: `--navbar-width`, `--bg-secondary`, `--bg-hover`, `--text-primary`, `--text-secondary`, `--color-violet`, `--color-violet-dark`, `--color-gray-1`, `--color-gray-2`, `--color-gray-3`. If any are missing during implementation, work stops and the user is consulted before inventing values.

## Verification checklist

1. `pnpm pp` (tsc + eslint + prettier) passes.
2. `pnpm dev` — visit `/`:
   - Redirects to `/guides`.
   - NavBar visible on the left at desktop widths.
   - "Инструкции" highlighted (active) on `/guides`.
   - Logo links to `/guides`.
   - Course Studio item is non-clickable, shows "Скоро" badge, has `.disabled` styling.
3. Click each other item — navigates to its href (404 page is fine), active highlight follows the route.
4. Resize to ≤768px — NavBar hidden, `BottomNav` visible, `<main>` no longer offset.
5. Toggle theme via `Header` `ThemeToggle` — NavBar colors update, active item still highlighted correctly in both themes.
6. Switch locale via `Header` `LanguageSelect` — NavBar labels update, current path preserved, "Инструкции" remains highlighted on `/guides`.
7. Browser console clean — no hydration warnings, no `next-intl` missing-key warnings.

## Out of scope (deferred)

- Real content for `/home`, `/library`, `/my-courses`, `/tasks`, `/my-token`, `/referral-program`, `/rumi` placeholder routes.
- Mobile drawer NavBar variant.
- Refining `en.json` translations — initial values are placeholders.
- Author workshop, auth dialog, KuCoin promo, task badges — explicitly excluded.