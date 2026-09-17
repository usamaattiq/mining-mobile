import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { ListingContextChip } from '@/features/messages/components/ListingContextChip';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';
import { initialsFromName } from '@/shared/utils/initialsFromName';
import { palette, radius, spacing } from '@/theme';
import type { Conversation } from '@/features/messages/types/conversation.types';
import type { TranslateFn } from '@/shared/types/translate.types';

type ConversationRowProps = {
  conversation: Conversation;
  onPress: () => void;
  onPressListing?: () => void;
  t: TranslateFn;
};

type AvatarTone = 'gold' | 'sand' | 'olive' | 'copper';

const AVATAR_TONES: Record<AvatarTone, string> = {
  gold: palette.gold,
  sand: '#C4A35A',
  olive: '#8B9A5B',
  copper: '#B87333',
};

const TONE_ORDER: AvatarTone[] = ['gold', 'sand', 'olive', 'copper'];

function avatarToneFromId(id: string): AvatarTone {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % TONE_ORDER.length;
  }
  return TONE_ORDER[hash] ?? 'gold';
}

/** Stride-style inbox card: avatar, preview, then a tappable listing context chip. */
export function ConversationRow({
  conversation,
  onPress,
  onPressListing,
  t,
}: ConversationRowProps): React.ReactElement {
  const last = conversation.messages.at(-1);
  const unread = conversation.unreadCount > 0;
  const tone = avatarToneFromId(conversation.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={conversation.participantName}
      onPress={onPress}
      style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
    >
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: AVATAR_TONES[tone] }]}>
          <AppText weight="bold" style={styles.avatarInitial}>
            {initialsFromName(conversation.participantName)}
          </AppText>
        </View>

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <AppText weight="bold" style={styles.name} numberOfLines={1}>
              {conversation.participantName}
            </AppText>
            <View style={styles.meta}>
              {last ? (
                <AppText style={styles.time}>{formatRelativeTime(last.sentAt, t)}</AppText>
              ) : null}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: unread ? palette.gold : palette.muted },
                ]}
              />
            </View>
          </View>

          <AppText
            weight={unread ? 'semibold' : 'regular'}
            style={[styles.preview, unread && styles.previewUnread]}
            numberOfLines={2}
          >
            {last?.text?.trim() || t('messages.noPreview')}
          </AppText>

          <ListingContextChip
            title={conversation.listingTitle}
            category={conversation.listingCategory}
            t={t}
            onPress={onPressListing}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: radius.md,
    shadowColor: palette.charcoal,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.softGold,
    padding: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    color: palette.pureWhite,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  headerRow: {
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
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  time: {
    fontSize: 11,
    color: palette.muted,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  previewUnread: {
    color: palette.charcoal,
  },
});
