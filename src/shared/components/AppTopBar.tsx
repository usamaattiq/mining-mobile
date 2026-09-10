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
  variant = 'light',
  titleAlign = 'center',
  titleSize = 'md',
  style,
}: AppTopBarProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const isGold = variant === 'gold';
  const showLeftSide = left === 'back' || titleAlign === 'center';

  return (
    <View
      style={[
        styles.container,
        isGold && styles.containerGold,
        includeSafeArea && { paddingTop: insets.top + spacing.sm },
        style,
      ]}
    >
      {showLeftSide ? (
        <View style={styles.side}>
          {left === 'back' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBackPress}
              hitSlop={12}
              style={({ pressed }) => [
                styles.backButton,
                isGold && styles.backButtonGold,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={isGold ? palette.pureWhite : palette.charcoal}
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {title ? (
        <View style={[styles.titleBlock, titleAlign === 'left' && styles.titleBlockLeft]}>
          <AppText
            weight="bold"
            style={[
              styles.title,
              titleSize === 'lg' && styles.titleLg,
              titleAlign === 'left' && styles.titleLeft,
              isGold && styles.titleGold,
            ]}
            numberOfLines={1}
          >
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
  containerGold: {
    backgroundColor: palette.gold,
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
  titleBlockLeft: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    color: palette.charcoal,
  },
  titleLg: {
    fontSize: 24,
  },
  titleLeft: {
    textAlign: 'left',
  },
  titleGold: {
    color: palette.pureWhite,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  backButtonGold: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  pressed: {
    opacity: 0.75,
  },
});
