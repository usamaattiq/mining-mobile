import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { ChatMessageDeliveryStatus } from '@/features/messages/types/conversation.types';
import type { ChatBubbleProps } from '@/features/messages/types/chatBubble.types';

const SENT_COLOR = 'rgba(255,255,255,0.85)';
const READ_COLOR = '#93C5FD';
const FAILED_COLOR = '#FCA5A5';

function DeliveryTicks({
  status,
}: {
  status: ChatMessageDeliveryStatus;
}): React.ReactElement | null {
  if (status === 'pending') {
    return (
      <View style={styles.ticks}>
        <FontAwesome name="clock-o" size={10} color={SENT_COLOR} />
      </View>
    );
  }
  if (status === 'failed') {
    return (
      <View style={styles.ticks}>
        <FontAwesome name="exclamation-circle" size={10} color={FAILED_COLOR} />
      </View>
    );
  }
  const color = status === 'read' ? READ_COLOR : SENT_COLOR;
  if (status === 'sent') {
    return (
      <View style={styles.ticks}>
        <FontAwesome name="check" size={10} color={color} />
      </View>
    );
  }
  return (
    <View style={styles.ticks}>
      <FontAwesome name="check" size={10} color={color} style={styles.tickBack} />
      <FontAwesome name="check" size={10} color={color} style={styles.tickFront} />
    </View>
  );
}

export function ChatBubble({ text, time, fromMe, status }: ChatBubbleProps): React.ReactElement {
  const delivery = fromMe ? (status ?? 'sent') : undefined;
  return (
    <View style={[styles.bubbleRow, fromMe ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      <View style={[styles.bubble, fromMe ? styles.bubbleMine : styles.bubbleTheirs]}>
        <AppText style={[styles.bubbleText, fromMe && styles.bubbleTextMine]}>{text}</AppText>
        <View style={styles.meta}>
          <AppText style={[styles.timeText, fromMe && styles.timeTextMine]}>{time}</AppText>
          {delivery ? <DeliveryTicks status={delivery} /> : null}
        </View>
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
  meta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  timeText: {
    fontSize: 10,
    color: palette.muted,
  },
  timeTextMine: {
    color: 'rgba(255,255,255,0.75)',
  },
  ticks: {
    flexDirection: 'row',
    marginLeft: 4,
    alignItems: 'flex-end',
  },
  tickBack: {
    marginRight: -4,
  },
  tickFront: {},
});
