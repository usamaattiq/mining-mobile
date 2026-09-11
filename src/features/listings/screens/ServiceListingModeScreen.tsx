import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { AppText } from '@/shared/components/AppText';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { OptionRowCard } from '@/shared/components/OptionRowCard';
import { palette, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceListingMode'>;

export function ServiceListingModeScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={t('serviceListing.modeTitle')}
        onBackPress={navigation.goBack}
        style={styles.header}
      />

      <CurvedSheetScrollView contentContainerStyle={styles.content}>
        {/* <AppText style={styles.intro}>{t('serviceListing.modeSubtitle')}</AppText> */}

        <OptionRowCard
          icon="location-outline"
          title={t('serviceListing.onsite')}
          subtitle={t('serviceListing.onsiteSubtitle')}
          onPress={() => navigation.navigate('ServiceListingForm', { serviceType: 'onsite' })}
        />
        <OptionRowCard
          icon="globe-outline"
          title={t('serviceListing.online')}
          subtitle={t('serviceListing.onlineSubtitle')}
          onPress={() => navigation.navigate('ServiceListingForm', { serviceType: 'online' })}
        />
      </CurvedSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
  },
  header: {
    paddingBottom: spacing.xl,
  },
  content: {
    gap: spacing.md,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    marginBottom: spacing.xs,
  },
});
