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

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingMode'>;

export function EquipmentListingModeScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={t('equipmentListing.modeTitle')}
        onBackPress={navigation.goBack}
        style={styles.header}
      />

      <CurvedSheetScrollView contentContainerStyle={styles.content}>
        {/* <AppText style={styles.intro}>{t('equipmentListing.modeSubtitle')}</AppText> */}

        <OptionRowCard
          icon="key-outline"
          title={t('equipmentListing.rent')}
          subtitle={t('equipmentListing.rentSubtitle')}
          onPress={() => navigation.navigate('EquipmentListingForm', { mode: 'rent' })}
        />
        <OptionRowCard
          icon="pricetag-outline"
          title={t('equipmentListing.sell')}
          subtitle={t('equipmentListing.sellSubtitle')}
          onPress={() => navigation.navigate('EquipmentListingForm', { mode: 'sell' })}
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
