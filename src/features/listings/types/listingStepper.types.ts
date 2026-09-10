export type ListingStep = {
  key: string;
  label: string;
};

export type ListingStepperProps = {
  steps: ListingStep[];
  currentStep: number;
};
