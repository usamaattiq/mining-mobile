import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius } from '@/theme';

type NotificationBellButtonProps = {
  onPress: () => void;
  hasUnread: boolean;
  accessibilityLabel: string;
};

export function NotificationBellButton({
  onPress,
  hasUnread,
  accessibilityLabel,
}: NotificationBellButtonProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="notifications-outline" size={20} color={palette.pureWhite} />
      {hasUnread ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  unreadDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.pureWhite,
    borderWidth: 1,
    borderColor: palette.gold,
  },
  pressed: {
    opacity: 0.75,
  },
});
