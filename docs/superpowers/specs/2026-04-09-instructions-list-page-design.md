# Instructions List Page — Design Spec

**Date:** 2026-04-09
**Status:** Draft → awaiting user review
**Goal:** Port the Instructions list page from the legacy React project (`your-project-hub/src/pages/Instructions.tsx`) into this Next.js App Router project as a fully SSR, SEO-optimized page with pagination, filters, mocked data served through an API-shaped client, and structured data.

---

## 1. Scope

In scope:
- Route `/[locale]/instructions` (all categories)
- Route `/[locale]/instructions/[category]` (single category)
- Server-side pagination via `?page=`
- Server-side sort via `?sort=` (`newest` | `popular`)
- Server-side search via `?q=`
- Mocked data layer with an API-shaped server module (no HTTP, drop-in replaceable with a real `fetch` later)
- Mocked categories endpoint
- Per-page `generateMetadata` (title, description, OG, Twitter, canonical, hreflang, robots)
- JSON-LD structured data: `CollectionPage` + `BreadcrumbList` + `ItemList` (with nested `Article` per item)
- `sitemap.ts` entries for all locales × categories × pagination pages
- i18n for UI strings (`ru`, `en`) under `instructions` namespace
- Browser QA verification (via `gstack`) of all acceptance criteria

Out of scope (explicitly deferred):
- Detail page `/instructions/[slug]`
- Favorites/bookmarks (will become a separate client-only page later)
- Unit/integration tests
- Real backend integration
- Category management UI

---

## 2. URL Scheme

```
/[locale]/instructions                         — all categories, page 1
/[locale]/instructions?page=N                  — all categories, page N (N > 1)
/[locale]/instructions?sort=popular            — all categories, sorted (noindex)
/[locale]/instructions?q=query                 — all categories, search (noindex)
/[locale]/instructions/[category]              — single category, page 1
/[locale]/instructions/[category]?page=N       — single category, page N
```

Rules:
- `?page=1` → 308 redirect to URL without `page` (before render, in the Server Component).
- `page > totalPages` or `page < 1` → `notFound()`.
- Unknown category slug → `notFound()`.
- `?q=` or `?sort=popular` present → `robots: noindex, follow`.
- Canonical URL strips `page=1`, `q`, and `sort`.

---

## 3. File Layout

```
app/[locale]/instructions/
  page.tsx                       # Server Component: all categories
  [category]/
    page.tsx                     # Server Component: one category

src/shared/api/instructions/
  index.ts                       # barrel
  types.ts                       # T* types
  client.ts                      # getInstructions(), getCategories()
  mock/
    dataset.ru.ts                # 50 seeded items, ru
    dataset.en.ts                # 50 seeded items, en
    categories.ts                # categories per locale with seo
    generate.ts                  # deterministic seeded generator

src/widgets/instructions-list/
  index.ts
  ui/
    InstructionsList.tsx         # Server Component
    InstructionsList.module.css
    components/
      instruction-card/
        InstructionCard.tsx      # Server Component
        InstructionCard.module.css
      filters-bar/
        FiltersBar.tsx           # Client Component
        FiltersBar.module.css
      search-input/
        SearchInput.tsx          # Client Component
        SearchInput.module.css
      pagination/
        Pagination.tsx           # Server Component
        Pagination.module.css
      empty-state/
        EmptyState.tsx           # Server Component
        EmptyState.module.css
  model/
    url-state.ts                 # parseSearchParams / buildHref / buildCanonical / buildPageRange
    json-ld.ts                   # buildListJsonLd()

messages/
  ru.json                        # + instructions namespace
  en.json                        # + instructions namespace

public/instructions/             # mock card images
```

---

## 4. Data Layer

### 4.1 Types (naming convention: `T*` for types, `I*` for interfaces)

```ts
// src/shared/api/instructions/types.ts

export type TLocale = "ru" | "en";

export type TSortOption = "newest" | "popular";

export type TCategorySlug = string; // validated at runtime against getCategories()

export type TInstructionSeo = {
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl: string;
  canonical: string;
};

export type TInstructionListItem = {
  id: string;                   // UUID
  slug: string;
  title: string;
  category: TCategorySlug;
  gradient: string;             // CSS gradient
  card_image: string;           // URL
  border_color: string;         // CSS color
  author_name: string;
  author_avatar: string;        // URL
  views_count: number;
  read_time: number;            // minutes
  lesson_id: string | null;
  course_id: string | null;
  published: boolean;
  created_at: string;           // ISO
  updated_at: string;           // ISO
  seo: TInstructionSeo;
  // NOTE: `content` is intentionally absent in list responses (see spec §4.3)
};

export type TInstructionListParams = {
  locale: TLocale;
  category?: TCategorySlug;
  sort?: TSortOption;
  q?: string;
  page?: number;                // 1-based, default 1
  pageSize?: number;            // default 12
};

export type TInstructionListResponse = {
  items: TInstructionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TCategoryWithSeo = {
  slug: TCategorySlug;
  label: string;                // localized
  seo: TInstructionSeo;
};
```

### 4.2 Client

```ts
// src/shared/api/instructions/client.ts

export async function getInstructions(
  params: TInstructionListParams
): Promise<TInstructionListResponse>;

export async function getCategories(params: {
  locale: TLocale;
}): Promise<TCategoryWithSeo[]>;
```

Behavior of `getInstructions`:
1. Load `dataset[locale]`.
2. Filter by `published === true`.
3. Apply `category` filter if provided.
4. Apply `q` filter: case-insensitive substring match on `title`.
5. Sort: `newest` → `created_at desc`; `popular` → `views_count desc`.
6. Paginate: `slice((page - 1) * pageSize, page * pageSize)`.
7. Return `{ items, total, page, pageSize, totalPages }`.
8. Simulate latency with `await new Promise(r => setTimeout(r, 30))` (disabled via env flag for local speed).

Wrap `getInstructions` and `getCategories` with `React.cache` so that `generateMetadata` and `page.tsx` can both call them within the same request without duplicate work.

**Real backend swap:** body of `getInstructions` becomes
```ts
return fetch(`${BASE}/instructions?${qs}`, {
  headers: { "Accept-Language": params.locale },
}).then(r => r.json());
```
Signature and all callers remain unchanged.

**Server-only boundary:** `client.ts` is server-only. Never import it from a file containing `"use client"`. This keeps the mock dataset out of the client bundle.

### 4.3 Mock dataset

- Generator `generate.ts` is deterministic (fixed seed per locale).
- Produces 50 items per locale.
- Distributed across categories roughly evenly.
- Titles/descriptions drawn from hand-curated pools per locale (realistic, not Lorem).
- `views_count` pseudo-random 50..10000.
- `read_time` pseudo-random 2..15.
- `created_at` within the last 180 days before the spec date.
- `gradient`, `border_color`, `card_image` chosen from per-category presets.
- `slug` derived from title + short hash suffix.
- `seo` populated per item: `title = item.title`, `description` = curated 1–2 sentence excerpt, `keywords` = category + handful of topic words, `ogImageUrl` = `card_image`, `canonical` = `/[locale]/instructions/[slug]`.

Same item `id`, `slug`, and structure across locales — only localized text fields differ.

### 4.4 Categories

`getCategories({ locale })` returns `[{ slug, label, seo }, ...]`.
- Initial slugs: `ai`, `crypto`.
- Each category has its own full `TInstructionSeo` block per locale.
- Used for `generateStaticParams` on the `[category]` route.

---

## 5. Page Components

### 5.1 `app/[locale]/instructions/page.tsx` (Server)

1. Parse `searchParams` via `parseSearchParams` from `url-state.ts`.
2. If `page === 1` and `page` was present in URL → `redirect()` to URL without `page`.
3. `Promise.all([getInstructions({ locale, ...params }), getCategories({ locale })])`.
4. If `page > totalPages && total > 0` → `notFound()`.
5. Render `<InstructionsList response={...} categories={...} currentCategory={undefined} state={...} />`.
6. Export `generateMetadata` (see §6).

### 5.2 `app/[locale]/instructions/[category]/page.tsx` (Server)

1. `generateStaticParams` → uses `getCategories` for all supported locales to list category slugs per locale.
2. Parse `searchParams`.
3. Validate category slug against `getCategories({ locale })`. Unknown → `notFound()`.
4. Same redirect / pagination rules as §5.1.
5. Render `<InstructionsList ... currentCategory={category} />`.
6. Export `generateMetadata` using the specific category's `seo` block.

### 5.3 `InstructionsList.tsx` (Server)

Renders:
- JSON-LD `<script type="application/ld+json">` (see §7).
- `<FiltersBar />` (Client).
- `<SearchInput />` (Client).
- Card grid (each `<InstructionCard />` is a Server Component) or `<EmptyState />`.
- `<Pagination />` (Server, pure `<Link>` elements).

### 5.4 Client Components

`FiltersBar.tsx`:
- Sort dropdown (`newest` | `popular`).
- Category dropdown only on the root `/instructions` page; on a category page show tabs "All" (links to `/instructions`) + current category.
- Changing sort: merge into current `searchParams`, reset `page` to 1, `router.push(buildHref(pathname, newParams))`.
- Changing category on the root page: navigate to `/instructions/[newCategory]`.
- Accessibility: `aria-expanded`, `role="menu"`, keyboard focus trap, `Esc` to close.

`SearchInput.tsx`:
- 300ms debounce.
- Empty string removes `q` from URL.
- Initial value hydrated from `searchParams.q`.
- Wrapped in `<form role="search">`; `onSubmit` triggers an immediate push.

`Pagination.tsx` (Server):
- Pure `<Link>` elements. No JS.
- Layout: `← Prev · 1 … 4 5 [6] 7 8 … N · Next →`.
- Range computed by `buildPageRange(current, total)` in `url-state.ts`.
- Wrapped in `<nav aria-label="Pagination">`.

### 5.5 `url-state.ts`

Pure functions, no React:
- `parseSearchParams(sp) → TInstructionListParams`
- `buildHref(basePath, params) → string`
- `buildCanonical(basePath, params) → string` (strips `page=1`, `q`, `sort`)
- `buildPageRange(current, total) → (number | "…")[]`

---

## 6. Metadata (`generateMetadata`)

Async, Server. Reuses `React.cache`-wrapped `getCategories` / `getInstructions`.

Returns (pseudo):

```ts
{
  title,            // base (root) OR category.seo.title; " — Страница N" suffix if page > 1
  description,      // base OR category.seo.description
  keywords,         // category.seo.keywords (or base)
  alternates: {
    canonical,      // buildCanonical(...)
    languages: { ru, en }, // hreflang for each locale equivalent URL
  },
  openGraph: {
    title, description,
    url: canonical,
    images: [{ url: category.seo.ogImageUrl, width: 1200, height: 630, alt: title }],
    locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title, description, images,
  },
  robots: {
    index: !(q || sort),
    follow: true,
  },
  other: {
    ...(page > 1 ? { "link:prev": prevUrl } : {}),
    ...(page < totalPages ? { "link:next": nextUrl } : {}),
  },
}
```

Base (root) SEO strings live in `messages/<locale>.json` under `instructions.seo.{title,description,keywords}`. Category SEO comes from the mock backend (`getCategories`).

---

## 7. JSON-LD Structured Data

Built by `buildListJsonLd(response, category, locale, baseUrl)` in `model/json-ld.ts`. Emits a single `<script>` containing an array:

1. **CollectionPage**
   - `@id`, `name`, `description`, `url`, `inLanguage`
2. **BreadcrumbList**
   - `Home → Instructions → [Category] → [Page N]`
3. **ItemList**
   - `itemListElement[]` of `ListItem` with `position` and `url`
   - Each `ListItem` has an embedded `Article` with `headline`, `image`, `author` (`Person`), `datePublished`, `dateModified`, `description` (from `seo.description`)

---

## 8. Sitemap & Robots

- `app/sitemap.ts` — generates URLs for all locales × categories × pagination pages (only canonical forms; no `q`, no non-default `sort`).
- `app/robots.ts` — no disallow for query strings (robots rules would hide `noindex` from crawlers).

---

## 9. i18n

- Locales: `ru`, `en` only.
- UI strings under `instructions` namespace in `messages/ru.json` and `messages/en.json`.
- Required keys: title, empty states, "All", "Sort by", "Newest", "Popular", filter/search placeholders, pagination aria-labels, "Page N of M", base SEO title/description/keywords.
- Category labels and per-category SEO come from the mock backend, not from `messages`.

---

## 10. Naming Conventions

- Types declared with `type`: **`T` prefix** (`TInstructionListItem`, `TSortOption`, ...).
- Types declared with `interface`: **`I` prefix** (if introduced).
- CSS Modules for all component styles (matches existing project convention).
- File names in `kebab-case` for directories, `PascalCase` for component files (matches existing FSD layout).

---

## 11. Verification Plan

No unit or integration tests. Verification is done via the `gstack` headless browser skill against a local `pnpm dev` instance. Each scenario must pass before the work is declared complete.

1. `/ru/instructions` renders 12 cards, filters/sort/search update the URL and re-render via SSR.
2. `/ru/instructions/ai?page=2` renders the correct page, `<link rel="canonical">` points to `/ru/instructions/ai?page=2`.
3. `/ru/instructions?page=1` 308-redirects to `/ru/instructions`.
4. `/ru/instructions/unknown-category` returns 404.
5. `/ru/instructions?page=99` returns 404.
6. `/ru/instructions?q=foo` contains `<meta name="robots" content="noindex, follow">` in `<head>`.
7. `view-source:` of any list URL contains the full card grid HTML with no reliance on client JS for the list itself.
8. JSON-LD blob is present and parses; contains `CollectionPage`, `BreadcrumbList`, and `ItemList` with correct `position` values.
9. `/en/instructions` renders the English dataset; `hreflang` links to the matching `/ru/instructions` URL and vice versa.
10. Lighthouse SEO score ≥ 95 on `/ru/instructions` and `/ru/instructions/ai`.

## 12. Acceptance Criteria

- All 10 verification scenarios in §11 pass.
- No `"use client"` directive in `InstructionsList.tsx`, `InstructionCard.tsx`, `Pagination.tsx`, `EmptyState.tsx`, page files, or anything in `src/shared/api/instructions/`.
- `grep` finds zero imports of `src/shared/api/instructions` from files containing `"use client"`.
- `messages/ru.json` and `messages/en.json` both contain a complete `instructions` namespace matching the keys used in code.
- All new types follow the `T*` / `I*` naming convention.
- The legacy React page in `your-project-hub` is not modified; this spec only covers forward-porting content and design into the Next.js project.
