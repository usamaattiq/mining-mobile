import type { ReactNode } from 'react';

export type ListingOfferComposerProps = {
  currencyCode: string;
  placeholder: string;
  sendLabel: string;
  submittedLabel: string;
  confirmLabel: string;
  declineLabel: string;
  offerPrice?: string;
  offerUnitsLabel?: string;
  offerUnits?: number;
  unitsLabel?: string;
  maxUnits?: number;
  unitPricePlaceholder?: string;
  hasOffer: boolean;
  leading?: boolean;
  showInput: boolean;
  awaitingConfirm: boolean;
  submitting: boolean;
  /** Units, price, and send share one row. Message actions stay on the line below. */
  sendInline?: boolean;
  offerTypeLabel?: string;
  fulfillmentModes?: Array<'rent' | 'sale' | 'onsite' | 'online'>;
  fulfillmentLabels?: Partial<Record<'rent' | 'sale' | 'onsite' | 'online', string>>;
  fulfillmentRentLabel?: string;
  fulfillmentSaleLabel?: string;
  /** Rent/buy (or similar) chips that cannot be sent until an open offer of that kind is settled. */
  blockedFulfillmentModes?: Array<'rent' | 'sale' | 'onsite' | 'online'>;
  offerChoiceLabel?: string;
  /** Pickup is always available. Delivery is included only when the listing offers it. */
  handoverModes?: Array<'pickup' | 'delivery'>;
  handoverLabels?: Partial<Record<'pickup' | 'delivery', string>>;
  handoverTitle?: string;
  onSubmit: (
    price: string,
    units?: number,
    fulfillment?: 'rent' | 'sale' | 'onsite' | 'online',
    handover?: 'pickup' | 'delivery',
  ) => void;
  onConfirm: () => void;
  onDecline: () => void;
  footer?: ReactNode;
};
