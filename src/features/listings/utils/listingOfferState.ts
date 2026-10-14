import type { ListingDto } from '@/features/listings/api/listingsApi';

const ATTACHED_OFFER_STATUSES = new Set([
  'active',
  'selected',
  'confirmed',
  'returned',
  'declined',
  'timed_out',
  'timed-out',
]);

export function listingHasMyOffer(listing: ListingDto): boolean {
  const rfq = 'rfq' in listing ? listing.rfq : undefined;
  if (!rfq) return false;
  if (rfq.myOfferStatus && ATTACHED_OFFER_STATUSES.has(rfq.myOfferStatus)) return true;
  return rfq.status === 'offer-submitted' || rfq.status === 'awaiting-your-confirmation';
}

/** True only after both sides have accepted the offer. */
export function listingOfferIsSettled(listing: ListingDto): boolean {
  const rfq = 'rfq' in listing ? listing.rfq : undefined;
  if (!rfq) return false;
  return (
    rfq.myOfferStatus === 'confirmed' ||
    rfq.myOfferStatus === 'returned' ||
    rfq.status === 'confirmed' ||
    rfq.status === 'completed'
  );
}
