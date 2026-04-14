// src/shared/api/instructions/types.ts

export type TLocale = 'ru' | 'en';

export type TSortOption = 'newest' | 'popular';

export type TInstructionAuthor = {
  id: number;
  name: string;
  avatar: string;
};

export type TInstructionSeo = {
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl: string;
} | null;

export type TInstructionBlockType = 'lesson_block' | 'gamified_block';

export type TInstructionListItem = {
  id: number;
  title: string;
  slug: string;
  category: string;
  gradient: string | null;
  cardImage: string | null;
  borderColor: string | null;
  author: TInstructionAuthor;
  viewsCount: number;
  timeToRead: string; // ISO 8601 Duration, например "PT5M"
  courseId: number | null;
  blockObjectId: number | null;
  blockType: TInstructionBlockType | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  seo: TInstructionSeo;
};

export type TInstructionDetail = TInstructionListItem & {
  content: string;
};

export type TCategory = {
  id: number;
  slug: string;
  label: string;
  seo: TInstructionSeo;
};

export type TInstructionListParams = {
  locale: TLocale;
  category?: string;
  sort?: TSortOption;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type TInstructionListResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  categories: TCategory[];
  items: TInstructionListItem[];
};

export const DEFAULT_PAGE_SIZE = 12;
export const SUPPORTED_SORTS: readonly TSortOption[] = [
  'newest',
  'popular',
] as const;
