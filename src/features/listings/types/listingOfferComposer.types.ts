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
  unitsLabel?: string;
  maxUnits?: number;
  unitPricePlaceholder?: string;
  hasOffer: boolean;
  showInput: boolean;
  awaitingConfirm: boolean;
  canWithdraw?: boolean;
  submitting: boolean;
  withdrawLabel?: string;
  onSubmit: (price: string, units?: number) => void;
  onConfirm: () => void;
  onDecline: () => void;
  onWithdraw?: () => void;
  footer?: ReactNode;
};
