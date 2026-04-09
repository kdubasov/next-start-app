// src/shared/api/instructions/index.ts

export { getInstructions, getCategories } from './client';
export type {
  TLocale,
  TSortOption,
  TCategorySlug,
  TInstructionSeo,
  TInstructionListItem,
  TInstructionListParams,
  TInstructionListResponse,
  TCategoryWithSeo,
} from './types';
export { DEFAULT_PAGE_SIZE, SUPPORTED_SORTS } from './types';
