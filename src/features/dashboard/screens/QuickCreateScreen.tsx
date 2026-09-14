import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { OptionRowCard } from '@/shared/components/OptionRowCard';
import { listingCreateActions } from '@/features/dashboard/utils/listingCreateActions';

type Props = NativeStackScreenProps<RootStackParamList, 'QuickCreate'>;

/** Full-screen listing-type picker opened from the tab bar "+" button. */
export function QuickCreateScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const actions = listingCreateActions(t, navigation.navigate);

  return (
    <GoldSheetScreen
      left="back"
      title={t('dashboardHome.quickCreateTitle')}
      onBackPress={navigation.goBack}
    >
      {actions.map((action) => (
        <OptionRowCard key={action.title} {...action} />
      ))}
    </GoldSheetScreen>
  );
}
