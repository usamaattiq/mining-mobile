import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { getDeviceId } from '@/shared/utils/deviceId';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(t('welcome.logoutConfirmTitle'), t('welcome.logoutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('welcome.logout'),
        style: 'destructive',
        onPress: () => void performLogout(),
      },
    ]);
  };

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      const deviceId = await getDeviceId();
      await authApi.logout(deviceId);
    } catch {
      // Best-effort — still clear local session even if the server call fails.
    } finally {
      await useAuthStore.getState().clear();
      useProfileStore.getState().clear();
      setLoggingOut(false);
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Pressable
        style={styles.logoutTrigger}
        onPress={handleLogout}
        disabled={loggingOut}
        accessibilityRole="button"
        accessibilityLabel={t('welcome.logout')}
      >
        <Ionicons name="log-out-outline" size={18} color={palette.muted} />
        <AppText weight="semibold" style={styles.logoutLabel}>
          {t('welcome.logout')}
        </AppText>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={40} color={palette.pureWhite} />
        </View>
        <AppText weight="bold" style={styles.title}>
          {t('welcome.title')}
        </AppText>
        <AppText style={styles.subtitle}>{t('welcome.subtitle')}</AppText>
      </View>

      <Button
        label={t('welcome.continue')}
        onPress={() => Alert.alert(t('welcome.continue'), '')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  logoutTrigger: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  logoutLabel: {
    fontSize: 13,
    color: palette.muted,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    color: palette.charcoal,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    maxWidth: '85%',
  },
  button: {
    marginBottom: spacing.md,
  },
});
