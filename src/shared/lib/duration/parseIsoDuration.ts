// src/shared/lib/duration/parseIsoDuration.ts

// Парсит ISO 8601 Duration ("PT1H30M", "PT5M", "PT30S") в число минут.
// Невалидный формат → 0.
export const parseIsoDuration = (iso: string): number => {
  if (typeof iso !== 'string') return 0;
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return 0;
  const [, h, m, s] = match;
  const hours = h ? parseInt(h, 10) : 0;
  const minutes = m ? parseInt(m, 10) : 0;
  const seconds = s ? parseInt(s, 10) : 0;
  const total = hours * 60 + minutes + Math.floor(seconds / 60);
  return total;
};
