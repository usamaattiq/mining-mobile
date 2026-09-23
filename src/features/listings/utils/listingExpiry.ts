export function defaultListingEnd(from = new Date()): Date {
  const end = new Date(from);
  end.setHours(end.getHours() + 24);
  return end;
}

/** Whole hours RMS accepts. Rounded up so the listing lasts at least until the chosen time. */
export function expiryHoursUntil(end: Date, now = Date.now()): number {
  const hours = Math.ceil((end.getTime() - now) / 3_600_000);
  return Math.min(24 * 365, Math.max(1, hours));
}
