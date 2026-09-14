import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { InAppNotification } from '@/features/dashboard/types/notification.types';
import { formatMessageTime } from '@/features/messages/utils/formatMessageTime';

type NotificationRowProps = {
  item: InAppNotification;
  onPress: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export function NotificationRow({ item, onPress, t }: NotificationRowProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(item.titleKey)}
      style={({ pressed }) => [
        styles.card,
        cardBackShadow,
        !item.read && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={item.icon} size={22} color={palette.pureWhite} />
      </View>
      <View style={styles.copy}>
        <View style={styles.topRow}>
          <AppText weight="bold" style={styles.title} numberOfLines={1}>
            {t(item.titleKey)}
          </AppText>
          <AppText style={styles.time}>{formatMessageTime(item.sentAt, t)}</AppText>
        </View>
        <AppText style={styles.body} numberOfLines={2}>
          {t(item.bodyKey)}
        </AppText>
      </View>
      {!item.read ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  unread: {
    backgroundColor: palette.softGold,
  },
  pressed: {
    opacity: 0.9,
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
