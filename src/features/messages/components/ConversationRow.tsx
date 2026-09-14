import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { Conversation } from '@/features/messages/types/conversation.types';
import { formatMessageTime, initialsFromName } from '@/features/messages/utils/formatMessageTime';

type ConversationRowProps = {
  conversation: Conversation;
  onPress: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export function ConversationRow({
  conversation,
  onPress,
  t,
}: ConversationRowProps): React.ReactElement {
  const last = conversation.messages.at(-1);
  const unread = conversation.unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={conversation.participantName}
      style={({ pressed }) => [styles.card, cardBackShadow, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <AppText weight="bold" style={styles.avatarText}>
          {initialsFromName(conversation.participantName)}
        </AppText>
      </View>
      <View style={styles.copy}>
        <View style={styles.topRow}>
          <AppText weight="bold" style={styles.name} numberOfLines={1}>
            {conversation.participantName}
          </AppText>
          {last ? (
            <AppText style={styles.time} numberOfLines={1}>
              {formatMessageTime(last.sentAt, t)}
            </AppText>
          ) : null}
        </View>
        <AppText style={styles.listing} numberOfLines={1}>
          {conversation.listingTitle}
        </AppText>
        <View style={styles.previewRow}>
          <AppText
            weight={unread ? 'semibold' : 'regular'}
            style={[styles.preview, unread && styles.previewUnread]}
            numberOfLines={1}
          >
            {last?.text ?? ''}
          </AppText>
          {unread ? (
            <View style={styles.badge}>
              <AppText weight="semibold" style={styles.badgeText}>
                {conversation.unreadCount}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    color: palette.gold,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  time: {
    fontSize: 11,
    color: palette.muted,
  },
  listing: {
    fontSize: 12,
    color: palette.gold,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: palette.muted,
  },
  previewUnread: {
    color: palette.charcoal,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: palette.pureWhite,
  },
});
