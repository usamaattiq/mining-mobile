import type { OnboardingStep } from '@/features/auth/components/OnboardingStepper';

export const SIGN_UP_STEPS: OnboardingStep[] = [
  { key: 'role', label: 'Role' },
  { key: 'phone', label: 'Phone' },
  { key: 'otp', label: 'Verify' },
  { key: 'info', label: 'Profile' },
  { key: 'security', label: 'Security' },
];
