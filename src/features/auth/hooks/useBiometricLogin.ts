import React from 'react';
import { Keyboard } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useDeviceBiometric } from '@/shared/hooks/useDeviceBiometric';
import { useDevicePrefsStore } from '@/store/devicePrefsStore';

/**
 * Fires the OS biometric prompt once when `enabled` becomes true (the login MPIN
 * step mounting on a returning device), if biometric is on for this device and a
 * cached MPIN exists. Success auto-submits the cached MPIN; cancel/fail silently
 * falls back to manual entry — no error shown.
 */
export function useBiometricLogin(options: {
  enabled: boolean;
  onAutoSubmit: (cachedMpin: string) => void;
}): { available: boolean; promptNow: () => void } {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { available } = useDeviceBiometric();
  const biometricEnabled = useDevicePrefsStore((state) => state.biometricEnabled);
  const cachedMpin = useDevicePrefsStore((state) => state.cachedMpin);
  const hasFiredRef = React.useRef(false);
  const onAutoSubmitRef = React.useRef(options.onAutoSubmit);
  onAutoSubmitRef.current = options.onAutoSubmit;

  const prompt = React.useCallback(async () => {
    if (!cachedMpin) return;

    // iOS cancels Face ID if the number pad is on screen. Wait until it is gone.
    Keyboard.dismiss();
    await new Promise<void>((resolve) => {
      if (!Keyboard.isVisible()) {
        resolve();
        return;
      }
      const subscription = Keyboard.addListener('keyboardDidHide', () => {
        subscription.remove();
        resolve();
      });
      setTimeout(() => {
        subscription.remove();
        resolve();
      }, 700);
    });

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('loginMpin.biometricPrompt'),
      cancelLabel: t('common.cancel'),
      disableDeviceFallback: true,
    });

    if (result.success) {
      onAutoSubmitRef.current(cachedMpin);
    }
  }, [cachedMpin, t]);

  React.useEffect(() => {
    if (!options.enabled || hasFiredRef.current) return;
    if (!available || !biometricEnabled || !cachedMpin) return;

    hasFiredRef.current = true;
    void prompt();
  }, [options.enabled, available, biometricEnabled, cachedMpin, prompt]);

  return {
    available: available && biometricEnabled && Boolean(cachedMpin),
    promptNow: () => void prompt(),
  };
}
