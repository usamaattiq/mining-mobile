import React from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export type DeviceBiometricKind = 'face' | 'fingerprint' | 'none';

export interface DeviceBiometricState {
  /** Hardware present and at least one biometric enrolled. */
  available: boolean;
  /** Face ID / face unlock when supported; otherwise fingerprint. */
  kind: DeviceBiometricKind;
}

/** Detects Face ID vs fingerprint support via expo-local-authentication. */
export function useDeviceBiometric(): DeviceBiometricState {
  const [state, setState] = React.useState<DeviceBiometricState>({
    available: false,
    kind: 'none',
  });

  React.useEffect(() => {
    let mounted = true;

    void (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      const types = hasHardware
        ? await LocalAuthentication.supportedAuthenticationTypesAsync()
        : [];

      const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

      // Face ID takes priority when both are enrolled; fall back to fingerprint.
      const kind: DeviceBiometricKind = hasFace ? 'face' : hasFingerprint ? 'fingerprint' : 'none';

      if (mounted) {
        setState({ available: hasHardware && enrolled, kind });
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
