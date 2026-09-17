import type { TFunction } from 'i18next';
import type { ListingRfq } from '@/features/listings/types/listingRfq.types';
import type { ListingCardBadge } from '@/features/listings/types/listingCard.types';

const RFQ_STATUS_I18N: Record<string, string> = {
  live: 'live',
  'awaiting-confirmation': 'awaitingConfirmation',
  'offer-submitted': 'offerSubmitted',
  'awaiting-your-confirmation': 'awaitingYourConfirmation',
  confirmed: 'confirmed',
  completed: 'completed',
  closed: 'closed',
  expired: 'expired',
};

export function rfqStatusLabel(t: TFunction, rfq: ListingRfq): string {
  const key = RFQ_STATUS_I18N[rfq.status];
  if (key) {
    return t(`rfq.status.${key}`);
  }
  return rfq.statusLabel || rfq.status;
}

export function rfqStatusBadge(t: TFunction, rfq: ListingRfq | undefined): ListingCardBadge | null {
  if (!rfq) return null;
  return {
    key: 'rfq',
    label: rfqStatusLabel(t, rfq),
    variant: rfq.statusVariant,
  };
}
