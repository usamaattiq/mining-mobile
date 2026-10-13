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
  handover?: 'pickup' | 'delivery';
  delivery?: 'onsite' | 'online';
  createdAt?: number;
  responderPhone?: string;
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
  myOfferHandover?: 'pickup' | 'delivery';
  myOfferDelivery?: 'onsite' | 'online';
  myOfferCreatedAt?: number;
  ownerPhone?: string;
  isLeading?: boolean;
  offers?: ListingRfqOffer[];
};
