import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { AppTopBarProps } from '@/shared/types/appTopBar.types';

export function AppTopBar({
  left = 'none',
  title,
  onBackPress,
  rightSlot,
  includeSafeArea = true,
  style,
}: AppTopBarProps): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, includeSafeArea && { paddingTop: insets.top + spacing.sm }, style]}
    >
      <View style={styles.side}>
        {left === 'back' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBackPress}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={20} color={palette.charcoal} />
          </Pressable>
        ) : null}
      </View>

      {title ? (
        <View style={styles.titleBlock}>
          <AppText weight="bold" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
        </View>
      ) : (
        <View style={styles.titleSpacer} />
      )}

      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  side: {
    minWidth: 36,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  titleSpacer: {
    flex: 1,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    color: palette.charcoal,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  pressed: {
    opacity: 0.75,
  },
});
