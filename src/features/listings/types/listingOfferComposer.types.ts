export type ListingOfferComposerProps = {
  currencyCode: string;
  placeholder: string;
  sendLabel: string;
  submittedLabel: string;
  confirmLabel: string;
  declineLabel: string;
  offerPrice?: string;
  hasOffer: boolean;
  showInput: boolean;
  awaitingConfirm: boolean;
  canWithdraw?: boolean;
  submitting: boolean;
  withdrawLabel?: string;
  onSubmit: (price: string) => void;
  onConfirm: () => void;
  onDecline: () => void;
  onWithdraw?: () => void;
};
