import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
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
import { LanguageSwitcherModal } from '@/shared/components/language-switcher/LanguageSwitcherModal';
import { getLanguageOptions } from '@/shared/components/language-switcher';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { LegalDocumentSheet } from '@/shared/components/LegalDocumentSheet';
import type { LegalDocumentKind } from '@/shared/constants/legalContent';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

type MenuRow = {
  key: string;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function ProfileScreen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const profile = useProfileStore((state) => state.profile);
  const { currentLanguage, setLanguage } = useLanguage();
  const languageOptions = React.useMemo(() => getLanguageOptions(t), [t]);
  const currentLanguageLabel =
    languageOptions.find((option) => option.code === currentLanguage)?.label ?? '';
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [legalDoc, setLegalDoc] = React.useState<LegalDocumentKind | null>(null);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);

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
      navigation.getParent<NativeStackScreenProps<RootStackParamList>['navigation']>()?.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    }
  };

  const menuRows: MenuRow[] = [
    {
      key: 'personalInformation',
      label: t('profile.personalInformation'),
      subtitle: t('profile.personalInformationSubtitle'),
      icon: 'person-outline',
      onPress: () => navigation.navigate('PersonalInformation'),
    },
    {
      key: 'language',
      label: t('profile.language'),
      subtitle: currentLanguageLabel,
      icon: 'language-outline',
      onPress: () => setLanguageModalVisible(true),
    },
    {
      key: 'security',
      label: t('profile.security'),
      subtitle: t('profile.securitySubtitle'),
      icon: 'shield-checkmark-outline',
      onPress: () => {},
    },
    {
      key: 'privacy',
      label: t('profile.privacy'),
      subtitle: t('profile.privacySubtitle'),
      icon: 'lock-closed-outline',
      onPress: () => setLegalDoc('privacy'),
    },
    {
      key: 'terms',
      label: t('profile.terms'),
      subtitle: t('profile.termsSubtitle'),
      icon: 'document-text-outline',
      onPress: () => setLegalDoc('terms'),
    },
  ];

  const initial = profile?.fullName?.trim().charAt(0).toUpperCase() ?? '?';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={[styles.identityCard, { paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.identityInner}>
          <View style={styles.avatarRing}>
            <AppText weight="bold" style={styles.avatarInitial}>
              {initial}
            </AppText>
          </View>

          <View style={styles.identityCopy}>
            <AppText weight="bold" style={styles.name} numberOfLines={1}>
              {profile?.fullName ?? '—'}
            </AppText>
            {profile?.email ? (
              <View style={styles.metaRow}>
                <Ionicons name="mail" size={13} color={palette.pureWhite} />
                <AppText style={styles.metaText} numberOfLines={1}>
                  {profile.email}
                </AppText>
              </View>
            ) : null}
            {profile?.phoneE164 ? (
              <View style={styles.metaRow}>
                <Ionicons name="call" size={13} color={palette.pureWhite} />
                <AppText style={styles.metaText} numberOfLines={1}>
                  {profile.phoneE164}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuCard}>
          {menuRows.map((row, index) => (
            <Pressable
              key={row.key}
              onPress={row.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                index < menuRows.length - 1 && styles.menuRowBorder,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={row.icon} size={20} color={palette.gold} />
              </View>
              <View style={styles.menuCopy}>
                <AppText weight="semibold" style={styles.menuLabel}>
                  {row.label}
                </AppText>
                <AppText style={styles.menuSubtitle}>{row.subtitle}</AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.muted} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          accessibilityRole="button"
          accessibilityLabel={t('profile.logout')}
          style={({ pressed }) => [
            styles.logoutCard,
            loggingOut && styles.logoutCardDisabled,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.logoutIconWrap}>
            <Ionicons name="log-out-outline" size={22} color={palette.danger} />
          </View>
          <View style={styles.menuCopy}>
            <AppText weight="bold" style={styles.logoutLabel}>
              {t('profile.logout')}
            </AppText>
            <AppText style={styles.logoutSubtitle}>{t('profile.logoutSubtitle')}</AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.55)" />
        </Pressable>
      </ScrollView>

      <LegalDocumentSheet visible={legalDoc !== null} doc={legalDoc} onClose={() => setLegalDoc(null)} />

      <LanguageSwitcherModal
        visible={languageModalVisible}
        currentLanguage={currentLanguage}
        options={languageOptions}
        onClose={() => setLanguageModalVisible(false)}
        onSelectLanguage={(language) => {
          void setLanguage(language);
          setLanguageModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.warmWhite,
  },
  identityCard: {
    backgroundColor: palette.gold,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  identityInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: palette.pureWhite,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    color: palette.pureWhite,
  },
  identityCopy: {
    flex: 1,
    gap: 6,
    paddingTop: 4,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    color: palette.pureWhite,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  menuCard: {
    backgroundColor: palette.pureWhite,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 68,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.softGold,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 15,
    color: palette.charcoal,
  },
  menuSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
  },
  logoutCard: {
    backgroundColor: palette.gold,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 72,
  },
  logoutCardDisabled: {
    opacity: 0.6,
  },
  logoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutLabel: {
    fontSize: 15,
    color: palette.pureWhite,
  },
  logoutSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  pressed: {
    opacity: 0.88,
  },
});
