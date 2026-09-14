import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { AppText } from '@/shared/components/AppText';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { NotificationRow } from '@/features/dashboard/components/NotificationRow';
import { useNotificationsStore } from '@/store/notificationsStore';
import { palette, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const items = useNotificationsStore((state) => state.items);
  const markRead = useNotificationsStore((state) => state.markRead);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const hasUnread = items.some((item) => !item.read);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AppTopBar
        variant="gold"
        left="back"
        title={t('notifications.title')}
        onBackPress={navigation.goBack}
        style={styles.header}
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
      />
      <CurvedSheetScrollView>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <AppText weight="semibold" style={styles.emptyTitle}>
              {t('notifications.emptyTitle')}
            </AppText>
            <AppText style={styles.emptySubtitle}>{t('notifications.emptySubtitle')}</AppText>
          </View>
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
  markAll: {
    fontSize: 13,
    color: palette.pureWhite,
  },
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 15,
    color: palette.charcoal,
  },
  emptySubtitle: {
    fontSize: 13,
    color: palette.muted,
    textAlign: 'center',
  },
});
