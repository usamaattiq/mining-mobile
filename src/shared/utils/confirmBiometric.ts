import { Keyboard } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

/** iOS cancels Face ID if it starts during a switch animation or while the keyboard is open. */
export async function confirmBiometric(
  promptMessage: string,
  cancelLabel: string,
): Promise<LocalAuthentication.LocalAuthenticationResult> {
  Keyboard.dismiss();
  await new Promise((resolve) => setTimeout(resolve, 400));
  return LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel,
    disableDeviceFallback: false,
  });
}
