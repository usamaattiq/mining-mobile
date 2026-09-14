import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { i18n as appI18n } from '@/i18n';
import type { DashboardTabParamList, RootStackParamList } from '@/navigation/types';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { confirmSwitchMarketplaceRole, useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { getDeviceId } from '@/shared/utils/deviceId';
import { ProfileHeaderCard } from '@/features/dashboard/components/ProfileHeaderCard';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { MenuListCard } from '@/features/dashboard/components/MenuListCard';
import type { MenuListItem } from '@/features/dashboard/types/menuListCard.types';
import { MenuRow } from '@/features/dashboard/components/MenuRow';
import { LanguageSwitcherModal } from '@/shared/components/language-switcher/LanguageSwitcherModal';
import { getLanguageOptions } from '@/shared/components/language-switcher';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { LegalDocumentSheet } from '@/shared/components/LegalDocumentSheet';
import { showAppAlert } from '@/shared/services/appAlert';
import type { LegalDocumentKind } from '@/shared/constants/legalContent';
import { palette } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ProfileScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const profile = useProfileStore((state) => state.profile);
  const role = useMarketplaceRoleStore((state) => state.role);
  const { currentLanguage, setLanguage } = useLanguage();
  const languageOptions = React.useMemo(() => getLanguageOptions(t), [t]);
  const currentLanguageLabel =
    languageOptions.find((option) => option.code === currentLanguage)?.label ?? '';
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [legalDoc, setLegalDoc] = React.useState<LegalDocumentKind | null>(null);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);

  const handleSwitchRole = () => {
    confirmSwitchMarketplaceRole(t);
  };

  const handleLogout = () => {
    showAppAlert(t('welcome.logoutConfirmTitle'), t('welcome.logoutConfirmMessage'), [
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

  const menuItems: MenuListItem[] = [
    {
      label: t('profile.personalInformation'),
      subtitle: t('profile.personalInformationSubtitle'),
      icon: 'person-outline',
      onPress: () => navigation.navigate('PersonalInformation'),
    },
    {
      label: t('profile.language'),
      subtitle: currentLanguageLabel,
      icon: 'language-outline',
      onPress: () => setLanguageModalVisible(true),
    },
    {
      label: t('profile.security'),
      subtitle: t('profile.securitySubtitle'),
      icon: 'shield-checkmark-outline',
      onPress: () => navigation.navigate('SecuritySettings'),
    },
    {
      label: t('profile.privacy'),
      subtitle: t('profile.privacySubtitle'),
      icon: 'lock-closed-outline',
      onPress: () => setLegalDoc('privacy'),
    },
    {
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

      <ProfileHeaderCard
        initial={initial}
        avatarUrl={profile?.avatarUrl}
        name={profile?.fullName ?? '—'}
        phone={profile?.phoneE164}
        companyName={profile?.accountType === 'company' ? profile.companyName : null}
        onPressAvatar={() => navigation.navigate('PersonalInformation')}
      />

      <CurvedSheetScrollView>
        <MenuListCard items={menuItems} />

        <MenuRow
          variant="gold"
          icon="swap-horizontal-outline"
          label={role === 'supplier' ? t('profile.switchToBuyer') : t('profile.switchToSupplier')}
          subtitle={
            role === 'supplier'
              ? t('profile.switchToBuyerSubtitle')
              : t('profile.switchToSupplierSubtitle')
          }
          onPress={handleSwitchRole}
        />

        <MenuRow
          variant="gold"
          icon="log-out-outline"
          label={t('profile.logout')}
          subtitle={t('profile.logoutSubtitle')}
          onPress={handleLogout}
          disabled={loggingOut}
        />
      </CurvedSheetScrollView>

      <LegalDocumentSheet
        visible={legalDoc !== null}
        doc={legalDoc}
        onClose={() => setLegalDoc(null)}
      />

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
    backgroundColor: palette.pureWhite,
  },
});
