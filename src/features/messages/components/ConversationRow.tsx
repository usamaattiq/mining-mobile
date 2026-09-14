import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { PressableCard } from '@/shared/components/PressableCard';
import { InitialsAvatar } from '@/shared/components/InitialsAvatar';
import { CountBadge } from '@/shared/components/CountBadge';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { palette, spacing } from '@/theme';
import type { Conversation } from '@/features/messages/types/conversation.types';
import type { TranslateFn } from '@/shared/types/translate.types';

type ConversationRowProps = {
  conversation: Conversation;
  onPress: () => void;
  t: TranslateFn;
};

export function ConversationRow({
  conversation,
  onPress,
  t,
}: ConversationRowProps): React.ReactElement {
  const last = conversation.messages.at(-1);
  const unread = conversation.unreadCount > 0;

  return (
    <PressableCard onPress={onPress} accessibilityLabel={conversation.participantName}>
      <InitialsAvatar name={conversation.participantName} />
      <View style={styles.copy}>
        <View style={styles.topRow}>
          <AppText weight="bold" style={styles.name} numberOfLines={1}>
            {conversation.participantName}
          </AppText>
          {last ? (
            <AppText style={styles.time} numberOfLines={1}>
              {formatRelativeTime(last.sentAt, t)}
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
          <CountBadge count={conversation.unreadCount} />
        </View>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
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
});
