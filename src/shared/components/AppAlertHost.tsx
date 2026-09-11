import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { registerAppAlertHandler } from '@/shared/services/appAlert';
import type { AppAlertButton, AppAlertRequest } from '@/shared/types/appAlert.types';

/**
 * App-branded replacement for the native Alert.alert dialog — mount once near the
 * app root. Screens trigger it via `showAppAlert(title, message, buttons)`.
 */
export function AppAlertHost(): React.ReactElement | null {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [request, setRequest] = React.useState<AppAlertRequest | null>(null);

  React.useEffect(() => {
    registerAppAlertHandler(setRequest);
    return () => registerAppAlertHandler(null);
  }, []);

  if (!request) return null;

  const buttons: AppAlertButton[] =
    request.buttons.length > 0 ? request.buttons : [{ text: t('common.ok') }];
  const stacked = buttons.length > 2;

  const handlePress = (button: AppAlertButton) => {
    setRequest(null);
    button.onPress?.();
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => setRequest(null)}
    >
      <Pressable style={styles.backdrop} onPress={() => setRequest(null)}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <AppText weight="bold" style={styles.title}>
            {request.title}
          </AppText>
          {request.message ? <AppText style={styles.message}>{request.message}</AppText> : null}

          <View style={[styles.buttonRow, stacked && styles.buttonColumn]}>
            {buttons.map((button, index) => (
              <Pressable
                key={`${button.text}_${index}`}
                onPress={() => handlePress(button)}
                style={({ pressed }) => [
                  styles.button,
                  button.style === 'cancel' && styles.buttonCancel,
                  button.style === 'destructive' && styles.buttonDestructive,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
              >
                <AppText
                  weight="semibold"
                  style={[styles.buttonText, button.style === 'cancel' && styles.buttonTextCancel]}
                >
                  {button.text}
                </AppText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 34, 34, 0.45)',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    color: palette.charcoal,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  buttonColumn: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gold,
    paddingHorizontal: spacing.md,
  },
  buttonCancel: {
    backgroundColor: palette.softGold,
  },
  buttonDestructive: {
    backgroundColor: palette.danger,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    fontSize: 15,
    color: palette.pureWhite,
  },
  buttonTextCancel: {
    color: palette.charcoal,
  },
});
