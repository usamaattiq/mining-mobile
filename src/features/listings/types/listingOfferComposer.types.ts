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
  onSubmit: (price: string, units?: number) => void;
  onConfirm: () => void;
  onDecline: () => void;
  footer?: ReactNode;
};
