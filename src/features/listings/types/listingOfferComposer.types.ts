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
  fulfillmentModes?: Array<'rent' | 'sale' | 'onsite' | 'online'>;
  fulfillmentLabels?: Partial<Record<'rent' | 'sale' | 'onsite' | 'online', string>>;
  fulfillmentRentLabel?: string;
  fulfillmentSaleLabel?: string;
  offerChoiceLabel?: string;
  onSubmit: (
    price: string,
    units?: number,
    fulfillment?: 'rent' | 'sale' | 'onsite' | 'online',
  ) => void;
  onConfirm: () => void;
  onDecline: () => void;
  footer?: ReactNode;
};
