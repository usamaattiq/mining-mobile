import type { ReactNode } from 'react';
import type { OnboardingStep } from '@/features/auth/types/onboardingStepper.types';

export type OnboardingLayoutProps = {
  steps: OnboardingStep[];
  currentStep: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  continueLabel?: string;
  /** Hide the footer continue button (e.g. role-selection cards navigate on their own). */
  showFooter?: boolean;
  /** Hide the "Step X of Y" label and progress bar (e.g. login, which isn't a linear wizard). */
  showProgress?: boolean;
  children: ReactNode;
};
