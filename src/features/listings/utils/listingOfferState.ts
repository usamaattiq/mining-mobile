import type { ListingDto } from '@/features/listings/api/listingsApi';

const ATTACHED_OFFER_STATUSES = new Set(['active', 'selected', 'confirmed']);

export function listingHasMyOffer(listing: ListingDto): boolean {
  const rfq = 'rfq' in listing ? listing.rfq : undefined;
  if (!rfq) return false;
  if (rfq.myOfferStatus && ATTACHED_OFFER_STATUSES.has(rfq.myOfferStatus)) return true;
  return rfq.status === 'offer-submitted' || rfq.status === 'awaiting-your-confirmation';
}
