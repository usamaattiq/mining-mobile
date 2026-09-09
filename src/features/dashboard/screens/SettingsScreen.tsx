import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { i18n as appI18n } from '@/i18n';
import type { DashboardTabParamList, RootStackParamList } from '@/navigation/types';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { getDeviceId } from '@/shared/utils/deviceId';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SettingsScreen({ navigation }: Props): React.ReactElement {
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
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <AppText weight="bold" style={styles.title}>
        {t('dashboardSettings.title')}
      </AppText>
      <AppText style={styles.subtitle}>{t('dashboardSettings.subtitle')}</AppText>

      <Pressable
        style={[styles.logoutRow, loggingOut && styles.logoutRowDisabled]}
        onPress={handleLogout}
        disabled={loggingOut}
        accessibilityRole="button"
        accessibilityLabel={t('welcome.logout')}
      >
        <Ionicons name="log-out-outline" size={18} color={palette.danger} />
        <AppText weight="semibold" style={styles.logoutLabel}>
          {t('welcome.logout')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.warmWhite,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 22,
    color: palette.charcoal,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: palette.muted,
  },
  logoutRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
  },
  logoutRowDisabled: {
    opacity: 0.5,
  },
  logoutLabel: {
    fontSize: 14,
    color: palette.danger,
  },
});
