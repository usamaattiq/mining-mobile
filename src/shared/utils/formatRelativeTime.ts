import type { TranslateFn } from '@/shared/types/translate.types';

const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

export function formatRelativeTime(sentAt: number, t: TranslateFn): string {
  const diff = Math.max(0, Date.now() - sentAt);
  if (diff < minute) return t('common.justNow');
  if (diff < hour) return t('common.minutesAgo', { count: Math.floor(diff / minute) });
  if (diff < day) return t('common.hoursAgo', { count: Math.floor(diff / hour) });
  if (diff < 2 * day) return t('common.yesterday');
  return t('common.daysAgo', { count: Math.floor(diff / day) });
}

export function formatClockTime(sentAt: number, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(sentAt));
}
