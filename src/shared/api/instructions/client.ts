// src/shared/api/instructions/client.ts
import { cache } from 'react';

import 'server-only';

import { CATEGORIES_BY_LOCALE } from './mock/categories';
import { DATASET_EN } from './mock/dataset.en';
import { DATASET_RU } from './mock/dataset.ru';
import type {
  TCategoryWithSeo,
  TInstructionListItem,
  TInstructionListParams,
  TInstructionListResponse,
  TLocale,
} from './types';
import { DEFAULT_PAGE_SIZE } from './types';

const DATASETS: Record<TLocale, TInstructionListItem[]> = {
  ru: DATASET_RU,
  en: DATASET_EN,
};

const applyFilters = (
  items: TInstructionListItem[],
  params: TInstructionListParams,
): TInstructionListItem[] => {
  let result = items.filter((i) => i.published);
  if (params.category) {
    result = result.filter((i) => i.category === params.category);
  }
  if (params.q && params.q.trim().length > 0) {
    const q = params.q.trim().toLowerCase();
    result = result.filter((i) => i.title.toLowerCase().includes(q));
  }
  return result;
};

const applySort = (
  items: TInstructionListItem[],
  sort: TInstructionListParams['sort'],
): TInstructionListItem[] => {
  const copy = [...items];
  if (sort === 'popular') {
    copy.sort((a, b) => b.views_count - a.views_count);
  } else {
    copy.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  return copy;
};

export const getInstructions = cache(
  async (params: TInstructionListParams): Promise<TInstructionListResponse> => {
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = Math.max(1, params.page ?? 1);

    const dataset = DATASETS[params.locale];
    const filtered = applyFilters(dataset, params);
    const sorted = applySort(filtered, params.sort);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  },
);

export const getCategories = cache(
  async (params: { locale: TLocale }): Promise<TCategoryWithSeo[]> => {
    return CATEGORIES_BY_LOCALE[params.locale];
  },
);
