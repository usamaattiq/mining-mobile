import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { PressableCard } from '@/shared/components/PressableCard';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { palette, radius, spacing } from '@/theme';
import type { InAppNotification } from '@/features/dashboard/types/notification.types';
import type { TranslateFn } from '@/shared/types/translate.types';

type NotificationRowProps = {
  item: InAppNotification;
  onPress: () => void;
  t: TranslateFn;
};

export function NotificationRow({ item, onPress, t }: NotificationRowProps): React.ReactElement {
  return (
    <PressableCard
      onPress={onPress}
      accessibilityLabel={t(item.titleKey)}
      highlighted={!item.read}
      style={styles.alignStart}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={item.icon} size={22} color={palette.pureWhite} />
      </View>
      <View style={styles.copy}>
        <View style={styles.topRow}>
          <AppText weight="bold" style={styles.title} numberOfLines={1}>
            {t(item.titleKey)}
          </AppText>
          <AppText style={styles.time}>{formatRelativeTime(item.sentAt, t)}</AppText>
        </View>
        <AppText style={styles.body} numberOfLines={2}>
          {t(item.bodyKey)}
        </AppText>
      </View>
      {!item.read ? <View style={styles.dot} /> : null}
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  alignStart: {
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  time: {
    fontSize: 11,
    color: palette.muted,
  },
  body: {
    fontSize: 13,
    color: palette.muted,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.gold,
    marginTop: spacing.sm,
  },
});
