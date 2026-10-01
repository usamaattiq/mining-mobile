import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius } from '@/theme';

type NotificationBellButtonProps = {
  onPress: () => void;
  hasUnread: boolean;
  accessibilityLabel: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function NotificationBellButton({
  onPress,
  hasUnread,
  accessibilityLabel,
  icon = 'notifications-outline',
}: NotificationBellButtonProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={22} color={palette.pureWhite} />
      {hasUnread ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 30,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 4,
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
