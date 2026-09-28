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
  fulfillmentModes?: Array<'rent' | 'sale'>;
  fulfillmentRentLabel?: string;
  fulfillmentSaleLabel?: string;
  onSubmit: (price: string, units?: number, fulfillment?: 'rent' | 'sale') => void;
  onConfirm: () => void;
  onDecline: () => void;
  footer?: ReactNode;
};
