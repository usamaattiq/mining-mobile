import type { AppAlertButton, AppAlertLink, AppAlertRequest } from '@/shared/types/appAlert.types';

type AppAlertHandler = (request: AppAlertRequest) => void;

let handler: AppAlertHandler | null = null;

/** Registered once by AppAlertHost when it mounts; unregistered on unmount. */
export function registerAppAlertHandler(nextHandler: AppAlertHandler | null): void {
  handler = nextHandler;
}

/**
 * Drop-in replacement for React Native's `Alert.alert(title, message, buttons)`,
 * rendered as the app's own branded dialog (AppAlertHost) instead of the native one.
 */
export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  links?: AppAlertLink[],
): void {
  handler?.({ title, message, buttons: buttons ?? [], links });
}
