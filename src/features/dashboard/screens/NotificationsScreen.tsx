import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { AppText } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { NotificationRow } from '@/features/dashboard/components/NotificationRow';
import { useNotificationsStore } from '@/store/notificationsStore';
import { palette } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const items = useNotificationsStore((state) => state.items);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const hasUnread = items.some((item) => !item.read);

  return (
    <GoldSheetScreen
      title={t('notifications.title')}
      left="back"
      onBackPress={navigation.goBack}
      rightSlot={
        hasUnread ? (
          <Pressable
            onPress={markAllRead}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('notifications.markAllRead')}
          >
            <AppText weight="semibold" style={styles.markAll}>
              {t('notifications.markAllRead')}
            </AppText>
          </Pressable>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title={t('notifications.emptyTitle')}
          subtitle={t('notifications.emptySubtitle')}
        />
      ) : (
        items.map((item) => (
          <NotificationRow
            key={item.id}
            item={item}
            t={t}
            onPress={() => {
              markRead(item.id);
              navigation.navigate('Dashboard', { screen: item.target });
            }}
          />
        ))
      )}
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  markAll: {
    fontSize: 13,
    color: palette.pureWhite,
  },
});
