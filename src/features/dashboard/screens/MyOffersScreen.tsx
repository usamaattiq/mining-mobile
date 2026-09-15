import React from 'react';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { EmptyState } from '@/shared/components/EmptyState';

export function MyOffersScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <GoldSheetScreen title={t('offers.title')} titleAlign="left" titleSize="lg">
      <EmptyState title={t('offers.emptyTitle')} subtitle={t('offers.emptySubtitle')} />
    </GoldSheetScreen>
  );
}
