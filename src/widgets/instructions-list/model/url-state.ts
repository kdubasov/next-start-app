// src/widgets/instructions-list/model/url-state.ts
import type {
  TInstructionListParams,
  TLocale,
  TSortOption,
} from '@/src/shared/api/instructions';
import { SUPPORTED_SORTS } from '@/src/shared/api/instructions';

export type TRawSearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

export const parseSearchParams = (
  sp: TRawSearchParams,
  locale: TLocale,
  category?: string,
): TInstructionListParams => {
  const rawSort = first(sp.sort);
  const sort: TSortOption | undefined = SUPPORTED_SORTS.includes(
    rawSort as TSortOption,
  )
    ? (rawSort as TSortOption)
    : undefined;

  const rawQ = first(sp.q);
  const q = rawQ && rawQ.trim().length > 0 ? rawQ.trim() : undefined;

  const rawPage = first(sp.page);
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : NaN;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return {
    locale,
    category,
    sort,
    q,
    page,
  };
};

export const isExplicitPageOne = (sp: TRawSearchParams): boolean =>
  first(sp.page) === '1';

const queryString = (
  params: Pick<TInstructionListParams, 'sort' | 'q' | 'page'>,
): string => {
  const usp = new URLSearchParams();
  if (params.sort) usp.set('sort', params.sort);
  if (params.q) usp.set('q', params.q);
  if (params.page && params.page > 1) usp.set('page', String(params.page));
  const s = usp.toString();
  return s ? `?${s}` : '';
};

export const buildHref = (
  basePath: string,
  params: Partial<TInstructionListParams>,
): string => {
  return `${basePath}${queryString({
    sort: params.sort,
    q: params.q,
    page: params.page,
  })}`;
};

export const buildCanonical = (
  basePath: string,
  params: TInstructionListParams,
): string => {
  // Canonical strips q, sort, and page=1
  return `${basePath}${queryString({ page: params.page })}`;
};

export const buildPageRange = (
  current: number,
  total: number,
): (number | '…')[] => {
  if (total <= 1) return [1];
  const pages: (number | '…')[] = [];
  const push = (v: number | '…') => pages.push(v);

  const add = (n: number) => {
    if (n >= 1 && n <= total) push(n);
  };

  add(1);
  if (current - 2 > 2) push('…');
  for (
    let n = Math.max(2, current - 1);
    n <= Math.min(total - 1, current + 1);
    n++
  ) {
    add(n);
  }
  if (current + 2 < total - 1) push('…');
  if (total > 1) add(total);
  // Deduplicate consecutive numbers just in case
  return pages.filter((v, i, a) => v !== a[i - 1]);
};

export const shouldNoindex = (params: TInstructionListParams): boolean =>
  Boolean(params.q) || Boolean(params.sort);
