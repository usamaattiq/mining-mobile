import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { ChatBubbleProps } from '@/features/messages/types/chatBubble.types';

export function ChatBubble({ text, time, fromMe }: ChatBubbleProps): React.ReactElement {
  return (
    <View style={[styles.bubbleRow, fromMe ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      <View style={[styles.bubble, fromMe ? styles.bubbleMine : styles.bubbleTheirs]}>
        <AppText style={[styles.bubbleText, fromMe && styles.bubbleTextMine]}>{text}</AppText>
        <AppText style={[styles.timeText, fromMe && styles.timeTextMine]}>{time}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  bubbleMine: {
    backgroundColor: palette.gold,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: palette.softGold,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: palette.charcoal,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: palette.pureWhite,
  },
  timeText: {
    marginTop: 4,
    fontSize: 10,
    color: palette.muted,
    alignSelf: 'flex-end',
  },
  timeTextMine: {
    color: 'rgba(255,255,255,0.75)',
  },
});
