// src/shared/api/instructions/index.ts

export { getInstructions, getInstructionBySlug } from './client';
export type {
  TLocale,
  TSortOption,
  TInstructionAuthor,
  TInstructionSeo,
  TInstructionBlockType,
  TInstructionListItem,
  TInstructionDetail,
  TCategory,
  TInstructionListParams,
  TInstructionListResponse,
} from './types';
export { DEFAULT_PAGE_SIZE, SUPPORTED_SORTS } from './types';
