// src/shared/api/instructions/types.ts

export type TLocale = 'ru' | 'en';

export type TSortOption = 'newest' | 'popular';

export type TCategorySlug = string;

export type TInstructionSeo = {
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl: string;
  canonical: string;
};

export type TInstructionListItem = {
  id: string;
  slug: string;
  title: string;
  category: TCategorySlug;
  gradient: string;
  card_image: string;
  border_color: string;
  author_name: string;
  author_avatar: string;
  views_count: number;
  read_time: number;
  lesson_id: string | null;
  course_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  seo: TInstructionSeo;
};

export type TInstructionListParams = {
  locale: TLocale;
  category?: TCategorySlug;
  sort?: TSortOption;
  q?: string;
  page?: number;
  pageSize?: number;
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
  label: string;
  seo: TInstructionSeo;
};

export const DEFAULT_PAGE_SIZE = 12;
export const SUPPORTED_SORTS: readonly TSortOption[] = [
  'newest',
  'popular',
] as const;
