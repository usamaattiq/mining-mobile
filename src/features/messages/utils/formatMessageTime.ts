const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

export function formatMessageTime(
  sentAt: number,
  t: (key: string, options?: Record<string, string | number>) => string,
): string {
  const diff = Math.max(0, Date.now() - sentAt);
  if (diff < minute) return t('messages.justNow');
  if (diff < hour) return t('messages.minutesAgo', { count: Math.floor(diff / minute) });
  if (diff < day) return t('messages.hoursAgo', { count: Math.floor(diff / hour) });
  if (diff < 2 * day) return t('messages.yesterday');
  return t('messages.daysAgo', { count: Math.floor(diff / day) });
}

export function formatClockTime(sentAt: number, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(sentAt));
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (!first) return '?';
  if (!second) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase();
}
