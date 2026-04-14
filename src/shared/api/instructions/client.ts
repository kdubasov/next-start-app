// src/shared/api/instructions/client.ts
import 'server-only';

import { apiFetch } from './http';
import type {
  TInstructionDetail,
  TInstructionListParams,
  TInstructionListResponse,
  TLocale,
} from './types';

export const getInstructions = async (
  params: TInstructionListParams,
): Promise<TInstructionListResponse> => {
  const response = await apiFetch<TInstructionListResponse>('/instructions', {
    locale: params.locale,
    revalidate: 60,
    query: {
      page: params.page,
      pageSize: params.pageSize,
      category: params.category,
      sort: params.sort,
      q: params.q,
    },
  });
  if (!response) {
    throw new Error('Unexpected 404 on GET /instructions');
  }
  return response;
};

export const getInstructionBySlug = async (
  slug: string,
  locale: TLocale,
): Promise<TInstructionDetail | null> => {
  const decoded = decodeURIComponent(slug);
  return apiFetch<TInstructionDetail>(
    `/instructions/${encodeURIComponent(decoded)}`,
    {
      locale,
      revalidate: 300,
    },
  );
};
