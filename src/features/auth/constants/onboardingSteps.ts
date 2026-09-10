import type { OnboardingStep } from '@/features/auth/types/onboardingStepper.types';

export const SIGN_UP_STEPS: OnboardingStep[] = [
  { key: 'phone', label: 'Phone' },
  { key: 'otp', label: 'Verify' },
  { key: 'info', label: 'Profile' },
  { key: 'security', label: 'Security' },
];

export const LOGIN_STEPS: OnboardingStep[] = [
  { key: 'phone', label: 'Phone' },
  { key: 'otp', label: 'Verify' },
  { key: 'mpin', label: 'MPIN' },
];

export const FORGOT_MPIN_STEPS: OnboardingStep[] = [
  { key: 'otp', label: 'Verify' },
  { key: 'newMpin', label: 'New MPIN' },
  { key: 'confirmMpin', label: 'Confirm' },
];
