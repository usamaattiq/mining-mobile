import type { ListingRfq } from '@/features/listings/types/listingRfq.types';

const OPEN_OFFER_STATUSES = new Set(['active', 'selected']);

/** The other side moved an offer I sent — not the moment I first submit it. */
const MY_OFFER_ATTENTION = new Set([
  'selected',
  'awaiting-your-confirmation',
  'awaiting-confirmation',
  'confirmed',
]);

/** Offers still waiting on the owner. Confirmed deals are not new activity. */
export function openOfferIds(rfq: ListingRfq | undefined): string[] {
  return (rfq?.offers ?? [])
    .filter((offer) => OPEN_OFFER_STATUSES.has(offer.status) && offer.id)
    .map((offer) => offer.id);
}

export function hasUnseenOffers(rfq: ListingRfq | undefined, seenIds: ReadonlySet<string>): boolean {
  return openOfferIds(rfq).some((id) => !seenIds.has(id));
}

export function myOfferAttentionKey(listingId: string, rfq: ListingRfq | undefined): string | null {
  if (!rfq) return null;
  const status = rfq.myOfferStatus ?? '';
  const rfqStatus = rfq.status ?? '';
  const needsAttention =
    MY_OFFER_ATTENTION.has(status) ||
    MY_OFFER_ATTENTION.has(rfqStatus) ||
    Boolean(rfq.canConfirmOffer);
  if (!needsAttention) return null;
  return `mine:${listingId}:${status}:${rfqStatus}`;
}

export function hasUnseenMyOffer(
  listingId: string,
  rfq: ListingRfq | undefined,
  seenIds: ReadonlySet<string>,
): boolean {
  const key = myOfferAttentionKey(listingId, rfq);
  return key != null && !seenIds.has(key);
}
