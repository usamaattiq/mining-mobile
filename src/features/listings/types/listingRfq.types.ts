export type ListingRfqStatusVariant = 'muted' | 'accent' | 'warning' | 'success';

export type ListingRfqOffer = {
  id: string;
  responderId: string;
  responderName: string;
  status: string;
  price?: string;
};

export type ListingRfq = {
  id: string;
  status: string;
  statusLabel: string;
  statusVariant: ListingRfqStatusVariant;
  expiresAt: number | null;
  offersCount?: number;
  canSubmitOffer?: boolean;
  canDecideOffers?: boolean;
  canConfirmOffer?: boolean;
  canDeclineOffer?: boolean;
  myOfferId?: string;
  myOfferStatus?: string;
  myOfferPrice?: string;
  offers?: ListingRfqOffer[];
};
