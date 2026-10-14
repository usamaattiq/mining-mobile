const MIN_AUCTION_HOURS = 0.5;
const MAX_AUCTION_HOURS = 24;
const HOUR_MS = 60 * 60 * 1000;

/** True while the listing is still live and less than one hour remains. */
export function isEndingSoon(endsAt: number | null | undefined, now = Date.now()): boolean {
  if (endsAt == null) return false;
  const remainingMs = endsAt - now;
  return remainingMs > 0 && remainingMs < HOUR_MS;
}

export function clampAuctionHours(hours: number): number {
  const snapped = Math.round(hours / MIN_AUCTION_HOURS) * MIN_AUCTION_HOURS;
  return Math.min(MAX_AUCTION_HOURS, Math.max(MIN_AUCTION_HOURS, Number(snapped.toFixed(1))));
}

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
