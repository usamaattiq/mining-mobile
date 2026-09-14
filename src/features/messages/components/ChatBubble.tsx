import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { InitialsAvatar } from '@/shared/components/InitialsAvatar';
import { palette, radius, spacing } from '@/theme';
import type { ChatBubbleProps } from '@/features/messages/types/chatBubble.types';

export function ChatBubble({ text, time, fromMe, senderName }: ChatBubbleProps): React.ReactElement {
  return (
    <View style={[styles.row, fromMe && styles.rowMine]}>
      {!fromMe && senderName ? <InitialsAvatar name={senderName} size="sm" /> : null}
      <View style={[styles.bubble, fromMe ? styles.bubbleMine : styles.bubbleTheirs]}>
        <AppText style={[styles.text, fromMe && styles.textMine]}>{text}</AppText>
        <AppText style={[styles.time, fromMe && styles.timeMine]}>{time}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    maxWidth: '100%',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  bubbleTheirs: {
    backgroundColor: palette.warmWhite,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleMine: {
    backgroundColor: palette.gold,
    borderBottomRightRadius: radius.sm,
  },
  text: {
    fontSize: 15,
    color: palette.charcoal,
  },
  textMine: {
    color: palette.pureWhite,
  },
  time: {
    fontSize: 11,
    color: palette.muted,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(255,255,255,0.8)',
  },
});
