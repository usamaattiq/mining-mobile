export type ListingOfferComposerProps = {
  currencyCode: string;
  placeholder: string;
  sendLabel: string;
  submittedLabel: string;
  confirmLabel: string;
  declineLabel: string;
  hasOffer: boolean;
  awaitingConfirm: boolean;
  submitting: boolean;
  onSubmit: (price: string) => void;
  onConfirm: () => void;
  onDecline: () => void;
};
