export type ListingRfqStatusVariant = 'muted' | 'accent' | 'warning' | 'success';

export type ListingRfqOffer = {
  id: string;
  responderId: string;
  responderName: string;
  status: string;
  price?: string;
  quantity?: number;
  rank?: number;
  kind?: 'rent' | 'sale';
};

export type ListingRfq = {
  id: string;
  status: string;
  statusLabel: string;
  statusVariant: ListingRfqStatusVariant;
  expiresAt: number | null;
  currentPrice?: string;
  offersCount?: number;
  canSubmitOffer?: boolean;
  canDecideOffers?: boolean;
  canConfirmOffer?: boolean;
  canDeclineOffer?: boolean;
  canWithdrawOffer?: boolean;
  myOfferId?: string;
  myOfferStatus?: string;
  myOfferPrice?: string;
  myOfferQuantity?: number;
  myOfferKind?: 'rent' | 'sale';
  isLeading?: boolean;
  offers?: ListingRfqOffer[];
};
