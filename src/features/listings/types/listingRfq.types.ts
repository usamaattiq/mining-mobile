export type ListingRfqStatusVariant = 'muted' | 'accent' | 'warning' | 'success';

export type ListingRfq = {
  id: string;
  status: string;
  statusLabel: string;
  statusVariant: ListingRfqStatusVariant;
  expiresAt: number | null;
  offersCount?: number;
  canSubmitOffer?: boolean;
  myOfferStatus?: string;
  myOfferPrice?: string;
};
