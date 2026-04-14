// src/shared/api/instructions/http.ts
import 'server-only';

import type { TLocale } from './types';

type TQueryValue = string | number | undefined;

type TApiFetchInit = {
  locale: TLocale;
  revalidate?: number;
  query?: Record<string, TQueryValue>;
};

const buildUrl = (
  path: string,
  query?: Record<string, TQueryValue>,
): string => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set — check .env');
  }

  const url = new URL(base + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
};

export const apiFetch = async <T>(
  path: string,
  init: TApiFetchInit,
): Promise<T | null> => {
  const url = buildUrl(path, init.query);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept-Language': init.locale,
      Accept: 'application/json',
    },
    next: { revalidate: init.revalidate ?? 60 },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `API ${path} failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
};
