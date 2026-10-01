export type OnboardingProgressBarProps = {
  /** Total number of steps in the flow. */
  totalSteps: number;
  /** 0-based index of the current step. */
  currentStep: number;
};
