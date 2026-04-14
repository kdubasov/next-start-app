// src/shared/lib/duration/formatDuration.ts
import type { TLocale } from '@/src/shared/api/instructions';

import { parseIsoDuration } from './parseIsoDuration';

export const formatDuration = (iso: string, locale: TLocale): string => {
  const total = parseIsoDuration(iso);
  if (total === 0) return '';

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (locale === 'en') {
    if (hours && minutes) return `${hours} h ${minutes} min`;
    if (hours) return `${hours} h`;
    return `${minutes} min`;
  }

  if (hours && minutes) return `${hours} ч ${minutes} мин`;
  if (hours) return `${hours} ч`;
  return `${minutes} мин`;
};
