import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { OptionRowCard } from '@/shared/components/OptionRowCard';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingMode'>;

export function EquipmentListingModeScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <GoldSheetScreen
      left="back"
      title={t('equipmentListing.modeTitle')}
      onBackPress={navigation.goBack}
    >
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
    </GoldSheetScreen>
  );
}
