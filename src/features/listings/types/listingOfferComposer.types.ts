export type ListingOfferComposerProps = {
  currencyCode: string;
  placeholder: string;
  sendLabel: string;
  submittedLabel: string;
  hasOffer: boolean;
  submitting: boolean;
  onSubmit: (price: string) => void;
};
