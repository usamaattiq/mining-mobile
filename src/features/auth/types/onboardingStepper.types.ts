export type OnboardingStep = {
  key: string;
  label: string;
};

export type OnboardingStepperProps = {
  steps: OnboardingStep[];
  currentStep: number;
};
