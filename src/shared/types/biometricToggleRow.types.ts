import type { DeviceBiometricKind } from '@/shared/hooks/useDeviceBiometric';

export type BiometricToggleRowProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  title: string;
  subtitle: string;
  kind: DeviceBiometricKind;
  /** Whether the device actually supports biometrics. Default true. */
  available?: boolean;
};
