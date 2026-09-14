import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { OptionRowCard } from '@/shared/components/OptionRowCard';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceListingMode'>;

export function ServiceListingModeScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <GoldSheetScreen
      left="back"
      title={t('serviceListing.modeTitle')}
      onBackPress={navigation.goBack}
    >
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
    </GoldSheetScreen>
  );
}
